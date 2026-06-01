import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/public/Hero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { ReviewsWidget } from '@/components/shared/ReviewsWidget';
import { JsonLd } from '@/components/seo/JsonLd';
import { CIDADES } from '@/data/cidades';
import { PRODUTOS } from '@/data/produtos';
import { buildLocalBusinessSchema, buildMetadata, WHATSAPP_URL } from '@/lib/seo';
import {
  ArrowRight,
  CheckCircle2,
  Wrench,
  Truck,
  Factory,
  HardHat,
  ShoppingCart,
  Clock,
  Award,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Empilhadeiras e Equipamentos Pesados no Vale do Itajaí',
  description:
    'Venda, aluguel e manutenção de empilhadeiras GLP, diesel e elétricas, além de equipamentos para construção civil. Atendemos Itajaí, Balneário Camboriú, Navegantes e região.',
  path: '/',
});

const STATS = [
  { v: '9', k: 'Cidades atendidas', icon: MapPin },
  { v: '8', k: 'Categorias de equipamento', icon: Truck },
  { v: '1h', k: 'Atendimento técnico mínimo', icon: Clock },
  { v: '100%', k: 'Equipamentos com garantia', icon: Award },
];

const APLICACOES = [
  {
    titulo: 'Indústria e Logística',
    descricao: 'Armazéns, centros de distribuição, fábricas e operações portuárias. Equipamentos GLP, diesel e elétricos com diferentes capacidades.',
    imagem: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop',
    icon: Factory,
    cta: { label: 'Empilhadeiras industriais', href: '/empilhadeiras' },
  },
  {
    titulo: 'Construção Civil',
    descricao: 'Carregadeiras, escavadeiras, retroescavadeiras, rolos e tratores de esteira para obras residenciais, comerciais e infraestrutura.',
    imagem: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80&auto=format&fit=crop',
    icon: HardHat,
    cta: { label: 'Construção Civil', href: '/construcao-civil' },
  },
  {
    titulo: 'Comércio e Varejo',
    descricao: 'Soluções compactas para supermercados, atacadistas e centros logísticos urbanos. Elétricas de lítio com baixo ruído e zero emissões.',
    imagem: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80&auto=format&fit=crop',
    icon: ShoppingCart,
    cta: { label: 'Empilhadeiras elétricas', href: '/empilhadeiras/eletricas' },
  },
];

