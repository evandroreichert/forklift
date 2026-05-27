import Image from 'next/image';
import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/seo';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <Image
        src="/images/empilhadeira-glp.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/60 to-ink-950/85" />

      <div className="container-wide relative flex min-h-[640px] flex-col justify-center py-24 md:min-h-[720px]">
        <p className="text-label uppercase tracking-[0.18em] text-brand-yellow">
          Fabiano Bratti Empilhadeiras
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-h1 font-bold leading-[1.05] text-white md:text-display">
          A máquina certa <br className="hidden sm:inline" />
          para o seu negócio.
        </h1>
        <p className="mt-6 max-w-xl text-body text-ink-100/85">
          Venda, aluguel e manutenção de empilhadeiras industriais e equipamentos de construção
          civil. Atendimento em toda a região do Vale do Itajaí — base em Penha · SC.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-yellow"
          >
            Solicitar Orçamento
            <span aria-hidden>→</span>
          </a>
          <Link href="#produtos" className="inline-flex items-center gap-2 rounded bg-white/10 px-6 py-3.5 text-small font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
            Ver Equipamentos
          </Link>
        </div>

        <div className="absolute right-6 top-6 hidden items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md md:flex">
          <span className="size-2 animate-pulse rounded-full bg-brand-wa" aria-hidden />
          <span className="text-small font-medium text-white">Atendimento técnico em até 1h em Penha</span>
        </div>
      </div>
    </section>
  );
}
