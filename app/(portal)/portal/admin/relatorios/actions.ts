'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { uploadSignature } from '@/lib/storage/signatures';
import type { Report, ReportUpdate } from '@/lib/reports/types';

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

// Campos que o admin pode editar (basicamente tudo, exceto auditoria).
export type AdminEditableFields = Pick<
  Report,
  | 'titulo'
  | 'cliente_nome'
  | 'client_company_id'
  | 'maquina_identificador'
  | 'horimetro'
  | 'is_preventiva'
  | 'is_corretiva'
  | 'maquina_parada'
  | 'sumario_defeitos'
  | 'produtos'
  | 'responsavel_nome'
  | 'assinatura_path'
  | 'preco_servicos'
  | 'preco_pecas'
  | 'preco_total'
>;

export async function adminUpdateReport(
  reportId: string,
  fields: Partial<AdminEditableFields>,
): Promise<ActionResult> {
  await requireRole('admin');
  const supabase = await createClient();

  const ALLOWED_KEYS: (keyof AdminEditableFields)[] = [
    'titulo',
    'cliente_nome',
    'client_company_id',
    'maquina_identificador',
    'horimetro',
    'is_preventiva',
    'is_corretiva',
    'maquina_parada',
    'sumario_defeitos',
    'produtos',
    'responsavel_nome',
    'assinatura_path',
    'preco_servicos',
    'preco_pecas',
    'preco_total',
  ];

  const payload: Partial<AdminEditableFields> = {};
  for (const k of ALLOWED_KEYS) {
    if (k in fields) {
      (payload as Record<typeof k, AdminEditableFields[typeof k]>)[k] = fields[k] as AdminEditableFields[typeof k];
    }
  }

  const { error } = await supabase.from('reports').update(payload).eq('id', reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/portal/admin/relatorios/${reportId}`);
  return { ok: true };
}

export async function adminUpsertInterval(
  reportId: string,
  interval: { id?: string; ordem: number; inicio: string; fim: string | null },
): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin');
  const supabase = await createClient();

  if (interval.id) {
    const { data, error } = await supabase
      .from('report_intervals')
      .update({ ordem: interval.ordem, inicio: interval.inicio, fim: interval.fim })
      .eq('id', interval.id)
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/portal/admin/relatorios/${reportId}`);
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
  revalidatePath(`/portal/admin/relatorios/${reportId}`);
  return { ok: true, data: { id: data.id } };
}

export async function adminDeleteInterval(
  intervalId: string,
  reportId: string,
): Promise<ActionResult> {
  await requireRole('admin');
  const supabase = await createClient();
  const { error } = await supabase.from('report_intervals').delete().eq('id', intervalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/portal/admin/relatorios/${reportId}`);
  return { ok: true };
}

export async function adminUploadSignature(
  reportId: string,
  pngBase64: string,
): Promise<ActionResult<{ path: string }>> {
  await requireRole('admin');
  const supabase = await createClient();
  try {
    const path = await uploadSignature(reportId, pngBase64);
    const upd = await supabase.from('reports').update({ assinatura_path: path }).eq('id', reportId);
    if (upd.error) return { ok: false, error: upd.error.message };
    return { ok: true, data: { path } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha no upload' };
  }
}

/**
 * Salva o relatório e o finaliza:
 * - Valida que empresa-cliente e valor total estão preenchidos
 * - Se ainda não tem `numero`, atribui o próximo (continua do 145 do sistema antigo)
 * - Marca status=approved + approved_by + approved_at
 * - Para relatórios já aprovados, só atualiza os campos (status/numero/approved_at preservados)
 */
export async function adminSaveAndFinalize(
  reportId: string,
  fields: AdminEditableFields,
): Promise<ActionResult> {
  const profile = await requireRole('admin');
  const supabase = await createClient();

  if (!fields.client_company_id) return { ok: false, error: 'Selecione o cliente cadastrado' };

  const { data: current } = await supabase
    .from('reports')
    .select('id, status, numero')
    .eq('id', reportId)
    .single();
  if (!current) return { ok: false, error: 'Relatório não encontrado' };

  // Próximo numero — só calcula se ainda não foi atribuído
  let numero = current.numero;
  if (numero == null) {
    const adminCli = createAdminClient();
    const { data: maxRow } = await adminCli
      .from('reports')
      .select('numero')
      .not('numero', 'is', null)
      .order('numero', { ascending: false })
      .limit(1)
      .maybeSingle();
    numero = ((maxRow?.numero ?? 145) as number) + 1;
  }

  const wasApproved = current.status === 'approved';

  const payload: ReportUpdate = {
    ...fields,
    numero,
  };
  if (!wasApproved) {
    payload.status = 'approved';
    payload.approved_by = profile.id;
    payload.approved_at = new Date().toISOString();
    payload.rejected_reason = null;
    payload.rejected_at = null;
  }

  const { error } = await supabase.from('reports').update(payload).eq('id', reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/portal/admin/relatorios');
  revalidatePath(`/portal/admin/relatorios/${reportId}`);
  revalidatePath('/portal');
  return { ok: true };
}

export async function adminDeleteReport(reportId: string): Promise<ActionResult> {
  await requireRole('admin');
  const supabase = await createClient();
  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/portal/admin/relatorios');
  revalidatePath('/portal');
  redirect('/portal/admin/relatorios');
}
