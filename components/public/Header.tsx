'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Phone, MapPin, ChevronRight, User } from 'lucide-react';
import { PHONE, WHATSAPP_URL } from '@/lib/seo';

const NAV_ITEMS = [
  { href: '/', label: 'Início' },
  { href: '/empilhadeiras', label: 'Empilhadeiras' },
  { href: '/construcao-civil', label: 'Construção Civil' },
  { href: '/manutencao', label: 'Manutenção' },
  { href: '/contato', label: 'Contato' },
];

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Yellow accent strip */}
      <div className="h-1 w-full bg-brand-yellow" aria-hidden />

      {/* Top utility bar */}
      <div className="hidden border-b border-white/10 bg-ink-950 md:block">
        <div className="container-wide flex h-10 items-center justify-between text-[12px] text-ink-100/70">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-brand-yellow" />
              Sede em Penha · Vale do Itajaí · SC
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-brand-wa" />
              Atendimento técnico em até 1 hora
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${PHONE.replace(/\D/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-white hover:text-brand-yellow">
              <Phone className="size-3.5" />
              {PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 border-b transition-shadow ${scrolled ? 'border-white/10 shadow-lg shadow-black/30' : 'border-white/5'} bg-ink-950/95 backdrop-blur-md`}>
        <div className="container-wide flex h-16 items-center justify-between gap-6 md:h-18">
          <Logo className="brightness-0 invert" />

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-small font-medium transition-colors ${active ? 'text-brand-yellow' : 'text-ink-100/85 hover:text-white'}`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3 -bottom-px h-px bg-brand-yellow" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded border border-brand-yellow/60 bg-brand-yellow/10 px-3.5 py-2 text-small font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-ink-950"
            >
              <User className="size-4" />
              Área do Cliente
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-brand-wa px-3.5 py-2 text-small font-semibold text-white transition-colors hover:bg-brand-wa-dark"
            >
              <WaIcon />
              WhatsApp
            </a>
          </div>

          {/* Mobile drawer trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="lg:hidden" aria-label="Abrir menu">
              <Menu className="size-6 text-white" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-ink-950 border-white/10">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Navegação móvel">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded px-3 py-3 text-body font-medium text-white transition-colors hover:bg-white/5 hover:text-brand-yellow"
                  >
                    {item.label}
                    <ChevronRight className="size-4 text-ink-300" />
                  </Link>
                ))}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="mt-6 flex items-center justify-center gap-2 rounded bg-brand-wa px-4 py-3 text-body font-semibold text-white"
                >
                  <WaIcon />
                  Solicitar Orçamento
                </a>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded border border-brand-yellow px-4 py-3 text-body font-medium text-brand-yellow"
                >
                  Área do Cliente
                </Link>
                <a
                  href={`tel:${PHONE.replace(/\D/g, '')}`}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 text-center text-small text-ink-100/80"
                >
                  <Phone className="size-3.5 text-brand-yellow" />
                  {PHONE}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
