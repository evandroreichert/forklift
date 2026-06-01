'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { novoRelatorioEmail } from '@/lib/email/templates/novoRelatorio';
import { uploadSignature } from '@/lib/storage/signatures';
import { validateForSubmit } from '@/lib/reports/validate';
import type { ReportEditable, ReportUpdate } from '@/lib/reports/types';

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const EDITABLE_FIELDS = [
  'titulo',
  'cliente_nome',
  'maquina_identificador',
  'horimetro',
  'is_preventiva',
  'is_corretiva',
  'maquina_parada',
  'sumario_defeitos',
  'produtos',
  'responsavel_nome',
  'assinatura_path',
] as const satisfies readonly (keyof ReportEditable)[];

export async function createDraft(): Promise<ActionResult<{ id: string }>> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      mechanic_id: profile.id,
      cliente_nome: '',
      titulo: '',
      maquina_identificador: '',
      horimetro: 0,
      maquina_parada: false,
      sumario_defeitos: '',
      is_preventiva: false,
      is_corretiva: true,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/portal/mecanico/relatorios');
  return { ok: true, data: { id: data.id } };
}

export async function updateDraft(
  reportId: string,
  fields: Partial<ReportEditable>,
): Promise<ActionResult> {
  await requireRole('mechanic');
  const supabase = await createClient();

  const payload: Partial<ReportEditable> = {};
  for (const k of EDITABLE_FIELDS) {
    if (k in fields) {
      (payload as Record<typeof k, ReportEditable[typeof k]>)[k] = fields[k] as ReportEditable[typeof k];
    }
  }

  const { error } = await supabase.from('reports').update(payload).eq('id', reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
  return { ok: true };
}

export async function upsertInterval(
  reportId: string,
  interval: { id?: string; ordem: number; inicio: string; fim: string | null },
): Promise<ActionResult<{ id: string }>> {
  await requireRole('mechanic');
  const supabase = await createClient();

  if (interval.id) {
    const { data, error } = await supabase
      .from('report_intervals')
      .update({ ordem: interval.ordem, inicio: interval.inicio, fim: interval.fim })
      .eq('id', interval.id)
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
    return { ok: true, data: { id: data.id } };
  }

  const { data, error } = await supabase
    .from('report_intervals')
    .insert({
      report_id: reportId,
      ordem: interval.ordem,
      inicio: interval.inicio,
      fim: interval.fim,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
  return { ok: true, data: { id: data.id } };
}

export async function deleteInterval(
  intervalId: string,
  reportId: string,
): Promise<ActionResult> {
  await requireRole('mechanic');
  const supabase = await createClient();
  const { error } = await supabase.from('report_intervals').delete().eq('id', intervalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
  return { ok: true };
}

export async function uploadSignatureAction(
  reportId: string,
  pngBase64: string,
): Promise<ActionResult<{ path: string }>> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report, error: rErr } = await supabase
    .from('reports')
    .select('id, mechanic_id, status')
    .eq('id', reportId)
    .single();
  if (rErr || !report) return { ok: false, error: 'Relatório não encontrado' };
  if (report.mechanic_id !== profile.id) return { ok: false, error: 'Sem permissão' };
  if (report.status !== 'draft' && report.status !== 'rejected')
    return { ok: false, error: 'Relatório não está editável' };

  try {
    const path = await uploadSignature(reportId, pngBase64);
    const upd = await supabase.from('reports').update({ assinatura_path: path }).eq('id', reportId);
    if (upd.error) return { ok: false, error: upd.error.message };
    return { ok: true, data: { path } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha no upload' };
  }
}

export async function submitReport(reportId: string): Promise<ActionResult> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();
  if (!report) return { ok: false, error: 'Relatório não encontrado' };
  if (report.mechanic_id !== profile.id) return { ok: false, error: 'Sem permissão' };
  if (report.status !== 'draft' && report.status !== 'rejected')
    return { ok: false, error: 'Status não permite envio' };

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('inicio, fim')
    .eq('report_id', reportId)
    .order('ordem', { ascending: true });

  const errors = validateForSubmit(report, intervals ?? []);
  if (errors.length > 0) {
    return { ok: false, error: errors.map((e) => e.message).join('; ') };
  }

  const submitPayload: ReportUpdate = {
    status: 'pending_approval',
    submitted_at: new Date().toISOString(),
  };
  if (report.status === 'rejected') {
    submitPayload.rejected_reason = null;
    submitPayload.rejected_at = null;
  }

  const { error: upErr } = await supabase
    .from('reports')
    .update(submitPayload)
    .eq('id', reportId);
  if (upErr) return { ok: false, error: upErr.message };

  try {
    let emails: string[] = [];
    const override = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
    if (override) {
      emails = [override];
    } else {
      // fallback: emails dos profiles com role=admin no auth.users
      const adminClient = createAdminClient();
      const { data: admins } = await adminClient
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .eq('active', true);
      for (const a of admins ?? []) {
        const { data: u } = await adminClient.auth.admin.getUserById(a.id);
        if (u.user?.email) emails.push(u.user.email);
      }
    }

    if (emails.length > 0) {
      const { subject, html } = novoRelatorioEmail({
        reportId,
        mechanicName: profile.full_name,
        clienteNome: report.cliente_nome,
        maquinaIdentificador: report.maquina_identificador,
        horimetro: Number(report.horimetro),
        siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
      });
      await sendEmail({ to: emails, subject, html });
    }
  } catch (err) {
    console.error('[submitReport] notificação ao admin falhou:', err);
  }

  revalidatePath('/portal/mecanico/relatorios');
  revalidatePath(`/portal/mecanico/relatorios/${reportId}`);
  return { ok: true };
}

export async function reopenRejected(reportId: string): Promise<ActionResult> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('mechanic_id, status')
    .eq('id', reportId)
    .single();
  if (!report || report.mechanic_id !== profile.id)
    return { ok: false, error: 'Sem permissão' };
  if (report.status !== 'rejected')
    return { ok: false, error: 'Status não permite reabertura' };

  const { error } = await supabase
    .from('reports')
    .update({ status: 'draft', rejected_reason: null, rejected_at: null })
    .eq('id', reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/portal/mecanico/relatorios/${reportId}`);
  return { ok: true };
}

export async function deleteDraft(reportId: string): Promise<ActionResult> {
  await requireRole('mechanic');
  const supabase = await createClient();
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('status', 'draft');
  if (error) return { ok: false, error: error.message };
  revalidatePath('/portal/mecanico/relatorios');
  return { ok: true };
}
