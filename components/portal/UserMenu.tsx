'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { KeyRound, LogOut, X } from 'lucide-react';
import {
  changeMyPasswordAction,
  logoutAction,
  type ChangePasswordState,
} from '@/app/(portal)/portal/actions';
import type { Profile } from '@/lib/types';

const ROLE_LABEL: Record<Profile['role'], string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  client: 'Cliente',
};

const INITIAL: ChangePasswordState = { message: null, error: null };

export function UserMenu({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setShowChangePassword(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const iniciais = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full bg-brand-yellow text-small font-bold text-ink-950 transition-transform hover:scale-105"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu do usuário"
      >
        {iniciais}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-white/10 bg-ink-900 p-1 shadow-xl">
          <div className="border-b border-white/10 px-3 py-3">
            <p className="truncate text-small font-semibold text-white">{profile.full_name}</p>
            <p className="mt-0.5 text-xs text-ink-100/60">{ROLE_LABEL[profile.role]}</p>
          </div>

          {showChangePassword ? (
            <ChangePasswordPanel
              onClose={() => setShowChangePassword(false)}
              onSuccess={() => {
                setShowChangePassword(false);
                setOpen(false);
              }}
            />
          ) : (
            <div className="space-y-0.5 py-1">
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-small text-ink-100/85 transition-colors hover:bg-white/5 hover:text-white"
              >
                <KeyRound className="size-4" />
                Trocar minha senha
              </button>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-small text-ink-100/85 transition-colors hover:bg-white/5 hover:text-red-300"
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChangePasswordPanel({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(changeMyPasswordAction, INITIAL);

  // Fecha após sucesso (depois de mostrar a mensagem por um segundo)
  useEffect(() => {
    if (state.message) {
      const t = setTimeout(onSuccess, 1500);
      return () => clearTimeout(t);
    }
  }, [state.message, onSuccess]);

  return (
    <form action={formAction} className="space-y-3 p-3">
      <div className="flex items-center justify-between">
        <p className="text-small font-semibold text-white">Trocar minha senha</p>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-100/60 hover:text-white"
          aria-label="Cancelar"
        >
          <X className="size-4" />
        </button>
      </div>
      <label className="block">
        <span className="text-xs text-ink-100/70">Nova senha (mínimo 6 caracteres)</span>
        <input
          type="password"
          name="nova_senha"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-small text-white"
        />
      </label>
      <label className="block">
        <span className="text-xs text-ink-100/70">Confirmar senha</span>
        <input
          type="password"
          name="confirmar"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-small text-white"
        />
      </label>
      {state.error && <p className="text-xs text-red-300">{state.error}</p>}
      {state.message && <p className="text-xs text-emerald-300">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-yellow px-3 py-2 text-small font-semibold text-ink-950 disabled:opacity-60"
      >
        {pending ? 'Salvando…' : 'Salvar nova senha'}
      </button>
    </form>
  );
}
