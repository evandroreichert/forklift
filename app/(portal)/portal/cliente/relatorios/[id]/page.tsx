import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportFieldsCard } from '@/components/portal/ReportFieldsCard';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';

export default async function ClienteVerRelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole('client');
  const supabase = await createClient();

  // RLS bloqueia se não for approved da própria company
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
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Relatório</p>
          <h1 className="mt-2 font-display text-h2 font-bold text-white">
            {report.titulo || '(sem título)'}
            {report.numero ? ` · #${report.numero}` : ''}
          </h1>
          {report.approved_at && (
            <p className="mt-1 text-small text-ink-100/60">
              Emitido em {new Date(report.approved_at).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <a
          href={`/portal/relatorios/${id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black hover:brightness-110"
        >
          <Download className="size-4" />
          Baixar PDF
        </a>
      </header>
      <ReportFieldsCard
        report={{ ...report, intervals: intervals ?? [] }}
        signatureUrl={signatureUrl}
      />
    </div>
  );
}
