'use client';

import { Check, AlertCircle, Loader2, CloudUpload } from 'lucide-react';

export type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error';

export function AutoSaveStatus({
  state,
  lastSavedAt,
}: {
  state: AutoSaveState;
  lastSavedAt?: Date | null;
}) {
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-small text-ink-100/70">
        <Loader2 className="size-3.5 animate-spin" /> Salvando...
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-small text-red-400">
        <AlertCircle className="size-3.5" /> Sem conexão. Tente novamente.
      </span>
    );
  }
  if (state === 'saved' && lastSavedAt) {
    const hh = String(lastSavedAt.getHours()).padStart(2, '0');
    const mm = String(lastSavedAt.getMinutes()).padStart(2, '0');
    return (
      <span className="inline-flex items-center gap-1.5 text-small text-emerald-400">
        <Check className="size-3.5" /> Salvo às {hh}:{mm}
      </span>
    );
  }
  // idle: o form acabou de abrir e ninguém digitou ainda. Mostra hint sobre auto-save
  // pra mecânico não achar que precisa salvar manualmente.
  return (
    <span className="inline-flex items-center gap-1.5 text-small text-ink-100/55">
      <CloudUpload className="size-3.5" /> Salvamento automático ativo
    </span>
  );
}
