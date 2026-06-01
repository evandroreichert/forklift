import type { Metadata } from 'next';

export const SITE_URL = 'https://fabianobratti.com';
export const SITE_NAME = 'Fabiano Bratti Empilhadeiras';
export const DEFAULT_DESCRIPTION =
  'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.';
export const DEFAULT_OG_IMAGE = '/images/empilhadeira-glp.jpeg';
export const GOOGLE_BUSINESS_URL = 'https://share.google/qlJlxWgMJJtevQxeo';
export const INSTAGRAM_URL = 'https://www.instagram.com/fabianobratti.empilhadeiras/';
export const WHATSAPP_NUMBER = '5547991926463';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20vim%20atrav%C3%A9s%20do%20seu%20site`;
export const PHONE = '+55 47 99192-6463';
export const ADDRESS = {
  streetAddress: 'Penha, SC',
  addressLocality: 'Penha',
  addressRegion: 'SC',
  postalCode: '88385-000',
  addressCountry: 'BR',
};
export const GEO = { latitude: -26.7711, longitude: -48.6438 };

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    telephone: PHONE,
    address: {
      '@type': 'PostalAddress',
      ...ADDRESS,
    },
    sameAs: [GOOGLE_BUSINESS_URL, INSTAGRAM_URL],
  };
}

export function buildLocalBusinessSchema(cidadeNome?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': SITE_URL,
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    telephone: PHONE,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      ...ADDRESS,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    areaServed: cidadeNome
      ? { '@type': 'City', name: cidadeNome }
      : [
          'Penha',
          'Navegantes',
          'Balneário Piçarras',
          'Barra Velha',
          'São João do Itaperiú',
          'Itajaí',
          'Balneário Camboriú',
          'Camboriú',
          'Itapema',
          'Bombinhas',
          'Porto Belo',
          'Tijucas',
          'Ilhota',
          'Luiz Alves',
          'Gaspar',
          'Brusque',
          'Blumenau',
          'Joinville',
        ].map((n) => ({ '@type': 'City', name: n })),
    sameAs: [GOOGLE_BUSINESS_URL, INSTAGRAM_URL],
  };
}

export function buildProductSchema(produto: {
  nome: string;
  descricao: string;
  imagemCapa: string;
  slug: string;
  categoriaPai: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    description: produto.descricao,
    image: `${SITE_URL}${produto.imagemCapa}`,
    brand: { '@type': 'Brand', name: 'UN Forklift' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL',
      seller: { '@type': 'Organization', name: SITE_NAME },
      url: `${SITE_URL}/${produto.categoriaPai}/${produto.slug}`,
    },
  };
}

export function buildServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Manutenção de Empilhadeiras',
    provider: { '@type': 'LocalBusiness', name: SITE_NAME, url: SITE_URL },
    areaServed: 'Vale do Itajaí, Santa Catarina',
    description:
      'Manutenção preventiva, corretiva e atendimento emergencial para empilhadeiras de todas as marcas e modelos.',
  };
}

export function buildFaqSchema(items: { pergunta: string; resposta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  };
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
