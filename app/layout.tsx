import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fabiano Bratti Empilhadeiras',
  description: 'Empilhadeiras e equipamentos para construção civil — Vale do Itajaí',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
