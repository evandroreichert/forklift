'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/public/Logo';
import { Wrench, LogOut, Users, Building2, LayoutDashboard, ClipboardList } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { logoutAction } from '@/app/(portal)/portal/actions';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_BY_ROLE: Record<Profile['role'], NavItem[]> = {
  admin: [
    { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/admin/relatorios', label: 'Relatórios', icon: ClipboardList },
    { href: '/portal/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/portal/admin/clientes', label: 'Clientes', icon: Building2 },
  ],
  mechanic: [
    { href: '/portal/mecanico/relatorios', label: 'Relatórios', icon: Wrench },
  ],
  client: [
    { href: '/portal/cliente/relatorios', label: 'Relatórios', icon: ClipboardList },
  ],
};

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const nav = NAV_BY_ROLE[profile.role];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900 md:flex">
      <div className="border-b border-white/10 p-6">
        <Logo className="brightness-0 invert" />
      </div>

      <nav className="flex-1 p-4" aria-label="Navegação do portal">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-2.5 text-small font-medium transition-colors ${
                    active
                      ? 'bg-brand-yellow/10 text-brand-yellow'
                      : 'text-ink-100/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={logoutAction} className="border-t border-white/10 p-4">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded border border-white/10 px-3 py-2 text-small text-ink-100/70 transition-colors hover:border-brand-yellow hover:text-brand-yellow"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </form>
    </aside>
  );
}
