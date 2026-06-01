import type { Metadata } from 'next';
import { CategoryHero } from '@/components/public/CategoryHero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { getProdutosByCategoria } from '@/data/produtos';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Equipamentos para Construção Civil no Vale do Itajaí',
  description:
    'Carregadeiras, escavadeiras hidráulicas, retroescavadeiras, rolos compactadores e tratores de esteira para obras e construção civil. Vendas e aluguel na região de Itajaí.',
  path: '/construcao-civil',
});

export default function ConstrucaoCivilPage() {
  const produtos = getProdutosByCategoria('construcao-civil');
  return (
    <>
      <CategoryHero
        label="Categoria"
        titulo="Equipamentos para construção civil"
        descricao="Linha completa de equipamentos pesados para obras, terraplanagem e pavimentação. Atendemos obras residenciais, comerciais e de infraestrutura em toda a região."
      />
      <section className="bg-white py-24">
        <div className="container-wide">
          <ProductGrid produtos={produtos} />
        </div>
      </section>
    </>
  );
}
