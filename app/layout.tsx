import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fabianobratti.com'),
  title: {
    default: 'Fabiano Bratti Empilhadeiras no Vale do Itajaí',
    template: '%s | Fabiano Bratti Empilhadeiras',
  },
  description:
    'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
