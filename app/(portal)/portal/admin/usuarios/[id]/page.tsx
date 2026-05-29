import { notFound } from 'next/navigation';
import { UsuarioForm } from '@/components/portal/admin/UsuarioForm';
import { ResetSenhaButton } from '@/components/portal/admin/ResetSenhaButton';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateUsuarioAction } from '../actions';

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profile }, { data: empresas }, { data: authUser }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('client_companies').select('id, name').order('name'),
    admin.auth.admin.getUserById(id),
  ]);

  if (!profile) notFound();

  const initial = { ...profile, email: authUser.user?.email };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Editar usuário</h1>
      <UsuarioForm
        action={updateUsuarioAction.bind(null, id)}
        initial={initial}
        empresas={empresas ?? []}
        mode="edit"
      />
      <div className="space-y-3">
        <h2 className="text-label uppercase tracking-wider text-ink-100/60">Senha</h2>
        <ResetSenhaButton userId={id} />
      </div>
    </div>
  );
}
