import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductGrid } from '@/components/public/ProductGrid';
import { CIDADES, getCidadeBySlug } from '@/data/cidades';
import { PRODUTOS } from '@/data/produtos';
import { buildLocalBusinessSchema, buildMetadata, buildWhatsAppUrl } from '@/lib/seo';

export async function generateStaticParams() {
  return CIDADES.map((c) => ({ cidade: c.slug }));
}

interface Props {
  params: Promise<{ cidade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params;
  const c = getCidadeBySlug(cidade);
  if (!c) return { title: 'Não encontrado' };
  return buildMetadata({
    title: `Empilhadeiras e Manutenção em ${c.nome} — ${c.uf}`,
    description: `Venda, aluguel e manutenção de empilhadeiras em ${c.nome}/${c.uf}. Atendimento técnico ${c.tempoAtendimentoEstimado}. Fabiano Bratti Empilhadeiras.`,
    path: `/atendimento/${c.slug}`,
  });
}

export default async function AtendimentoCidadePage({ params }: Props) {
  const { cidade } = await params;
  const c = getCidadeBySlug(cidade);
  if (!c) notFound();

  const whatsappUrl = buildWhatsAppUrl(
    `Olá, sou de ${c.nome}. Gostaria de informações sobre empilhadeiras / manutenção. Vim através do site.`,
  );

  return (
    <>
      <JsonLd data={buildLocalBusinessSchema(c.nomeCompleto)} />

      <section className="border-b border-ink-100 bg-surface-alt py-20">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Atendimento Local</span>
          <h1 className="mt-4 max-w-3xl font-display text-h1 text-ink-950">
            Empilhadeiras e manutenção em {c.nome}
          </h1>
          <p className="mt-6 max-w-3xl text-body text-ink-500">{c.descricaoEconomica}</p>
          <p className="mt-6 max-w-3xl text-body text-ink-500">
            Atendemos {c.nome} com venda, aluguel e manutenção de empilhadeiras GLP, diesel e
            elétricas, além de equipamentos para construção civil. Tempo médio de atendimento
            técnico: <span className="text-brand-yellow">{c.tempoAtendimentoEstimado}</span>.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:scale-105 transition-transform"
          >
            Falar com atendimento em {c.nome}
          </a>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-white py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Equipamentos para {c.nome}</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">
            Linha completa de equipamentos
          </h2>
          <p className="mt-3 max-w-2xl text-body text-ink-500">
            Empilhadeiras industriais e equipamentos pesados disponíveis para venda e aluguel em {c.nome}.
          </p>
          <div className="mt-12">
            <ProductGrid produtos={PRODUTOS} />
          </div>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-surface-alt py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Manutenção em {c.nome}</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">
            Manutenção técnica especializada
          </h2>
          <p className="mt-6 max-w-2xl text-body text-ink-500">
            Manutenção preventiva, corretiva e atendimento emergencial em {c.nome}. Técnicos
            certificados, peças originais e relatório técnico após cada serviço.
          </p>
          <Link
            href="/manutencao"
            className="mt-8 inline-block border border-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-brand-yellow hover:bg-brand-yellow hover:text-ink-950"
          >
            Conhecer serviço de manutenção
          </Link>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Outras cidades</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">Também atendemos</h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {CIDADES.filter((other) => other.slug !== c.slug).map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/atendimento/${other.slug}`}
                  className="block border border-ink-100 px-4 py-2 text-small text-ink-950 hover:border-brand-yellow hover:text-brand-yellow"
                >
                  {other.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
