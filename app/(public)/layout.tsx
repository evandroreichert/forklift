import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { WhatsAppWidget } from '@/components/shared/WhatsAppWidget';
import { GAScript } from '@/components/shared/GAScript';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/seo';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppWidget />
      <GAScript />
    </>
  );
}
