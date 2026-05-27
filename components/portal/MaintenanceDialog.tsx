'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { formatBRL, formatDate } from '@/lib/utils';
import type { Manutencao } from '@/lib/types';
import { Download } from 'lucide-react';

export function MaintenanceDialog({
  manutencao,
  open,
  onOpenChange,
}: {
  manutencao: Manutencao | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!manutencao) return null;
  const eq = EQUIPAMENTOS_DEMO.find((e) => e.id === manutencao.equipamentoId);

  function handleDownloadPdf() {
    alert('PDF mock — esta funcionalidade será implementada na próxima fase.');
  }

  return (
    <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent className="max-w-2xl border-white/10 bg-ink-900 text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-h2 font-bold text-white">
            {eq?.modelo}
          </DialogTitle>
          <DialogDescription className="font-mono text-small text-ink-100/60">
            Série {eq?.serie} • Manutenção em {formatDate(manutencao.data)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <p className="text-label uppercase tracking-wider text-ink-100/55">Descrição</p>
            <p className="mt-2 text-body text-ink-100/90">{manutencao.descricao}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-label uppercase tracking-wider text-ink-100/55">Tipo</p>
              <p className="mt-1.5 text-small text-white capitalize">{manutencao.tipo}</p>
            </div>
            <div>
              <p className="text-label uppercase tracking-wider text-ink-100/55">Técnico</p>
              <p className="mt-1.5 text-small text-white">{manutencao.tecnico}</p>
            </div>
            {manutencao.horimetroNaData != null && (
              <div>
                <p className="text-label uppercase tracking-wider text-ink-100/55">Horímetro</p>
                <p className="mt-1.5 font-mono text-small text-white">{manutencao.horimetroNaData} h</p>
              </div>
            )}
            {manutencao.custo != null && (
              <div>
                <p className="text-label uppercase tracking-wider text-ink-100/55">Custo</p>
                <p className="mt-1.5 font-mono text-small text-white">{formatBRL(manutencao.custo)}</p>
              </div>
            )}
          </div>

          {manutencao.pecasTrocadas && manutencao.pecasTrocadas.length > 0 && (
            <div>
              <p className="text-label uppercase tracking-wider text-ink-100/55">Peças trocadas</p>
              <ul className="mt-2 divide-y divide-white/10 rounded-lg border border-white/10">
                {manutencao.pecasTrocadas.map((p, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-small">
                    <span className="text-white">{p.nome}</span>
                    <span className="font-mono text-ink-100/60">×{p.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {manutencao.proximaSugerida && (
            <div className="rounded-lg border border-brand-yellow/30 bg-brand-yellow/5 p-4">
              <p className="text-label uppercase tracking-wider text-brand-yellow">Próxima manutenção sugerida</p>
              <p className="mt-1.5 text-small text-white">{formatDate(manutencao.proximaSugerida)}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded border border-brand-yellow px-5 py-2.5 text-small font-semibold uppercase tracking-wider text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-ink-950"
            >
              <Download className="size-4" />
              Baixar PDF
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
