import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/public/Hero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { ReviewsWidget } from '@/components/shared/ReviewsWidget';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUTOS } from '@/data/produtos';
import { buildLocalBusinessSchema, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Empilhadeiras e Equipamentos Pesados — Vale do Itajaí',
  description:
    'Venda, aluguel e manutenção de empilhadeiras GLP, diesel e elétricas, além de equipamentos para construção civil. Atendemos Itajaí, Balneário Camboriú, Navegantes e região.',
  path: '/',
});

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

      <section id="produtos" className="border-t border-paper-200 bg-paper-50 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Catálogo / 01</span>
          <h2 className="mt-4 font-display text-h1 text-ink-950">Nossos equipamentos</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-500">
            Variedade de modelos e configurações para empilhadeiras industriais e equipamentos para
            construção civil.
          </p>
          <div className="mt-16">
            <ProductGrid produtos={PRODUTOS} />
          </div>
        </div>
      </section>

      <section className="border-t border-paper-200 bg-paper-100 py-24">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="label-tracked text-brand-yellow">— Destaque / 02</span>
            <h2 className="mt-4 font-display text-h1 text-ink-950">
              Empilhadeira GLP: potência e robustez
            </h2>
            <p className="mt-6 text-body text-ink-500">
              Desempenho é a chave. A Empilhadeira GLP da UN Forklift é a resposta quando a demanda é
              alta — pronta para superar tarefas complexas e elevar sua produtividade.
            </p>
            <Link
              href="/empilhadeiras/glp"
              className="mt-8 inline-block border border-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-ink-950"
            >
              Conhecer modelo
            </Link>
          </div>
          <video
            className="aspect-video w-full border border-paper-200"
            src="/videos/glp.mp4"
            controls
            poster="/images/empilhadeira-glp.jpeg"
          />
        </div>
      </section>

      <section className="border-t border-paper-200 bg-paper-50 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Clientes / 03</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">O que dizem sobre nós</h2>
          <div className="mt-12">
            <ReviewsWidget />
          </div>
        </div>
      </section>
    </>
  );
}
