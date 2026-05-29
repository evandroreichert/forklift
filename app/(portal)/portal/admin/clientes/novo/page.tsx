import { ClienteForm } from '@/components/portal/admin/ClienteForm';
import { createClienteAction } from '../actions';

export default function NovoClientePage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Novo cliente</h1>
      <ClienteForm action={createClienteAction} />
    </div>
  );
}
