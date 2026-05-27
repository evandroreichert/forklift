'use client';

import { Badge } from '@/components/ui/badge';
import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { formatDate } from '@/lib/utils';
import type { Manutencao } from '@/lib/types';

const statusLabel = {
  concluida: { label: 'Concluída', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  em_andamento: { label: 'Em andamento', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  agendada: { label: 'Agendada', className: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
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
      className="block w-full rounded-lg border border-white/10 bg-ink-900 p-6 text-left transition-colors hover:border-brand-yellow/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label uppercase tracking-wider text-ink-100/55">{formatDate(manutencao.data)}</p>
          <h3 className="mt-2 truncate font-display text-h3 font-semibold text-white">
            {eq?.modelo ?? 'Equipamento'}
          </h3>
          <p className="mt-1 font-mono text-small text-ink-100/60">{eq?.serie}</p>
        </div>
        <Badge className={`shrink-0 border ${status.className}`}>{status.label}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-small">
        <span className="text-ink-100/55">Tipo:</span>
        <span className="text-white">{tipoLabel[manutencao.tipo]}</span>
        <span className="text-white/20">|</span>
        <span className="text-ink-100/55">Técnico:</span>
        <span className="text-white">{manutencao.tecnico}</span>
      </div>
    </button>
  );
}
