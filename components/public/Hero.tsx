import Image from 'next/image';
import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/seo';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper-100">
      <div className="container-wide grid items-center gap-12 py-20 md:grid-cols-[1.1fr_1fr] md:py-28 lg:py-32">
        <div className="relative z-10">
          <p className="label-tracked">[ 01 / Equipamentos ]</p>
          <h1 className="mt-6 font-display text-display font-extrabold tracking-tight text-ink-950">
            Indústria que <br />movimenta tudo.
          </h1>
          <p className="mt-6 max-w-lg text-body text-ink-500">
            Empilhadeiras, equipamentos pesados e manutenção técnica especializada para operações que não podem parar. Atendemos toda a região litorânea de Santa Catarina.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#produtos"
              className="bg-brand-yellow px-7 py-3.5 font-mono text-small font-semibold uppercase tracking-wider text-ink-950 transition-transform hover:scale-[1.02]"
            >
              Explorar
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-small uppercase tracking-wider text-ink-500 transition-colors hover:text-ink-950"
            >
              _ Falar no WhatsApp →
            </a>
          </div>
          <div className="mt-12 flex items-baseline gap-6 font-mono text-label uppercase text-ink-500">
            <span>_ Vale do Itajaí / SC</span>
            <span className="opacity-60">v.2026</span>
          </div>
        </div>

        <div className="relative aspect-[5/6] overflow-hidden border border-paper-300 bg-paper-50">
          <Image
            src="/images/empilhadeira-glp.jpeg"
            alt="Empilhadeira GLP em operação"
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute left-4 top-4 bg-brand-yellow px-3 py-1 font-mono text-label uppercase text-ink-950">
            Em destaque
          </div>
        </div>
      </div>

      <div className="border-t border-paper-200">
        <div className="container-wide grid grid-cols-2 gap-px bg-paper-200 md:grid-cols-4">
          {[
            { k: 'Cidades atendidas', v: '9' },
            { k: 'Categorias', v: '8' },
            { k: 'Atendimento mínimo', v: '1h' },
            { k: 'Sede', v: 'Penha · SC' },
          ].map((s) => (
            <div key={s.k} className="bg-paper-100 px-6 py-6">
              <p className="font-display text-h3 font-bold text-ink-950">{s.v}</p>
              <p className="mt-1 font-mono text-label uppercase text-ink-500">{s.k}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
