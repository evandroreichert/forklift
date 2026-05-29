import { notFound } from 'next/navigation';
import { MaquinaForm } from '@/components/portal/admin/MaquinaForm';
import { createClient } from '@/lib/supabase/server';
import { updateMaquinaAction } from '../actions';

export default async function EditarMaquinaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: maquina }, { data: empresas }] = await Promise.all([
    supabase.from('machines').select('*').eq('id', id).single(),
    supabase.from('client_companies').select('id, name').order('name'),
  ]);

  if (!maquina) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Editar máquina</h1>
      <MaquinaForm action={updateMaquinaAction.bind(null, id)} initial={maquina} empresas={empresas ?? []} />
    </div>
  );
}
