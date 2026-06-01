import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportFieldsCard } from '@/components/portal/ReportFieldsCard';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';

const STATUS_LABEL = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
} as const;

export default async function AdminVerRelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole('admin');
  const supabase = await createClient();

  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report) notFound();

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('*')
    .eq('report_id', id)
    .order('ordem', { ascending: true });

  let signatureUrl: string | null = null;
  if (report.assinatura_path) {
    try {
      signatureUrl = await getSignatureSignedUrl(report.assinatura_path);
    } catch {
      signatureUrl = null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Relatório</p>
        <h1 className="mt-2 font-display text-h2 font-bold text-white">
          {report.titulo || '(sem título)'}
          {report.numero ? ` · #${report.numero}` : ''}
        </h1>
        <p className="mt-1 text-small text-ink-100/60">
          Status: {STATUS_LABEL[report.status]}
        </p>
      </div>
      <ReportFieldsCard
        report={{ ...report, intervals: intervals ?? [] }}
        signatureUrl={signatureUrl}
      />
      <p className="rounded-md border border-dashed border-white/15 bg-ink-900/40 p-4 text-small text-ink-100/70">
        Botões de aprovar/rejeitar + edição de valores chegam na Fatia 3.
      </p>
    </div>
  );
}
