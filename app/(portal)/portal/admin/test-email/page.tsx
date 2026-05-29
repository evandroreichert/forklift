'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendTestEmailAction, type TestEmailState } from './actions';

const INITIAL: TestEmailState = { message: null, error: null };

export default function TestEmailPage() {
  const [state, formAction, pending] = useActionState(sendTestEmailAction, INITIAL);

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-display text-h2 font-bold text-white">Teste de Email</h1>
        <p className="mt-2 text-small text-ink-100/60">Valida setup do Resend.</p>
      </div>
      <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-ink-900/60 p-6">
        <div>
          <Label htmlFor="to" className="text-ink-100">Enviar para</Label>
          <Input
            id="to"
            name="to"
            type="email"
            required
            className="mt-2 border-white/15 bg-ink-950/50 text-white"
            placeholder="seu@email.com"
          />
        </div>
        {state.error && <p className="text-small text-red-300">{state.error}</p>}
        {state.message && <p className="text-small text-emerald-300">{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white disabled:opacity-50"
        >
          {pending ? 'Enviando…' : 'Enviar teste'}
        </button>
      </form>
    </div>
  );
}
