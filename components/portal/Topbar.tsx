import { Bell } from 'lucide-react';
import { CLIENTE_DEMO } from '@/data/mock/cliente';

export function Topbar() {
  const iniciais = CLIENTE_DEMO.nomeEmpresa
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <header className="flex h-14 items-center justify-between border-b border-ink-700 bg-ink-900 px-6">
      <span className="text-label uppercase text-ink-300">Modo demonstração</span>
      <div className="flex items-center gap-4">
        <button
          className="text-ink-300 hover:text-brand-yellow"
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
