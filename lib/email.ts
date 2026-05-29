import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    ...args,
  });
  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
  return result.data;
}
