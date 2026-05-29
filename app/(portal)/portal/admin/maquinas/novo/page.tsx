import { MaquinaForm } from '@/components/portal/admin/MaquinaForm';
import { createClient } from '@/lib/supabase/server';
import { createMaquinaAction } from '../actions';

export default async function NovaMaquinaPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from('client_companies').select('id, name').eq('active', true).order('name');

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Nova máquina</h1>
      <MaquinaForm action={createMaquinaAction} empresas={empresas ?? []} />
    </div>
  );
}
