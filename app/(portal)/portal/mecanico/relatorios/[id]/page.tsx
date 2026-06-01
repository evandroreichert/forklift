import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportFieldsCard } from '@/components/portal/ReportFieldsCard';
import { RejectedBanner } from '@/components/portal/RejectedBanner';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';
import { reopenRejected } from '../actions';

export default async function VerRelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report || report.mechanic_id !== profile.id) notFound();

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

  async function reopen() {
    'use server';
    const res = await reopenRejected(id);
    if (res.ok) redirect(`/portal/mecanico/relatorios/${id}/editar`);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Relatório</p>
          <h1 className="mt-2 font-display text-h2 font-bold text-white">
            {report.titulo || '(sem título)'}
            {report.numero ? ` · #${report.numero}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {report.status === 'approved' && (
            <a
              href={`/portal/relatorios/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-small text-white hover:border-brand-yellow/40"
            >
              <Download className="size-4" />
              Baixar PDF
            </a>
          )}
          {(report.status === 'draft' || report.status === 'rejected') && (
            <Link
              href={`/portal/mecanico/relatorios/${id}/editar`}
              className="rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black"
            >
              Editar
            </Link>
          )}
        </div>
      </header>

      {report.status === 'rejected' && report.rejected_reason && (
        <div className="space-y-3">
          <RejectedBanner reason={report.rejected_reason} />
          <form action={reopen}>
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-4 py-2 text-small font-semibold text-black"
            >
              Reabrir e editar
            </button>
          </form>
        </div>
      )}

      <ReportFieldsCard
        report={{ ...report, intervals: intervals ?? [] }}
        signatureUrl={signatureUrl}
      />
    </div>
  );
}
