import type { Metadata } from 'next';
import { AuthGate } from '@/components/portal/AuthGate';
import { Sidebar } from '@/components/portal/Sidebar';
import { Topbar } from '@/components/portal/Topbar';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Portal do Cliente',
  description: 'Área restrita para clientes Fabiano Bratti Empilhadeiras.',
  path: '/portal',
  noIndex: true,
});

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
