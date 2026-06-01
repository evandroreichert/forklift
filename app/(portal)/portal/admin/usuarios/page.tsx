import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

const ROLE_LABEL = { admin: 'Admin', mechanic: 'Mecânico', client: 'Cliente' } as const;

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const { q, role } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('*, client_companies(name)')
    .order('full_name');
  if (q) query = query.ilike('full_name', `%${q}%`);
  if (role && (role === 'admin' || role === 'mechanic' || role === 'client')) {
    query = query.eq('role', role);
  }
  const { data: profiles } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Usuários</h1>
        <Link href="/portal/admin/usuarios/novo" className="inline-flex items-center gap-2 rounded bg-brand-yellow px-4 py-2 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white">
          <Plus className="size-4" /> Novo usuário
        </Link>
      </div>
      <form className="flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar nome…"
          className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white placeholder:text-ink-300"
        />
        <select name="role" defaultValue={role ?? ''} className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white">
          <option value="">Todos os papéis</option>
          <option value="admin">Admin</option>
          <option value="mechanic">Mecânico</option>
          <option value="client">Cliente</option>
        </select>
        <button type="submit" className="rounded border border-white/15 px-4 py-2 text-small text-white hover:border-brand-yellow">
          Filtrar
        </button>
      </form>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-small">
          <thead className="bg-white/[0.03] text-label uppercase tracking-wider text-ink-100/60">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Papel</th>
              <th className="px-4 py-3 text-left">Empresa</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => {
              const empresaNome = (p as unknown as { client_companies: { name: string } | null }).client_companies?.name ?? '—';
              return (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{p.full_name}</td>
                  <td className="px-4 py-3 text-ink-100/70">{ROLE_LABEL[p.role]}</td>
                  <td className="px-4 py-3 text-ink-100/70">{empresaNome}</td>
                  <td className="px-4 py-3">
                    <span className={p.active ? 'text-emerald-300' : 'text-ink-100/40'}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/portal/admin/usuarios/${p.id}`} className="text-brand-yellow hover:underline">Editar</Link>
                  </td>
                </tr>
              );
            })}
            {(profiles ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-100/50">Nenhum usuário.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
