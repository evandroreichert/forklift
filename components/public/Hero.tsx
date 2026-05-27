import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/seo';

export function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-ink-950">
      <video
        className="absolute inset-0 size-full object-cover opacity-50"
        src="/videos/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/empilhadeira-glp.jpeg"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/60 to-ink-950" />
      <div className="container-wide relative flex h-full flex-col justify-center">
        <span className="label-tracked text-brand-yellow">— Forklift Solutions</span>
        <h1 className="mt-6 max-w-3xl font-display text-display font-light text-ink-50">
          Produtividade <span className="font-bold">sem compromissos.</span>
        </h1>
        <p className="mt-6 max-w-xl text-body text-ink-300">
          Empilhadeiras e equipamentos pesados para operações que não podem parar. Venda, aluguel e
          manutenção especializada no Vale do Itajaí.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#produtos"
            className="border border-brand-yellow bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-transparent hover:text-brand-yellow"
          >
            Ver equipamentos
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:border-brand-yellow hover:text-brand-yellow"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
