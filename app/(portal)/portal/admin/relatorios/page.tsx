import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';

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

  return (
    <div className="space-y-10">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Manutenção</p>
        <h1 className="mt-2 font-display text-h1 font-bold text-white">Relatórios</h1>
        <p className="mt-2 text-small text-ink-100/60">
          Aprovação completa chega na próxima fatia — por enquanto você consegue ver a fila.
        </p>
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
