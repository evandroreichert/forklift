import { UsuarioForm } from '@/components/portal/admin/UsuarioForm';
import { createClient } from '@/lib/supabase/server';
import { createUsuarioAction } from '../actions';

export default async function NovoUsuarioPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from('client_companies').select('id, name').eq('active', true).order('name');

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Novo usuário</h1>
      <UsuarioForm action={createUsuarioAction} empresas={empresas ?? []} mode="create" />
    </div>
  );
}
