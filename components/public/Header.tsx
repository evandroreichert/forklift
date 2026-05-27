'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Início' },
  { href: '/empilhadeiras', label: 'Empilhadeiras' },
  { href: '/construcao-civil', label: 'Construção Civil' },
  { href: '/manutencao', label: 'Manutenção' },
  { href: '/contato', label: 'Contato' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-paper-200/50 bg-paper-50/80 backdrop-blur-md">
      <div className="container-wide flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-small font-medium text-ink-950 transition-colors hover:text-brand-yellow"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 border border-brand-yellow px-4 py-2 text-small font-medium text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-ink-950"
          >
            Área do Cliente
          </Link>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden" aria-label="Abrir menu">
            <Menu className="size-6 text-ink-950" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-paper-50 border-paper-200">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-2" aria-label="Navegação móvel">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-body font-medium text-ink-950 transition-colors hover:text-brand-yellow"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-4 border border-brand-yellow px-4 py-3 text-center text-body font-medium text-brand-yellow"
              >
                Área do Cliente
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
