import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { TestEmailForm } from './TestEmailForm';

// Página de troubleshooting do Resend. Disponível só em dev ou quando
// ALLOW_TEST_EMAIL_PAGE=1 estiver setado (debug pontual em prod).
export default async function TestEmailPage() {
  await requireRole('admin');

  const habilitada =
    process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_EMAIL_PAGE === '1';
  if (!habilitada) notFound();

  return <TestEmailForm />;
}
