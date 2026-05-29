'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetSenhaAction, type ResetSenhaState } from '@/app/(portal)/portal/admin/usuarios/actions';

const INITIAL: ResetSenhaState = { message: null, error: null };

export function ResetSenhaButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = resetSenhaAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(boundAction, INITIAL);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-white/15 px-4 py-2 text-small text-white hover:border-brand-yellow"
      >
        Resetar senha
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded border border-white/15 bg-ink-950/40 p-4">
      <Label htmlFor="new_password" className="text-ink-100">Nova senha temporária</Label>
      <Input
        id="new_password"
        name="new_password"
        type="text"
        required
        minLength={6}
        className="border-white/15 bg-ink-950/50 text-white"
      />
      {state.error && <p className="text-small text-red-300">{state.error}</p>}
      {state.message && <p className="text-small text-emerald-300">{state.message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded bg-brand-yellow px-4 py-2 text-small font-bold text-ink-950 disabled:opacity-50">
          {pending ? 'Resetando…' : 'Confirmar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/15 px-4 py-2 text-small text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
