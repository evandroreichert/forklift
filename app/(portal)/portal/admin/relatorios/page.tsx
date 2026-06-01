import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';
import { PageHeader } from '@/components/portal/ui/PageHeader';
import { Button } from '@/components/portal/ui/Button';
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
      <PageHeader
        kicker="Manutenção"
        title="Relatórios"
        description="Clique num pendente pra editar e finalizar. Aprovados ficam aqui em “Outros” e dá pra baixar o PDF direto pelo ícone à direita."
        action={
          <form action={novoRelatorio}>
            <Button type="submit" leftIcon={<Plus className="size-4" />}>
              <span className="sm:hidden">Novo</span>
              <span className="hidden sm:inline">Novo relatório</span>
            </Button>
          </form>
        }
      />

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-3">
          Aguardando aprovação
        </h2>
        <ReportsList
          reports={pendentes ?? []}
          basePath="/portal/admin/relatorios"
          emptyMessage="Nenhum relatório aguardando aprovação."
        />
      </section>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-3">
          Outros (últimos 20)
        </h2>
        <ReportsList
          reports={outros ?? []}
          basePath="/portal/admin/relatorios"
          emptyMessage="Sem rascunhos, aprovados ou rejeitados aqui."
        />
      </section>
    </div>
  );
}
