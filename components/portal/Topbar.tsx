import { Bell } from 'lucide-react';
import { CLIENTE_DEMO } from '@/data/mock/cliente';

export function Topbar() {
  const iniciais = CLIENTE_DEMO.nomeEmpresa
    .split(' ')
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-ink-900 px-6">
      <span className="inline-flex items-center gap-2 text-label uppercase tracking-wider text-ink-100/60">
        <span className="size-1.5 rounded-full bg-brand-yellow" aria-hidden />
        Modo demonstração
      </span>
      <div className="flex items-center gap-4">
        <button
          className="relative text-ink-100/70 transition-colors hover:text-brand-yellow"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
          <span className="absolute -top-0.5 right-0 size-1.5 rounded-full bg-brand-yellow" />
        </button>
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-yellow text-small font-bold text-ink-950">
          {iniciais}
        </div>
      </div>
    </header>
  );
}
