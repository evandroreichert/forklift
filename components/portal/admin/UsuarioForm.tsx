'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile, ClientCompany, UserRole } from '@/lib/types';

type Action = (prev: { error: string | null }, fd: FormData) => Promise<{ error: string | null }>;

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  client: 'Cliente (acesso de leitura)',
};

export function UsuarioForm({
  action,
  initial,
  empresas,
  mode,
}: {
  action: Action;
  initial?: Profile & { email?: string };
  empresas: Pick<ClientCompany, 'id' | 'name'>[];
  mode: 'create' | 'edit';
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [role, setRole] = useState<UserRole>(initial?.role ?? 'mechanic');

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-white/10 bg-ink-900/60 p-6">
      <div>
        <Label htmlFor="full_name" className="text-ink-100">Nome completo *</Label>
        <Input id="full_name" name="full_name" required defaultValue={initial?.full_name ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
      </div>

      {mode === 'create' && (
        <>
          <div>
            <Label htmlFor="email" className="text-ink-100">Email *</Label>
            <Input id="email" name="email" type="email" required className="mt-2 border-white/15 bg-ink-950/50 text-white" />
          </div>
          <div>
            <Label htmlFor="password" className="text-ink-100">Senha temporária *</Label>
            <Input id="password" name="password" type="text" required minLength={6} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
            <p className="mt-1 text-[12px] text-ink-100/55">Mínimo 6 caracteres. Comunique ao usuário via WhatsApp.</p>
          </div>
        </>
      )}

      {mode === 'edit' && initial?.email && (
        <div>
          <Label className="text-ink-100">Email</Label>
          <p className="mt-2 rounded border border-white/10 bg-ink-950/30 px-3 py-2 text-small text-ink-100/60">{initial.email}</p>
        </div>
      )}

      <div>
        <Label htmlFor="role" className="text-ink-100">Papel *</Label>
        <select
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
        >
          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {role === 'client' && (
        <div>
          <Label htmlFor="client_company_id" className="text-ink-100">Empresa *</Label>
          <select
            id="client_company_id"
            name="client_company_id"
            required
            defaultValue={initial?.client_company_id ?? ''}
            className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
          >
            <option value="">Selecione…</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      )}

      {mode === 'edit' && (
        <label className="flex items-center gap-3 text-small text-ink-100">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-4" />
          Conta ativa (desmarque pra impedir login)
        </label>
      )}

      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">{state.error}</p>
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
