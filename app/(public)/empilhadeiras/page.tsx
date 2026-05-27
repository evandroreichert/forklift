import type { Metadata } from 'next';
import { CategoryHero } from '@/components/public/CategoryHero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { getProdutosByCategoria } from '@/data/produtos';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Empilhadeiras GLP, Diesel e Elétricas — Venda e Aluguel em Itajaí',
  description:
    'Empilhadeiras industriais GLP, diesel e elétricas (lítio) para indústria, logística e armazéns no Vale do Itajaí. Venda, aluguel e manutenção.',
  path: '/empilhadeiras',
});

export default function EmpilhadeirasPage() {
  const produtos = getProdutosByCategoria('empilhadeiras');
  return (
    <>
      <CategoryHero
        label="Categoria"
        titulo="Empilhadeiras industriais"
        descricao="GLP, diesel ou elétrica com bateria de lítio. Modelos para diferentes capacidades, ambientes internos e externos, com suporte e manutenção em toda a região do Vale do Itajaí."
      />
      <section className="bg-paper-50 py-24">
        <div className="container-wide">
          <ProductGrid produtos={produtos} />
        </div>
      </section>
    </>
  );
}
