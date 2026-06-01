'use server';

import { requireRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { translateError } from '@/lib/errors/translate';

export type TestEmailState = { message: string | null; error: string | null };

export async function sendTestEmailAction(
  _prev: TestEmailState,
  formData: FormData,
): Promise<TestEmailState> {
  await requireRole('admin');

  const habilitada =
    process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_EMAIL_PAGE === '1';
  if (!habilitada) {
    return { message: null, error: 'Rota desabilitada em produção.' };
  }
  const to = String(formData.get('to') ?? '').trim();
  if (!to.includes('@')) {
    return { message: null, error: 'Forneça um email válido.' };
  }

  try {
    await sendEmail({
      to,
      subject: 'Teste de configuração — Portal FB Empilhadeiras',
      html: '<p>Se você está vendo este email, o Resend está configurado corretamente.</p>',
    });
    return { message: `Email enviado para ${to}.`, error: null };
  } catch (e) {
    return { message: null, error: translateError(e) };
  }
}
