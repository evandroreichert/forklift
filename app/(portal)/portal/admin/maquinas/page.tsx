import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

export default async function MaquinasPage({ searchParams }: { searchParams: Promise<{ q?: string; cliente?: string }> }) {
  const { q, cliente } = await searchParams;
  const supabase = await createClient();

  const { data: empresas } = await supabase
    .from('client_companies').select('id, name').order('name');

  let qb = supabase
    .from('machines')
    .select('*, client_companies(name)')
    .order('numero_maquina');
  if (cliente) qb = qb.eq('client_company_id', cliente);
  if (q) qb = qb.ilike('numero_maquina', `%${q}%`);
  const { data: maquinas } = await qb;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Máquinas</h1>
        <Link href="/portal/admin/maquinas/novo" className="inline-flex items-center gap-2 rounded bg-brand-yellow px-4 py-2 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white">
          <Plus className="size-4" /> Nova máquina
        </Link>
      </div>
      <form className="flex flex-wrap gap-3">
        <select
          name="cliente"
          defaultValue={cliente ?? ''}
          className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
        >
          <option value="">Todos os clientes</option>
          {(empresas ?? []).map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar nº…"
          className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white placeholder:text-ink-300"
        />
        <button type="submit" className="rounded border border-white/15 px-4 py-2 text-small text-white hover:border-brand-yellow">
          Filtrar
        </button>
      </form>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
        <table className="w-full text-small">
          <thead className="bg-white/[0.03] text-label uppercase tracking-wider text-ink-100/60">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Nº</th>
              <th className="px-4 py-3 text-left">Horímetro</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(maquinas ?? []).map((m) => {
              const empresaNome = (m as unknown as { client_companies: { name: string } | null }).client_companies?.name ?? '—';
              return (
                <tr key={m.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{empresaNome}</td>
                  <td className="px-4 py-3 text-ink-100/80">{m.numero_maquina}</td>
                  <td className="px-4 py-3 text-ink-100/70">{m.horimetro_atual}</td>
                  <td className="px-4 py-3 text-ink-100/70">{m.modelo ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={m.active ? 'text-emerald-300' : 'text-ink-100/40'}>
                      {m.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/portal/admin/maquinas/${m.id}`} className="text-brand-yellow hover:underline">Editar</Link>
                  </td>
                </tr>
              );
            })}
            {(maquinas ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-100/50">Nenhuma máquina.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
