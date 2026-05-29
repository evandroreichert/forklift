import { notFound } from 'next/navigation';
import { ClienteForm } from '@/components/portal/admin/ClienteForm';
import { createClient } from '@/lib/supabase/server';
import { updateClienteAction } from '../actions';

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from('client_companies').select('*').eq('id', id).single();

  if (!cliente) notFound();

  const boundAction = updateClienteAction.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Editar cliente</h1>
      <ClienteForm action={boundAction} initial={cliente} />
    </div>
  );
}
