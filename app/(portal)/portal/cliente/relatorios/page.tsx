import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';
import { PageHeader } from '@/components/portal/ui/PageHeader';

export default async function ClienteRelatoriosPage() {
  await requireRole('client');
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('numero', { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Manutenção"
        title="Relatórios"
        description="Histórico de serviços realizados nas suas máquinas. Toque num relatório pra ver os detalhes ou no ícone à direita pra baixar o PDF."
      />
      <ReportsList
        reports={reports ?? []}
        basePath="/portal/cliente/relatorios"
        emptyMessage="Quando seu técnico finalizar uma manutenção e o admin aprovar, ela aparece aqui — com PDF pra baixar."
      />
    </div>
  );
}
