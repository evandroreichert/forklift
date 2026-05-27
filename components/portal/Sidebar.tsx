'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/public/Logo';
import { CLIENTE_DEMO } from '@/data/mock/cliente';
import { logout } from '@/lib/auth-mock';
import { Wrench, LogOut } from 'lucide-react';

const NAV = [{ href: '/portal', label: 'Manutenções', icon: Wrench }];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-100 bg-surface-alt md:flex">
      <div className="border-b border-ink-100 p-6">
        <Logo />
      </div>

      <nav className="flex-1 p-4" aria-label="Navegação do portal">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-2 text-small font-medium ${
                    active
                      ? 'bg-ink-100 text-brand-yellow'
                      : 'text-ink-950 hover:bg-ink-100/50'
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

      <div className="border-t border-ink-100 p-4">
        <p className="text-label text-ink-500">Cliente</p>
        <p className="mt-1 truncate text-small font-medium text-ink-950">
          {CLIENTE_DEMO.nomeEmpresa}
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-2 rounded border border-ink-100 px-3 py-2 text-small text-ink-500 hover:border-brand-yellow hover:text-brand-yellow"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
