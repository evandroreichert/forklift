import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportFieldsCard } from '@/components/portal/ReportFieldsCard';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';
import { AprovarRejeitarForm } from './AprovarRejeitarForm';

const STATUS_LABEL = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
} as const;

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

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

  const { data: companies } = await supabase
    .from('client_companies')
    .select('id, name')
    .eq('active', true)
    .order('name', { ascending: true });

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

      {report.status === 'approved' && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-5 space-y-2">
          <p className="text-small text-emerald-200">
            Aprovado em {report.approved_at ? new Date(report.approved_at).toLocaleString('pt-BR') : '—'}
          </p>
          <div className="grid gap-2 sm:grid-cols-3 text-small">
            <div>
              <span className="text-ink-100/60">Serviços:</span>{' '}
              <strong className="text-white">{BRL.format(Number(report.preco_servicos ?? 0))}</strong>
            </div>
            <div>
              <span className="text-ink-100/60">Peças:</span>{' '}
              <strong className="text-white">{BRL.format(Number(report.preco_pecas ?? 0))}</strong>
            </div>
            <div>
              <span className="text-ink-100/60">Total:</span>{' '}
              <strong className="text-white">{BRL.format(Number(report.preco_total ?? 0))}</strong>
            </div>
          </div>
        </div>
      )}

      {report.status === 'rejected' && report.rejected_reason && (
        <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-4 space-y-2">
          <p className="text-small font-semibold text-orange-200">Rejeitado</p>
          <p className="text-small text-orange-100/90 whitespace-pre-wrap">{report.rejected_reason}</p>
          <p className="text-xs text-ink-100/50">
            {report.rejected_at ? new Date(report.rejected_at).toLocaleString('pt-BR') : ''}
          </p>
        </div>
      )}

      <ReportFieldsCard
        report={{ ...report, intervals: intervals ?? [] }}
        signatureUrl={signatureUrl}
      />

      {report.status === 'pending_approval' && (
        <AprovarRejeitarForm reportId={id} companies={companies ?? []} />
      )}
    </div>
  );
}
