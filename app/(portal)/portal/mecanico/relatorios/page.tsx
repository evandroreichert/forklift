import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';
import { PageHeader } from '@/components/portal/ui/PageHeader';
import { Button } from '@/components/portal/ui/Button';
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
      <PageHeader
        kicker="Manutenção"
        title="Meus relatórios"
        action={
          <form action={novoRelatorio}>
            <Button type="submit" leftIcon={<Plus className="size-4" />}>
              <span className="sm:hidden">Novo</span>
              <span className="hidden sm:inline">Novo relatório</span>
            </Button>
          </form>
        }
      />
      <ReportsList
        reports={reports ?? []}
        basePath="/portal/mecanico/relatorios"
        emptyMessage="Você ainda não tem relatórios. Toque em ‘Novo’ no topo pra criar o primeiro."
      />
    </div>
  );
}
