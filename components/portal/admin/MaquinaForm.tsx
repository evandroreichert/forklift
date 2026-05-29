'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Machine, ClientCompany, FuelType } from '@/lib/types';

type Action = (prev: { error: string | null }, fd: FormData) => Promise<{ error: string | null }>;

const FUEL_LABELS: Record<FuelType, string> = {
  glp: 'GLP',
  diesel: 'Diesel',
  eletrica: 'Elétrica',
  gasolina: 'Gasolina',
  outro: 'Outro',
};

export function MaquinaForm({
  action,
  initial,
  empresas,
}: {
  action: Action;
  initial?: Machine;
  empresas: Pick<ClientCompany, 'id' | 'name'>[];
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-white/10 bg-ink-900/60 p-6">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="numero_maquina" className="text-ink-100">Nº da máquina *</Label>
          <Input
            id="numero_maquina"
            name="numero_maquina"
            required
            defaultValue={initial?.numero_maquina ?? ''}
            className="mt-2 border-white/15 bg-ink-950/50 text-white"
          />
        </div>
        <div>
          <Label htmlFor="horimetro_atual" className="text-ink-100">Horímetro atual *</Label>
          <Input
            id="horimetro_atual"
            name="horimetro_atual"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={initial?.horimetro_atual ?? 0}
            className="mt-2 border-white/15 bg-ink-950/50 text-white"
          />
        </div>
        <div>
          <Label htmlFor="modelo" className="text-ink-100">Modelo</Label>
          <Input id="modelo" name="modelo" defaultValue={initial?.modelo ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
        </div>
        <div>
          <Label htmlFor="fabricante" className="text-ink-100">Fabricante</Label>
          <Input id="fabricante" name="fabricante" defaultValue={initial?.fabricante ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
        </div>
        <div>
          <Label htmlFor="tipo_combustivel" className="text-ink-100">Combustível</Label>
          <select
            id="tipo_combustivel"
            name="tipo_combustivel"
            defaultValue={initial?.tipo_combustivel ?? ''}
            className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
          >
            <option value="">—</option>
            {(Object.entries(FUEL_LABELS) as [FuelType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="numero_serie" className="text-ink-100">Nº de série</Label>
          <Input id="numero_serie" name="numero_serie" defaultValue={initial?.numero_serie ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
        </div>
      </div>
      <label className="flex items-center gap-3 text-small text-ink-100">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-4" />
        Ativa
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
