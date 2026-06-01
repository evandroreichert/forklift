'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { relatorioAprovadoEmail } from '@/lib/email/templates/relatorioAprovado';
import { relatorioRejeitadoEmail } from '@/lib/email/templates/relatorioRejeitado';

type ActionResult = { ok: true } | { ok: false; error: string };

type ApproveInput = {
  reportId: string;
  clientCompanyId: string;
  precoServicos: number;
  precoPecas: number;
  precoTotal: number;
};

export async function approveReport(input: ApproveInput): Promise<ActionResult> {
  const profile = await requireRole('admin');
  const supabase = await createClient();

  if (!input.clientCompanyId) return { ok: false, error: 'Selecione a empresa-cliente' };
  if (input.precoServicos < 0 || input.precoPecas < 0 || input.precoTotal < 0)
    return { ok: false, error: 'Valores não podem ser negativos' };

  const { data: report } = await supabase
    .from('reports')
    .select('id, status, mechanic_id, cliente_nome, titulo')
    .eq('id', input.reportId)
    .single();
  if (!report) return { ok: false, error: 'Relatório não encontrado' };
  if (report.status !== 'pending_approval')
    return { ok: false, error: 'Só relatórios pendentes podem ser aprovados' };

  // Próximo número sequencial: continua de 145 (último do sistema antigo).
  // Mesma semântica que private.next_report_numero() — calculado em JS porque
  // o schema private não é exposto via PostgREST.
  const adminCli = createAdminClient();
  const { data: maxRow } = await adminCli
    .from('reports')
    .select('numero')
    .not('numero', 'is', null)
    .order('numero', { ascending: false })
    .limit(1)
    .maybeSingle();
  const numero = ((maxRow?.numero ?? 145) as number) + 1;

  const { error: upErr } = await supabase
    .from('reports')
    .update({
      status: 'approved',
      numero,
      client_company_id: input.clientCompanyId,
      preco_servicos: input.precoServicos,
      preco_pecas: input.precoPecas,
      preco_total: input.precoTotal,
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', input.reportId);
  if (upErr) return { ok: false, error: upErr.message };

  try {
    const { data: u } = await adminCli.auth.admin.getUserById(report.mechanic_id);
    if (u.user?.email) {
      const { subject, html } = relatorioAprovadoEmail({
        reportId: input.reportId,
        numero,
        titulo: report.titulo,
        clienteNome: report.cliente_nome,
        siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
      });
      await sendEmail({ to: u.user.email, subject, html });
    }
  } catch (err) {
    console.error('[approveReport] notificação ao mecânico falhou:', err);
  }

  revalidatePath('/portal/admin/relatorios');
  revalidatePath(`/portal/admin/relatorios/${input.reportId}`);
  revalidatePath('/portal');
  return { ok: true };
}

export async function rejectReport(reportId: string, motivo: string): Promise<ActionResult> {
  await requireRole('admin');
  const supabase = await createClient();

  if (!motivo.trim()) return { ok: false, error: 'Informe o motivo da rejeição' };

  const { data: report } = await supabase
    .from('reports')
    .select('id, status, mechanic_id, cliente_nome, titulo')
    .eq('id', reportId)
    .single();
  if (!report) return { ok: false, error: 'Relatório não encontrado' };
  if (report.status !== 'pending_approval')
    return { ok: false, error: 'Só relatórios pendentes podem ser rejeitados' };

  const { error: upErr } = await supabase
    .from('reports')
    .update({
      status: 'rejected',
      rejected_reason: motivo.trim(),
      rejected_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  if (upErr) return { ok: false, error: upErr.message };

  try {
    const adminCli = createAdminClient();
    const { data: u } = await adminCli.auth.admin.getUserById(report.mechanic_id);
    if (u.user?.email) {
      const { subject, html } = relatorioRejeitadoEmail({
        reportId,
        titulo: report.titulo,
        clienteNome: report.cliente_nome,
        motivo: motivo.trim(),
        siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
      });
      await sendEmail({ to: u.user.email, subject, html });
    }
  } catch (err) {
    console.error('[rejectReport] notificação ao mecânico falhou:', err);
  }

  revalidatePath('/portal/admin/relatorios');
  revalidatePath(`/portal/admin/relatorios/${reportId}`);
  return { ok: true };
}
