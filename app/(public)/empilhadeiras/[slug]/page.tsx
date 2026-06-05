import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/public/ProductDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUTOS, getProdutoBySlug } from '@/data/produtos';
import { SITE_URL, buildBreadcrumbSchema, buildMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  return PRODUTOS.filter((p) => p.categoriaPai === 'empilhadeiras').map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'empilhadeiras') {
    return { title: 'Não encontrado' };
  }
  return buildMetadata({
    title: `${produto.nome}. Venda e Manutenção em Itajaí`,
    description: produto.descricao.slice(0, 155),
    path: `/empilhadeiras/${produto.slug}`,
    image: produto.imagemCapa,
  });
}

export default async function EmpilhadeiraDetailPage({ params }: Props) {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'empilhadeiras') notFound();
  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Início', url: SITE_URL },
    { name: 'Empilhadeiras', url: `${SITE_URL}/empilhadeiras` },
    { name: produto.nome, url: `${SITE_URL}/empilhadeiras/${produto.slug}` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ProductDetail produto={produto} />
    </>
  );
}
