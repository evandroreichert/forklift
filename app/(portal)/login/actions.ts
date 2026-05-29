'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Preencha email e senha.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Email ou senha inválidos.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', data.user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    return { error: 'Conta desativada. Contate o admin.' };
  }

  redirect('/portal');
}
