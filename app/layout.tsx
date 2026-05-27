import type { Metadata } from 'next';
import { Manrope, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fabianobratti.com'),
  title: {
    default: 'Fabiano Bratti Empilhadeiras — Vale do Itajaí',
    template: '%s | Fabiano Bratti Empilhadeiras',
  },
  description:
    'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
