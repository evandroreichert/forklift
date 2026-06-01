import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';

export default async function ClienteRelatoriosPage() {
  await requireRole('client');
  const supabase = await createClient();

  // RLS já filtra: cliente só vê reports aprovados da própria company
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('numero', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Manutenção</p>
        <h1 className="mt-2 font-display text-h1 font-bold text-white">Relatórios</h1>
        <p className="mt-2 text-small text-ink-100/60">
          Histórico de serviços de manutenção realizados nas suas máquinas.
        </p>
      </div>
      <ReportsList
        reports={reports ?? []}
        basePath="/portal/cliente/relatorios"
        emptyMessage="Nenhum relatório aprovado ainda."
      />
    </div>
  );
}
