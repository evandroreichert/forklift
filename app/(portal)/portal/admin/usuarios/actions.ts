'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export type UsuarioFormState = { error: string | null };

const ROLE_VALUES: UserRole[] = ['admin', 'mechanic', 'client'];

export async function createUsuarioAction(
  _prev: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  await requireRole('admin');

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const full_name = String(formData.get('full_name') ?? '').trim();
  const roleRaw = String(formData.get('role') ?? '');
  const client_company_id = String(formData.get('client_company_id') ?? '').trim() || null;

  if (!email || !password || !full_name) return { error: 'Nome, email e senha são obrigatórios.' };
  if (!ROLE_VALUES.includes(roleRaw as UserRole)) return { error: 'Papel inválido.' };
  const role = roleRaw as UserRole;
  if (password.length < 6) return { error: 'Senha mínima de 6 caracteres.' };
  if (role === 'client' && !client_company_id) return { error: 'Cliente requer empresa.' };
  if (role !== 'client' && client_company_id) return { error: 'Só usuários cliente têm empresa.' };

  const admin = createAdminClient();
  const { data: user, error: userErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userErr || !user.user) return { error: `Erro Auth: ${userErr?.message ?? 'desconhecido'}` };

  const { error: profErr } = await admin.from('profiles').insert({
    id: user.user.id,
    full_name,
    role,
    client_company_id,
  });
  if (profErr) {
    // rollback: deletar user que criamos
    await admin.auth.admin.deleteUser(user.user.id);
    return { error: `Erro profile: ${profErr.message}` };
  }

  revalidatePath('/portal/admin/usuarios');
  redirect('/portal/admin/usuarios');
}

export async function updateUsuarioAction(
  id: string,
  _prev: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  await requireRole('admin');

  const full_name = String(formData.get('full_name') ?? '').trim();
  const roleRaw = String(formData.get('role') ?? '');
  const client_company_id = String(formData.get('client_company_id') ?? '').trim() || null;
  const active = formData.get('active') === 'on';

  if (!full_name) return { error: 'Nome é obrigatório.' };
  if (!ROLE_VALUES.includes(roleRaw as UserRole)) return { error: 'Papel inválido.' };
  const role = roleRaw as UserRole;
  if (role === 'client' && !client_company_id) return { error: 'Cliente requer empresa.' };

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({
    full_name, role, client_company_id: role === 'client' ? client_company_id : null, active,
  }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/usuarios');
  redirect('/portal/admin/usuarios');
}

export type ResetSenhaState = { message: string | null; error: string | null };

export async function resetSenhaAction(
  userId: string,
  _prev: ResetSenhaState,
  formData: FormData,
): Promise<ResetSenhaState> {
  await requireRole('admin');
  const newPassword = String(formData.get('new_password') ?? '');
  if (newPassword.length < 6) return { message: null, error: 'Mínimo 6 caracteres.' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { message: null, error: error.message };

  return { message: 'Senha atualizada. Comunique ao usuário.', error: null };
}
