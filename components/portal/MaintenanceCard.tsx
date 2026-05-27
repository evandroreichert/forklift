'use client';

import { Badge } from '@/components/ui/badge';
import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { formatDate } from '@/lib/utils';
import type { Manutencao } from '@/lib/types';

const statusLabel = {
  concluida: { label: 'Concluída', className: 'bg-green-100 text-green-800 border-green-300' },
  em_andamento: { label: 'Em andamento', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  agendada: { label: 'Agendada', className: 'bg-blue-100 text-blue-800 border-blue-300' },
} as const;

const tipoLabel = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
} as const;

export function MaintenanceCard({
  manutencao,
  onClick,
}: {
  manutencao: Manutencao;
  onClick: () => void;
}) {
  const eq = EQUIPAMENTOS_DEMO.find((e) => e.id === manutencao.equipamentoId);
  const status = statusLabel[manutencao.status];

  return (
    <button
      onClick={onClick}
      className="block w-full border border-ink-100 bg-surface-alt p-6 text-left transition-colors hover:border-brand-yellow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label uppercase text-ink-500">{formatDate(manutencao.data)}</p>
          <h3 className="mt-2 truncate font-display text-h3 text-ink-950">
            {eq?.modelo ?? 'Equipamento'}
          </h3>
          <p className="mt-1 font-mono text-small text-ink-500">{eq?.serie}</p>
        </div>
        <Badge className={`shrink-0 border ${status.className}`}>{status.label}</Badge>
      </div>
      <div className="mt-4 flex items-center gap-3 text-small">
        <span className="text-ink-500">Tipo:</span>
        <span className="text-ink-950">{tipoLabel[manutencao.tipo]}</span>
        <span className="text-ink-700">|</span>
        <span className="text-ink-500">Técnico:</span>
        <span className="text-ink-950">{manutencao.tecnico}</span>
      </div>
    </button>
  );
}
