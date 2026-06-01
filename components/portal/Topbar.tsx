import { Bell } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { MobileNavTrigger } from './Sidebar';

const ROLE_LABEL: Record<Profile['role'], string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  client: 'Cliente',
};

export function Topbar({ profile }: { profile: Profile }) {
  const iniciais = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');

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
        <button
          className="relative text-ink-100/70 transition-colors hover:text-brand-yellow"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
        </button>
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-yellow text-small font-bold text-ink-950">
          {iniciais}
        </div>
      </div>
    </header>
  );
}
