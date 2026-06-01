import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Liberação geral
      { userAgent: '*', allow: '/', disallow: ['/portal', '/login'] },
      // AI crawlers explicitamente permitidos (alguns sites bloqueiam por padrão).
      // Queremos aparecer em respostas de LLMs como ChatGPT, Claude, Perplexity etc.
      { userAgent: 'GPTBot', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'Claude-Web', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'CCBot', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'Bytespider', allow: '/', disallow: ['/portal', '/login'] },
      { userAgent: 'Amazonbot', allow: '/', disallow: ['/portal', '/login'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
