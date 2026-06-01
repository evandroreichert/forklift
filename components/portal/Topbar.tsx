import Link from 'next/link';
import { Bell } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { MobileNavTrigger } from './Sidebar';
import { UserMenu } from './UserMenu';

const ROLE_LABEL: Record<Profile['role'], string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  client: 'Cliente',
};

async function getAdminPendingCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_approval');
  return count ?? 0;
}

export async function Topbar({ profile }: { profile: Profile }) {
  const pendingCount = profile.role === 'admin' ? await getAdminPendingCount() : 0;

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-ink-900 px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavTrigger profile={profile} />
        <span className="inline-flex items-center gap-2 truncate text-label uppercase tracking-wider text-ink-100/60">
          <span className="size-1.5 shrink-0 rounded-full bg-brand-yellow" aria-hidden />
          <span className="truncate">{ROLE_LABEL[profile.role]}</span>
        </span>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <span className="hidden text-small text-ink-100/70 md:inline">{profile.full_name}</span>
        {profile.role === 'admin' && (
          <Link
            href="/portal/admin/relatorios"
            className="relative text-ink-100/70 transition-colors hover:text-brand-yellow"
            aria-label={
              pendingCount > 0
                ? `${pendingCount} relatório(s) aguardando aprovação`
                : 'Nenhum relatório pendente'
            }
            title={pendingCount > 0 ? `${pendingCount} aguardando` : 'Sem pendências'}
          >
            <Bell className="size-5" />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-bold text-ink-950">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Link>
        )}
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
