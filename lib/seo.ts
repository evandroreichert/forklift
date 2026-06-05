import type { Metadata } from 'next';

export const SITE_URL = 'https://fabianobratti.com';
export const SITE_NAME = 'Fabiano Bratti Empilhadeiras';
export const COMPANY_LEGAL_NAME = 'FABIANO BRATTI E CIA LTDA';
export const COMPANY_CNPJ = '50.982.211/0001-45';
export const DEFAULT_DESCRIPTION =
  'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.';
export const DEFAULT_OG_IMAGE = '/images/un-br-glp.jpg';
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

export function buildServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Manutenção de Empilhadeiras',
    provider: { '@type': 'LocalBusiness', name: SITE_NAME, url: SITE_URL },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: GEO.latitude,
        longitude: GEO.longitude,
      },
      geoRadius: 100000, // 100 km — raio emergencial
    },
    description:
      'Manutenção preventiva, corretiva e atendimento emergencial para empilhadeiras de todas as marcas e modelos. 90% dos casos resolvidos no mesmo dia dentro de 100 km da base em Penha/SC.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de manutenção',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Manutenção preventiva',
            description:
              'Planos periódicos com revisões agendadas conforme horímetro. Evita paradas inesperadas e prolonga vida útil do equipamento.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Manutenção corretiva',
            description:
              'Reparo de falhas e quebras com diagnóstico técnico, troca de peças originais ou homologadas e teste de operação.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Atendimento emergencial',
            description:
              'Para clientes com equipamentos fora de operação. Atendemos em até 100 km da base, com 90% dos casos resolvidos no mesmo dia.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Peças e suprimentos',
            description: 'Fornecimento de peças originais e de reposição para diversas marcas.',
          },
        },
      ],
    },
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
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