const SERVICOS_MANUTENCAO = [
  { titulo: 'Preventiva', desc: 'Planos periódicos por horímetro.' },
  { titulo: 'Corretiva', desc: 'Diagnóstico + reparo + teste.' },
  { titulo: 'Emergencial', desc: 'Atendimento prioritário no dia.' },
  { titulo: 'Peças', desc: 'Originais e homologadas.' },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildLocalBusinessSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://fabianobratti.com',
            name: 'Fabiano Bratti Empilhadeiras',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://fabianobratti.com/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />
      <Hero />

      {/* STATS */}
      <section className="relative -mt-12 bg-transparent md:-mt-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.k}
                className={`flex items-center gap-4 px-6 py-7 ${i > 0 ? 'border-t border-ink-100 md:border-t-0 md:border-l' : ''}`}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-yellow/15 text-brand-yellow-dim">
                  <s.icon className="size-5" />
                </div>
                <div>
                  <p className="font-display text-h1 font-bold leading-none text-ink-950">{s.v}</p>
                  <p className="mt-1.5 text-small text-ink-500">{s.k}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="produtos" className="bg-white py-24 md:py-32">
        <div className="container-wide">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center gap-3 label-tracked text-ink-500">
                <span className="h-px w-8 bg-brand-yellow" aria-hidden />
                Catálogo completo
              </p>
              <h2 className="mt-4 font-display text-h1 font-bold tracking-tight text-ink-950">
                Equipamentos para <br className="hidden md:inline" />
                cada operação.
              </h2>
              <p className="mt-4 max-w-2xl text-body text-ink-500">
                Empilhadeiras industriais GLP, diesel e elétricas, mais a linha completa de
                equipamentos pesados para construção civil.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa"
            >
              Falar no WhatsApp
              <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="mt-14">
            <ProductGrid produtos={PRODUTOS} />
          </div>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-yellow/40 to-transparent" aria-hidden />
        <div className="container-wide">
          <p className="inline-flex items-center gap-3 label-tracked !text-brand-yellow">
            <span className="h-px w-8 bg-brand-yellow" aria-hidden />
            Setores que atendemos
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-h1 font-bold tracking-tight">
            Soluções para cada perfil de operação.
          </h2>
          <p className="mt-4 max-w-2xl text-body text-ink-100/70">
            Do armazém portuário ao canteiro de obras de torre. Equipamento certo, técnico próximo.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {APLICACOES.map((a) => (
              <Link
                key={a.titulo}
                href={a.cta.href}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-ink-900/60 transition-colors hover:border-brand-yellow/50"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={a.imagem}
                    alt={a.titulo}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/0" />
                  <div className="absolute left-5 top-5">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-brand-yellow text-ink-950">
                      <a.icon className="size-5" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-h3 font-semibold text-white">{a.titulo}</h3>
                  <p className="mt-2 line-clamp-3 text-small text-ink-100/75">{a.descricao}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-small font-medium text-brand-yellow">
                    {a.cta.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MANUTENÇÃO */}
      <section className="bg-surface-alt py-24 md:py-32">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative">
            <div className="relative aspect-[5/6] overflow-hidden rounded-xl bg-ink-950 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
              <Image
                src="/images/manutencao.webp"
                alt="Equipe técnica em atendimento de manutenção"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-6 -right-6 hidden rounded-xl border border-ink-100 bg-white p-5 shadow-lg md:block">
              <p className="font-display text-h2 font-bold text-ink-950">1h</p>
              <p className="mt-1 text-small text-ink-500">tempo médio<br />em Penha</p>
            </div>
            <div className="absolute -top-6 -left-6 hidden h-24 w-24 rounded bg-brand-yellow lg:block" aria-hidden />
          </div>

          <div>
            <p className="inline-flex items-center gap-3 label-tracked text-ink-500">
              <Wrench className="size-3.5 text-brand-yellow-dim" />
              Serviço técnico
            </p>
            <h2 className="mt-4 font-display text-h1 font-bold tracking-tight text-ink-950">
              Manutenção que mantém <br className="hidden md:inline" />
              sua operação rodando.
            </h2>
            <p className="mt-5 text-body text-ink-500">
              Equipe técnica certificada para todas as marcas. Relatório técnico após cada serviço,
              disponível no portal do cliente.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {SERVICOS_MANUTENCAO.map((s) => (
                <div key={s.titulo} className="flex items-start gap-3 rounded-lg border border-ink-100 bg-white p-4">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-yellow-dim" />
                  <div>
                    <p className="font-semibold text-ink-950">{s.titulo}</p>
                    <p className="mt-0.5 text-small text-ink-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/manutencao" className="btn-primary">
                Conhecer manutenção
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="btn-outline">
                Portal do cliente
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section className="bg-white py-24 md:py-32">
        <div className="container-wide">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center gap-3 label-tracked text-ink-500">
                <MapPin className="size-3.5 text-brand-yellow-dim" />
                Cobertura
              </p>
              <h2 className="mt-4 font-display text-h1 font-bold tracking-tight text-ink-950">
                9 cidades. Litoral norte SC.
              </h2>
              <p className="mt-3 max-w-xl text-body text-ink-500">
                Vendas e manutenção com base em Penha. Atendimento em até 1 hora nas cidades vizinhas.
              </p>
            </div>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CIDADES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/atendimento/${c.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-white px-5 py-5 transition-all hover:border-ink-950 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <p className="font-display text-h3 font-semibold text-ink-950">
                      {c.nome}
                    </p>
                    <p className="mt-1 text-small text-ink-500">{c.tempoAtendimentoEstimado}</p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-ink-950" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="border-t border-ink-100 bg-surface-alt py-24 md:py-32">
        <div className="container-wide">
          <p className="inline-flex items-center gap-3 label-tracked text-ink-500">
            <ShieldCheck className="size-3.5 text-brand-yellow-dim" />
            O que dizem sobre nós
          </p>
          <h2 className="mt-4 font-display text-h1 font-bold tracking-tight text-ink-950">
            Reputação construída no atendimento.
          </h2>
          <div className="mt-12">
            <ReviewsWidget />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative isolate overflow-hidden bg-ink-950 py-24 md:py-32">
        <div className="absolute inset-0 opacity-30" aria-hidden>
          <Image
            src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1600&q=80&auto=format&fit=crop"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" aria-hidden />

        <div className="container-wide relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="label-tracked !text-brand-yellow">Pronto pra começar?</p>
            <h2 className="mt-4 font-display text-h1 font-bold tracking-tight text-white">
              Encontre a máquina certa <br className="hidden md:inline" />
              para o seu negócio.
            </h2>
            <p className="mt-5 max-w-xl text-body text-ink-100/80">
              Fale com nossa equipe e receba uma proposta personalizada em até 1 hora útil.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded bg-brand-wa px-6 py-4 text-small font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-wa-dark"
            >
              Solicitar Orçamento
              <ArrowRight className="size-4" />
            </a>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center gap-2 rounded border border-white/25 bg-transparent px-6 py-4 text-small font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
            >
              Outros canais
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
