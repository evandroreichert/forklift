import { Bell, LogOut } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { logoutAction } from '@/app/(portal)/portal/actions';

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
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-ink-900 px-6">
      <span className="inline-flex items-center gap-2 text-label uppercase tracking-wider text-ink-100/60">
        <span className="size-1.5 rounded-full bg-brand-yellow" aria-hidden />
        {ROLE_LABEL[profile.role]}
      </span>
      <div className="flex items-center gap-4">
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
        <form action={logoutAction} className="md:hidden">
          <button
            type="submit"
            className="text-ink-100/70 transition-colors hover:text-brand-yellow"
            aria-label="Sair"
          >
            <LogOut className="size-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
