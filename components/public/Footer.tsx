import Link from 'next/link';
import { Logo } from './Logo';
import { WHATSAPP_URL, INSTAGRAM_URL, GOOGLE_BUSINESS_URL, PHONE, ADDRESS } from '@/lib/seo';
import { CIDADES } from '@/data/cidades';
import { MapPin, Phone, Clock, MessageCircle, ExternalLink } from 'lucide-react';

const InstagramIcon = ({ className = 'size-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="relative isolate bg-ink-950 text-ink-100">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-yellow to-transparent" aria-hidden />

      <div className="container-wide grid gap-10 py-20 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <Logo className="brightness-0 invert" />
          <p className="mt-5 max-w-xs text-small text-ink-100/70 leading-relaxed">
            Venda, aluguel e manutenção de empilhadeiras e equipamentos pesados no Vale do Itajaí, com sede em Penha.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center rounded-full bg-brand-wa text-white transition-transform hover:scale-110"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-5" />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center rounded-full bg-brand-yellow text-ink-950 transition-transform hover:scale-110"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={GOOGLE_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow"
              aria-label="Google Maps"
            >
              <MapPin className="size-5" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="label-tracked !text-brand-yellow">Catálogo</h3>
          <ul className="mt-5 space-y-3 text-small">
            <li><Link href="/empilhadeiras" className="text-ink-100/80 hover:text-brand-yellow">Empilhadeiras</Link></li>
            <li><Link href="/construcao-civil" className="text-ink-100/80 hover:text-brand-yellow">Construção Civil</Link></li>
            <li><Link href="/manutencao" className="text-ink-100/80 hover:text-brand-yellow">Manutenção</Link></li>
            <li><Link href="/contato" className="text-ink-100/80 hover:text-brand-yellow">Contato</Link></li>
            <li><Link href="/login" className="text-ink-100/80 hover:text-brand-yellow">Área do Cliente</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="label-tracked !text-brand-yellow">Atendemos</h3>
          <ul className="mt-5 grid grid-cols-2 gap-y-2 text-small">
            {CIDADES.map((c) => (
              <li key={c.slug}>
                <Link href={`/atendimento/${c.slug}`} className="text-ink-100/80 hover:text-brand-yellow">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="label-tracked !text-brand-yellow">Contato</h3>
          <ul className="mt-5 space-y-3 text-small">
            <li>
              <a href={`tel:${PHONE.replace(/\D/g, '')}`} className="inline-flex items-center gap-2 text-ink-100/85 hover:text-brand-yellow">
                <Phone className="size-4 text-brand-yellow" />
                {PHONE}
              </a>
            </li>
            <li>
              <span className="inline-flex items-start gap-2 text-ink-100/85">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-yellow" />
                {ADDRESS.addressLocality}, {ADDRESS.addressRegion} · {ADDRESS.postalCode}
              </span>
            </li>
            <li>
              <span className="inline-flex items-center gap-2 text-ink-100/85">
                <Clock className="size-4 text-brand-yellow" />
                Seg–Sex 8h–18h · Sáb 8h–12h
              </span>
            </li>
            <li>
              <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-ink-100/70 hover:text-brand-yellow">
                <ExternalLink className="size-4" />
                Ver avaliações no Google
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-6 text-[12px] text-ink-100/55 md:flex-row">
          <p>© {new Date().getFullYear()} Fabiano Bratti Empilhadeiras · Todos os direitos reservados.</p>
          <p className="font-medium tracking-wider text-ink-100/70 uppercase">
            Penha · Santa Catarina · Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
