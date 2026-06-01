'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireProfile } from '@/lib/auth';
import { translateError } from '@/lib/errors/translate';

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export type ChangePasswordState = { message: string | null; error: string | null };

export async function changeMyPasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  await requireProfile();

  const novaSenha = String(formData.get('nova_senha') ?? '');
  const confirmar = String(formData.get('confirmar') ?? '');

  if (novaSenha.length < 6) {
    return { message: null, error: 'Senha precisa ter no mínimo 6 caracteres.' };
  }
  if (novaSenha !== confirmar) {
    return { message: null, error: 'As duas senhas não coincidem.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) {
    return { message: null, error: translateError(error) };
  }

  return { message: 'Senha alterada com sucesso.', error: null };
}
