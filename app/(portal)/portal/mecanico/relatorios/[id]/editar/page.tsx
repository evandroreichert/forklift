import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';
import { EditarForm } from './EditarForm';

export default async function EditarRelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report || report.mechanic_id !== profile.id) notFound();
  if (report.status !== 'draft' && report.status !== 'rejected') notFound();

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
    <EditarForm
      report={report}
      initialIntervals={intervals ?? []}
      signatureUrl={signatureUrl}
    />
  );
}
