'use client';

import { Trash2, Plus } from 'lucide-react';
import type { ReportInterval } from '@/lib/reports/types';

type Item = Pick<ReportInterval, 'id' | 'ordem' | 'inicio' | 'fim'>;

type Props = {
  intervals: Item[];
  onUpsert: (item: {
    id?: string;
    ordem: number;
    inicio: string;
    fim: string | null;
  }) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  disabled?: boolean;
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

export function IntervalsList({ intervals, onUpsert, onDelete, disabled }: Props) {
  const sorted = [...intervals].sort((a, b) => a.ordem - b.ordem);
  const nextOrdem = sorted.length > 0 ? Math.max(...sorted.map((i) => i.ordem)) + 1 : 1;

  return (
    <div className="space-y-3">
      {sorted.map((iv) => (
        <div key={iv.id} className="rounded-lg border border-white/15 bg-ink-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-small font-semibold text-brand-yellow">
              DIA {String(iv.ordem).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="text-ink-100/70 hover:text-white"
              disabled={disabled}
              onClick={() => onDelete(iv.id)}
              aria-label="Remover intervalo"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <label className="block">
            <span className="text-small text-ink-100/70">Início</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
              disabled={disabled}
              value={toLocalInputValue(iv.inicio)}
              onChange={(e) =>
                onUpsert({
                  id: iv.id,
                  ordem: iv.ordem,
                  inicio: fromLocalInputValue(e.target.value) ?? iv.inicio,
                  fim: iv.fim,
                })
              }
            />
          </label>
          <label className="block">
            <span className="text-small text-ink-100/70">Fim</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
              disabled={disabled}
              value={toLocalInputValue(iv.fim)}
              onChange={(e) =>
                onUpsert({
                  id: iv.id,
                  ordem: iv.ordem,
                  inicio: iv.inicio,
                  fim: fromLocalInputValue(e.target.value),
                })
              }
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className="flex items-center gap-2 rounded-md border border-dashed border-white/20 px-4 py-3 text-white w-full justify-center"
        disabled={disabled}
        onClick={() => {
          const now = new Date().toISOString();
          onUpsert({ ordem: nextOrdem, inicio: now, fim: null });
        }}
      >
        <Plus className="size-4" />
        Adicionar dia / intervalo
      </button>
    </div>
  );
}
