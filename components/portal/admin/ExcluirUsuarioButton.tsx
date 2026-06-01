'use client';

import { useActionState, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  deleteUsuarioAction,
  type DeleteUsuarioState,
} from '@/app/(portal)/portal/admin/usuarios/actions';

const INITIAL: DeleteUsuarioState = { error: null };

export function ExcluirUsuarioButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteUsuarioAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(boundAction, INITIAL);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded border border-red-500/50 px-4 py-2 text-small text-red-300 hover:bg-red-500/10"
      >
        <Trash2 className="size-4" />
        Excluir usuário
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded border border-red-500/40 bg-red-500/5 p-4"
    >
      <p className="text-small text-red-200">
        Excluir <strong className="text-white">{userName}</strong>? Esta ação não pode ser desfeita.
        Se preferir só impedir o login, use o toggle <em>Ativo</em>.
      </p>
      {state.error && <p className="text-small text-red-300">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded bg-red-500 px-4 py-2 text-small font-semibold text-white hover:bg-red-600 disabled:opacity-50"
        >
          {pending ? 'Excluindo…' : 'Confirmar exclusão'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-white/15 px-4 py-2 text-small text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
