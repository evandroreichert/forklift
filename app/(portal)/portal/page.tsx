import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Building2, ClipboardList } from 'lucide-react';

async function getAdminStats() {
  const supabase = await createClient();
  const [{ count: usuarios }, { count: clientes }, { count: pendentes }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('client_companies').select('*', { count: 'exact', head: true }),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval'),
  ]);
  return {
    usuarios: usuarios ?? 0,
    clientes: clientes ?? 0,
    pendentes: pendentes ?? 0,
  };
}

export default async function PortalPage() {
  const profile = await requireProfile();

  // Mecânico e cliente não precisam de dashboard intermediário — vão direto pra lista
  if (profile.role === 'mechanic') {
    redirect('/portal/mecanico/relatorios');
  }
  if (profile.role === 'client') {
    redirect('/portal/cliente/relatorios');
  }

  // Único role que cai aqui é admin (mechanic e client foram redirecionados acima)
  const stats = await getAdminStats();
  const cards = [
    {
      href: '/portal/admin/relatorios',
      label: 'Pendentes de aprovação',
      count: stats.pendentes,
      icon: ClipboardList,
      accent: true,
    },
    {
      href: '/portal/admin/usuarios',
      label: 'Usuários',
      count: stats.usuarios,
      icon: Users,
    },
    {
      href: '/portal/admin/clientes',
      label: 'Clientes',
      count: stats.clientes,
      icon: Building2,
    },
  ];
  return (
    <div className="space-y-10">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Bem-vindo</p>
        <h1 className="mt-2 font-display text-h1 font-bold text-white">
          Olá, <span className="text-brand-yellow">{profile.full_name}</span>
        </h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, count, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className={`group rounded-xl border p-6 transition-colors ${
              accent && count > 0
                ? 'border-brand-yellow/40 bg-brand-yellow/10 hover:border-brand-yellow'
                : 'border-white/10 bg-ink-900/60 hover:border-brand-yellow/40'
            }`}
          >
            <Icon className="size-6 text-brand-yellow" />
            <p className="mt-4 text-label uppercase tracking-wider text-ink-100/60">{label}</p>
            <p className="mt-1 font-display text-h2 font-bold text-white">{count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
