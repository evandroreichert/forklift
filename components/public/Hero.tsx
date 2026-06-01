import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/seo';
import { ArrowRight, Wrench, Truck, ShieldCheck } from 'lucide-react';

const BULLETS = [
  { icon: Truck, label: 'Venda e aluguel' },
  { icon: Wrench, label: 'Manutenção técnica' },
  { icon: ShieldCheck, label: 'Peças originais' },
];

// Em prod recomenda-se hostear o vídeo externamente (Vercel Blob/R2) e setar
// NEXT_PUBLIC_HERO_VIDEO_URL pra não bloar o deploy. Sem env, usa local.
const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || '/videos/hero.mp4';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <video
        className="absolute inset-0 size-full object-cover opacity-40"
        src={HERO_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        poster="/images/empilhadeira-glp.jpeg"
        aria-hidden
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950/85 via-ink-950/55 to-ink-950/95" aria-hidden />
      {/* Yellow accent edge */}
      <div className="absolute left-0 top-0 h-1 w-32 bg-brand-yellow" aria-hidden />

      <div className="container-wide relative flex min-h-[640px] flex-col justify-center py-24 md:min-h-[760px]">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-3 text-label uppercase tracking-[0.18em] text-brand-yellow">
            <span className="h-px w-8 bg-brand-yellow" aria-hidden />
            Fabiano Bratti · Vale do Itajaí
          </p>

          <h1 className="mt-6 font-display text-h1 font-bold leading-[1.02] text-white md:text-display">
            A máquina certa <br className="hidden sm:inline" />
            para o seu <span className="text-brand-yellow">negócio.</span>
          </h1>

          <p className="mt-6 max-w-xl text-body text-ink-100/85">
            Empilhadeiras industriais e equipamentos para construção civil. Venda, aluguel
            e manutenção especializada para quem não pode parar.
          </p>

          {/* Quick bullets */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {BULLETS.map((b) => (
              <li key={b.label} className="inline-flex items-center gap-2 text-small text-ink-100/80">
                <b.icon className="size-4 text-brand-yellow" />
                {b.label}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-brand-yellow px-7 py-4 text-small font-bold uppercase tracking-wider text-ink-950 transition-all hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(255,227,75,0.6)]"
            >
              Solicitar Orçamento
              <ArrowRight className="size-4" />
            </a>
            <Link
              href="#produtos"
              className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/5 px-7 py-4 text-small font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Ver Equipamentos
            </Link>
          </div>
        </div>

        {/* Floating status badge — desktop */}
        <div className="absolute right-6 top-6 hidden items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-md md:flex">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-wa opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-brand-wa" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/70">Disponível agora</p>
            <p className="text-small font-medium text-white">Atendimento em até 1h em Penha</p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40 md:flex">
          <span className="h-8 w-px bg-white/30" aria-hidden />
          Role para explorar
        </div>
      </div>
    </section>
  );
}
