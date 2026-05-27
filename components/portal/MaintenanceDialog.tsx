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
      <DialogContent className="max-w-2xl border-paper-200 bg-paper-100 text-ink-950">
        <DialogHeader>
          <DialogTitle className="font-display text-h2 text-ink-950">
            {eq?.modelo}
          </DialogTitle>
          <DialogDescription className="font-mono text-small text-ink-500">
            Série {eq?.serie} • Manutenção em {formatDate(manutencao.data)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <p className="text-label uppercase text-ink-500">Descrição</p>
            <p className="mt-2 text-body text-ink-950">{manutencao.descricao}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-label uppercase text-ink-500">Tipo</p>
              <p className="mt-1 text-small text-ink-950 capitalize">{manutencao.tipo}</p>
            </div>
            <div>
              <p className="text-label uppercase text-ink-500">Técnico</p>
              <p className="mt-1 text-small text-ink-950">{manutencao.tecnico}</p>
            </div>
            {manutencao.horimetroNaData != null && (
              <div>
                <p className="text-label uppercase text-ink-500">Horímetro</p>
                <p className="mt-1 font-mono text-small text-ink-950">{manutencao.horimetroNaData} h</p>
              </div>
            )}
            {manutencao.custo != null && (
              <div>
                <p className="text-label uppercase text-ink-500">Custo</p>
                <p className="mt-1 font-mono text-small text-ink-950">{formatBRL(manutencao.custo)}</p>
              </div>
            )}
          </div>

          {manutencao.pecasTrocadas && manutencao.pecasTrocadas.length > 0 && (
            <div>
              <p className="text-label uppercase text-ink-500">Peças trocadas</p>
              <ul className="mt-2 divide-y divide-paper-200 border border-paper-200">
                {manutencao.pecasTrocadas.map((p, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-small">
                    <span className="text-ink-950">{p.nome}</span>
                    <span className="font-mono text-ink-500">×{p.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {manutencao.proximaSugerida && (
            <div className="border border-brand-yellow/30 bg-brand-yellow/5 p-4">
              <p className="text-label uppercase text-brand-yellow">Próxima manutenção sugerida</p>
              <p className="mt-1 text-small text-ink-950">{formatDate(manutencao.proximaSugerida)}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-paper-200 pt-4">
            <button
              onClick={handleDownloadPdf}
              className="border border-brand-yellow px-5 py-2 text-small font-semibold uppercase tracking-wider text-brand-yellow hover:bg-brand-yellow hover:text-ink-950"
            >
              Baixar PDF
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
