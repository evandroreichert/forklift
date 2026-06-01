'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  sendContactMessageAction,
  type ContactState,
} from '@/app/(public)/contato/actions';

const INITIAL: ContactState = { message: null, error: null };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessageAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa o form depois de enviar com sucesso
  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state.message]);

  if (state.message) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-display text-h3 text-ink-950">Mensagem enviada</h3>
            <p className="mt-2 text-body text-ink-500">{state.message}</p>
            <p className="mt-3 text-small text-ink-500">
              Para urgência, use o WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* Honeypot anti-bot. Escondido do humano, bot preenche. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div>
        <Label htmlFor="nome" className="text-ink-950">
          Nome
        </Label>
        <Input
          id="nome"
          name="nome"
          required
          autoComplete="name"
          className="mt-2 border-ink-100 bg-surface-alt text-ink-950"
        />
      </div>
      <div>
        <Label htmlFor="email" className="text-ink-950">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 border-ink-100 bg-surface-alt text-ink-950"
        />
      </div>
      <div>
        <Label htmlFor="telefone" className="text-ink-950">
          Telefone / WhatsApp
        </Label>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          required
          autoComplete="tel"
          className="mt-2 border-ink-100 bg-surface-alt text-ink-950"
        />
      </div>
      <div>
        <Label htmlFor="mensagem" className="text-ink-950">
          Mensagem
        </Label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={4}
          required
          maxLength={5000}
          className="mt-2 w-full rounded-md border border-ink-100 bg-surface-alt px-3 py-2 text-body text-ink-950 focus-visible:outline-2 focus-visible:outline-brand-yellow"
        />
      </div>

      {state.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-small text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
      >
        {pending ? 'Enviando…' : 'Enviar mensagem'}
      </button>
    </form>
  );
}
