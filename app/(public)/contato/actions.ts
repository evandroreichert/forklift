'use server';

import { sendEmail } from '@/lib/email';
import { translateError } from '@/lib/errors/translate';

export type ContactState = { message: string | null; error: string | null };

const MAX_LEN = 5000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactMessageAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot anti-bot: campo escondido que humanos não preenchem
  const honeypot = String(formData.get('website') ?? '').trim();
  if (honeypot) {
    // Bot caiu na isca. Finge sucesso pra não dar pista, mas não manda email.
    return { message: 'Mensagem enviada. Entraremos em contato em breve.', error: null };
  }

  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const telefone = String(formData.get('telefone') ?? '').trim();
  const mensagem = String(formData.get('mensagem') ?? '').trim();

  if (!nome) return { message: null, error: 'Nome é obrigatório.' };
  if (!email || !email.includes('@'))
    return { message: null, error: 'Email inválido.' };
  if (!telefone) return { message: null, error: 'Telefone é obrigatório.' };
  if (!mensagem) return { message: null, error: 'Mensagem é obrigatória.' };
  if (mensagem.length > MAX_LEN)
    return { message: null, error: `Mensagem muito longa (máximo ${MAX_LEN} caracteres).` };

  const destino = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (!destino) {
    console.error('[contato] ADMIN_NOTIFICATION_EMAIL não configurado');
    return {
      message: null,
      error: 'Configuração de email indisponível. Use o WhatsApp ou telefone.',
    };
  }

  try {
    await sendEmail({
      to: destino,
      subject: `[FB site] Mensagem de contato — ${nome}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#111;line-height:1.6">
          <h2 style="color:#bfa600">Nova mensagem pelo site</h2>
          <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Telefone:</strong> ${escapeHtml(telefone)}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
          <p style="white-space:pre-wrap"><strong>Mensagem:</strong><br />${escapeHtml(mensagem)}</p>
        </div>
      `,
    });
    return {
      message: 'Mensagem enviada. Entraremos em contato em até 24h em dias úteis.',
      error: null,
    };
  } catch (err) {
    console.error('[contato] falha ao enviar:', err);
    return { message: null, error: translateError(err) };
  }
}
