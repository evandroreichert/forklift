import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/lib/types';

// React.cache dedupica chamadas dentro do mesmo request — layout e page
// que ambos chamam requireProfile() compartilham o resultado (1 getUser + 1 select
// em vez de 2x cada). Não persiste entre requests.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
});

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.active) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login?error=inactive');
  }
  return profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) redirect('/portal');
  return profile;
}
