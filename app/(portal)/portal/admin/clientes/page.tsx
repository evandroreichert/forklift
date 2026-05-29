import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('client_companies').select('*').order('name');
  if (q) query = query.or(`name.ilike.%${q}%,cnpj.ilike.%${q}%`);
  const { data: clientes } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Clientes</h1>
        <Link
          href="/portal/admin/clientes/novo"
          className="inline-flex items-center gap-2 rounded bg-brand-yellow px-4 py-2 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white"
        >
          <Plus className="size-4" /> Novo cliente
        </Link>
      </div>
      <form className="max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nome ou CNPJ…"
          className="w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white placeholder:text-ink-300"
        />
      </form>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
        <table className="w-full text-small">
          <thead className="bg-white/[0.03] text-label uppercase tracking-wider text-ink-100/60">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">CNPJ</th>
              <th className="px-4 py-3 text-left">Telefone</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(clientes ?? []).map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{c.name}</td>
                <td className="px-4 py-3 text-ink-100/70">{c.cnpj ?? '—'}</td>
                <td className="px-4 py-3 text-ink-100/70">{c.contact_phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={c.active ? 'text-emerald-300' : 'text-ink-100/40'}>
                    {c.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/portal/admin/clientes/${c.id}`} className="text-brand-yellow hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(clientes ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-100/50">Nenhum cliente.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
