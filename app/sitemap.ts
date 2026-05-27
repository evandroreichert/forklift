import type { MetadataRoute } from 'next';
import { PRODUTOS } from '@/data/produtos';
import { CIDADES } from '@/data/cidades';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = ['', '/empilhadeiras', '/construcao-civil', '/manutencao', '/contato'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  );

  const produtos = PRODUTOS.map((p) => ({
    url: `${SITE_URL}/${p.categoriaPai}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const cidades = CIDADES.map((c) => ({
    url: `${SITE_URL}/atendimento/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...statics, ...produtos, ...cidades];
}
