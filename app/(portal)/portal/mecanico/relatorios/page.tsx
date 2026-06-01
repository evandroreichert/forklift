import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';
import { createDraft } from './actions';

export default async function MeusRelatoriosPage() {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('mechanic_id', profile.id)
    .order('updated_at', { ascending: false });

  async function novoRelatorio() {
    'use server';
    const res = await createDraft();
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error('Falha ao criar');
    redirect(`/portal/mecanico/relatorios/${res.data.id}/editar`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Manutenção</p>
          <h1 className="mt-2 font-display text-h1 font-bold text-white">Meus relatórios</h1>
        </div>
        <form action={novoRelatorio}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black"
          >
            <Plus className="size-4" />
            Novo relatório
          </button>
        </form>
      </div>
      <ReportsList
        reports={reports ?? []}
        basePath="/portal/mecanico/relatorios"
        emptyMessage="Nenhum relatório ainda. Clique em 'Novo relatório' pra começar."
      />
    </div>
  );
}
