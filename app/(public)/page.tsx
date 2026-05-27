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

export const metadata: Metadata = buildMetadata({
  title: 'Empilhadeiras e Equipamentos Pesados — Vale do Itajaí',
  description:
    'Venda, aluguel e manutenção de empilhadeiras GLP, diesel e elétricas, além de equipamentos para construção civil. Atendemos Itajaí, Balneário Camboriú, Navegantes e região.',
  path: '/',
});

const STATS = [
  { v: '9', k: 'Cidades atendidas' },
  { v: '8', k: 'Categorias de equipamento' },
  { v: '1h', k: 'Atendimento técnico mínimo' },
  { v: '100%', k: 'Equipamentos com garantia' },
];

const APLICACOES = [
  {
    titulo: 'Indústria e Logística',
    descricao: 'Armazéns, centros de distribuição, fábricas e operações portuárias. Equipamentos GLP, diesel e elétricos com diferentes capacidades.',
    imagem: '/images/empilhadeira-diesel.jpeg',
  },
  {
    titulo: 'Construção Civil',
    descricao: 'Carregadeiras, escavadeiras, retroescavadeiras, rolos e tratores de esteira para obras residenciais, comerciais e infraestrutura.',
    imagem: '/images/escavadeira.jpeg',
  },
  {
    titulo: 'Comércio e Varejo',
    descricao: 'Soluções compactas para supermercados, atacadistas e centros logísticos urbanos. Elétricas de lítio com baixo ruído e zero emissões.',
    imagem: '/images/empilhadeira-eletrica.jpeg',
  },
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
      <section className="border-b border-ink-100 bg-white">
        <div className="container-wide grid grid-cols-2 gap-px bg-ink-100 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="flex flex-col items-start gap-1 bg-white px-6 py-8">
              <p className="font-display text-h1 font-bold text-ink-950">{s.v}</p>
              <p className="text-small text-ink-500">{s.k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="produtos" className="bg-white py-20 md:py-28">
        <div className="container-wide">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="label-tracked text-ink-500">Catálogo completo</p>
              <h2 className="mt-3 font-display text-h1 font-bold text-ink-950">Nossos equipamentos</h2>
              <p className="mt-3 max-w-2xl text-body text-ink-500">
                Empilhadeiras industriais e equipamentos pesados para construção civil — venda,
                aluguel e manutenção em toda a região do Vale do Itajaí.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa"
            >
              Falar no WhatsApp
              <span aria-hidden>→</span>
            </a>
          </div>
          <div className="mt-12">
            <ProductGrid produtos={PRODUTOS} />
          </div>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section className="border-y border-ink-100 bg-surface-alt py-20 md:py-28">
        <div className="container-wide">
          <p className="label-tracked text-ink-500">Setores atendidos</p>
          <h2 className="mt-3 font-display text-h1 font-bold text-ink-950">Aplicações</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-500">
            Soluções para cada perfil de operação — do armazém ao canteiro de obras.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {APLICACOES.map((a) => (
              <article key={a.titulo} className="overflow-hidden rounded-lg border border-ink-100 bg-white">
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
                  <Image
                    src={a.imagem}
                    alt={a.titulo}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-h3 font-semibold text-ink-950">{a.titulo}</h3>
                  <p className="mt-2 text-small text-ink-500">{a.descricao}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MANUTENÇÃO */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-surface-alt">
            <Image
              src="/videos/glp.mp4" // poster fallback
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              style={{ display: 'none' }}
            />
            <video
              className="absolute inset-0 size-full object-cover"
              src="/videos/glp.mp4"
              poster="/images/empilhadeira-glp.jpeg"
              controls
              preload="metadata"
            />
          </div>
          <div>
            <p className="label-tracked text-ink-500">Serviço técnico</p>
            <h2 className="mt-3 font-display text-h1 font-bold text-ink-950">
              Manutenção que mantém sua operação rodando
            </h2>
            <p className="mt-5 text-body text-ink-500">
              Equipe técnica certificada para manutenção preventiva, corretiva e atendimento
              emergencial. Atendemos todas as marcas. Relatório técnico após cada serviço — disponível
              no portal do cliente.
            </p>
            <ul className="mt-6 space-y-2 text-small text-ink-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block size-1.5 rounded-full bg-brand-yellow" aria-hidden />
                Manutenção preventiva e corretiva
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block size-1.5 rounded-full bg-brand-yellow" aria-hidden />
                Peças originais e homologadas
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block size-1.5 rounded-full bg-brand-yellow" aria-hidden />
                Atendimento em até 1 hora na região da sede
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/manutencao" className="btn-primary">Conhecer manutenção</Link>
              <Link href="/login" className="btn-outline">Portal do cliente</Link>
            </div>
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section className="border-y border-ink-100 bg-surface-alt py-20 md:py-28">
        <div className="container-wide">
          <p className="label-tracked text-ink-500">Cobertura</p>
          <h2 className="mt-3 font-display text-h1 font-bold text-ink-950">Onde atendemos</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-500">
            Vendas e manutenção em 9 cidades do litoral norte de Santa Catarina, com sede em Penha.
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
            {CIDADES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/atendimento/${c.slug}`}
                  className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-5 py-4 transition-colors hover:border-ink-950"
                >
                  <div>
                    <p className="font-display text-h3 font-semibold text-ink-950">{c.nome}</p>
                    <p className="mt-1 text-small text-ink-500">{c.tempoAtendimentoEstimado}</p>
                  </div>
                  <span aria-hidden className="text-ink-300">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-wide">
          <p className="label-tracked text-ink-500">O que dizem sobre nós</p>
          <h2 className="mt-3 font-display text-h1 font-bold text-ink-950">Avaliações de clientes</h2>
          <div className="mt-12">
            <ReviewsWidget />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-ink-950 py-20 md:py-28">
        <div className="container-wide grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="label-tracked text-brand-yellow">Pronto pra começar?</p>
            <h2 className="mt-3 font-display text-h1 font-bold text-white">
              Encontre a máquina certa para o seu negócio.
            </h2>
            <p className="mt-4 max-w-xl text-body text-ink-100/80">
              Fale com nossa equipe e receba uma proposta personalizada em até 1 hora útil.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa justify-center text-base">
              Solicitar Orçamento no WhatsApp
              <span aria-hidden>→</span>
            </a>
            <Link href="/contato" className="inline-flex items-center justify-center gap-2 rounded border border-white/30 bg-transparent px-6 py-3.5 text-small font-semibold text-white transition-colors hover:bg-white/10">
              Outros canais de contato
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
