import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';
import { adminCreateDraft } from './actions';

export default async function AdminRelatoriosPage() {
  await requireRole('admin');
  const supabase = await createClient();

  const { data: pendentes } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'pending_approval')
    .order('submitted_at', { ascending: false });

  const { data: outros } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['draft', 'approved', 'rejected'])
    .order('updated_at', { ascending: false })
    .limit(20);

  async function novoRelatorio() {
    'use server';
    const res = await adminCreateDraft();
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error('Falha ao criar');
    redirect(`/portal/admin/relatorios/${res.data.id}`);
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Manutenção</p>
          <h1 className="mt-2 font-display text-h1 font-bold text-white">Relatórios</h1>
          <p className="mt-2 text-small text-ink-100/60">
            Clique num pendente pra editar e finalizar. Aprovados ficam aqui em &ldquo;Outros&rdquo;
            e dá pra baixar o PDF direto pelo ícone à direita.
          </p>
        </div>
        <form action={novoRelatorio}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black hover:brightness-110"
          >
            <Plus className="size-4" />
            Novo relatório
          </button>
        </form>
      </div>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-3">
          Aguardando aprovação
        </h2>
        <ReportsList
          reports={pendentes ?? []}
          basePath="/portal/admin/relatorios"
          emptyMessage="Nenhum relatório aguardando."
        />
      </section>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-3">
          Outros (últimos 20)
        </h2>
        <ReportsList
          reports={outros ?? []}
          basePath="/portal/admin/relatorios"
          emptyMessage="Nada por aqui."
        />
      </section>
    </div>
  );
}
