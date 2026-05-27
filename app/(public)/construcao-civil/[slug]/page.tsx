import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/public/ProductDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUTOS, getProdutoBySlug } from '@/data/produtos';
import { buildMetadata, buildProductSchema } from '@/lib/seo';

export async function generateStaticParams() {
  return PRODUTOS.filter((p) => p.categoriaPai === 'construcao-civil').map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'construcao-civil') {
    return { title: 'Não encontrado' };
  }
  return buildMetadata({
    title: `${produto.nome} — Construção Civil no Vale do Itajaí`,
    description: produto.descricao.slice(0, 155),
    path: `/construcao-civil/${produto.slug}`,
    image: produto.imagemCapa,
  });
}

export default async function ConstrucaoDetailPage({ params }: Props) {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'construcao-civil') notFound();
  return (
    <>
      <JsonLd data={buildProductSchema(produto)} />
      <ProductDetail produto={produto} />
    </>
  );
}
