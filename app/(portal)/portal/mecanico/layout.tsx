import { requireRole } from '@/lib/auth';

export default async function MecanicoLayout({ children }: { children: React.ReactNode }) {
  await requireRole('mechanic');
  return <>{children}</>;
}
