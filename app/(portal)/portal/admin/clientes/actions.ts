'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export type ClienteFormState = { error: string | null };

function parseForm(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    cnpj: String(formData.get('cnpj') ?? '').trim() || null,
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || null,
    active: formData.get('active') === 'on',
  };
}

export async function createClienteAction(
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);
  if (!payload.name) return { error: 'Nome é obrigatório.' };

  const supabase = await createClient();
  const { error } = await supabase.from('client_companies').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/clientes');
  redirect('/portal/admin/clientes');
}

export async function updateClienteAction(
  id: string,
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);
  if (!payload.name) return { error: 'Nome é obrigatório.' };

  const supabase = await createClient();
  const { error } = await supabase.from('client_companies').update(payload).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/clientes');
  redirect('/portal/admin/clientes');
}
