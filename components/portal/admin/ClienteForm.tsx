'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClientCompany } from '@/lib/types';

type Action = (prev: { error: string | null }, fd: FormData) => Promise<{ error: string | null }>;

export function ClienteForm({ action, initial }: { action: Action; initial?: ClientCompany }) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-white/10 bg-ink-900/60 p-6">
      <div>
        <Label htmlFor="name" className="text-ink-100">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial?.name ?? ''}
          className="mt-2 border-white/15 bg-ink-950/50 text-white"
        />
      </div>
      <div>
        <Label htmlFor="cnpj" className="text-ink-100">CNPJ</Label>
        <Input
          id="cnpj"
          name="cnpj"
          defaultValue={initial?.cnpj ?? ''}
          className="mt-2 border-white/15 bg-ink-950/50 text-white"
        />
      </div>
      <div>
        <Label htmlFor="contact_phone" className="text-ink-100">Telefone</Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          defaultValue={initial?.contact_phone ?? ''}
          className="mt-2 border-white/15 bg-ink-950/50 text-white"
        />
      </div>
      <label className="flex items-center gap-3 text-small text-ink-100">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-4" />
        Ativo
      </label>
      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white disabled:opacity-50"
      >
        {pending ? 'Salvando…' : 'Salvar'}
      </button>
    </form>
  );
}
