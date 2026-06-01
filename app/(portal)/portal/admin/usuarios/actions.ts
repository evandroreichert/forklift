'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';
import { translateError } from '@/lib/errors/translate';

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
  if (userErr || !user.user) return { error: translateError(userErr) };

  const { error: profErr } = await admin.from('profiles').insert({
    id: user.user.id,
    full_name,
    role,
    client_company_id,
  });
  if (profErr) {
    // rollback: deletar user que criamos
    await admin.auth.admin.deleteUser(user.user.id);
    return { error: translateError(profErr) };
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
  if (error) return { error: translateError(error) };

  revalidatePath('/portal/admin/usuarios');
  redirect('/portal/admin/usuarios');
}

export type DeleteUsuarioState = { error: string | null };

export async function deleteUsuarioAction(
  userId: string,
  _prev: DeleteUsuarioState,
): Promise<DeleteUsuarioState> {
  const profile = await requireRole('admin');

  if (userId === profile.id) {
    return { error: 'Você não pode excluir a própria conta.' };
  }

  const admin = createAdminClient();

  // Bloqueia exclusão se o usuário tem relatórios associados (autor ou aprovador)
  const { count: autorou } = await admin
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('mechanic_id', userId);

  const { count: aprovou } = await admin
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('approved_by', userId);

  const total = (autorou ?? 0) + (aprovou ?? 0);
  if (total > 0) {
    return {
      error: `Não é possível excluir: este usuário está vinculado a ${total} relatório(s). Exclua ou reatribua os relatórios primeiro, ou desative a conta (toggle Ativo).`,
    };
  }

  // auth.users CASCADE → profiles via FK
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: translateError(error) };

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
  if (error) return { message: null, error: translateError(error) };

  return { message: 'Senha atualizada. Comunique ao usuário.', error: null };
}
