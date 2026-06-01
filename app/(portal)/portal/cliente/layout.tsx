import { requireRole } from '@/lib/auth';

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  await requireRole('client');
  return <>{children}</>;
}
