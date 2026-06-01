import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';
import { AdminEditarForm } from './AdminEditarForm';

export default async function AdminEditarRelatorioPage({
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
    <AdminEditarForm
      report={report}
      initialIntervals={intervals ?? []}
      signatureUrl={signatureUrl}
      companies={companies ?? []}
    />
  );
}
