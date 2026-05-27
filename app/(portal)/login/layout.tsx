import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Área do Cliente — Entrar',
  description: 'Acesso de clientes Fabiano Bratti Empilhadeiras.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
