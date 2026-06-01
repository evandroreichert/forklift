import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'signatures';
const MAX_BYTES = 200_000;

function pathFor(reportId: string) {
  return `${reportId}/cliente.png`;
}

export async function uploadSignature(reportId: string, dataUrl: string): Promise<string> {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  if (!base64) throw new Error('PNG vazio');
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.byteLength > MAX_BYTES) throw new Error('Assinatura excede 200KB');

  const supabase = createAdminClient();
  const path = pathFor(reportId);
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function getSignatureSignedUrl(path: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteSignature(path: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
