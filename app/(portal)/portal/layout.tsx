import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth';
import { Sidebar } from '@/components/portal/Sidebar';
import { Topbar } from '@/components/portal/Topbar';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Portal',
  description: 'Área restrita Fabiano Bratti Empilhadeiras.',
  path: '/portal',
  noIndex: true,
});

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-100">
      <Sidebar profile={profile} />
      <div className="flex flex-1 flex-col">
        <Topbar profile={profile} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
