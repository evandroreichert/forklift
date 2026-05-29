'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { FuelType } from '@/lib/types';

export type MaquinaFormState = { error: string | null };

const FUEL_VALUES: FuelType[] = ['glp', 'diesel', 'eletrica', 'gasolina', 'outro'];

function parseForm(formData: FormData) {
  const tipo = String(formData.get('tipo_combustivel') ?? '');
  return {
    client_company_id: String(formData.get('client_company_id') ?? ''),
    numero_maquina: String(formData.get('numero_maquina') ?? '').trim(),
    horimetro_atual: Number(formData.get('horimetro_atual') ?? 0),
    modelo: String(formData.get('modelo') ?? '').trim() || null,
    fabricante: String(formData.get('fabricante') ?? '').trim() || null,
    tipo_combustivel: FUEL_VALUES.includes(tipo as FuelType) ? (tipo as FuelType) : null,
    numero_serie: String(formData.get('numero_serie') ?? '').trim() || null,
    active: formData.get('active') === 'on',
  };
}

export async function createMaquinaAction(
  _prev: MaquinaFormState,
  formData: FormData,
): Promise<MaquinaFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);
  if (!payload.client_company_id || !payload.numero_maquina) {
    return { error: 'Empresa e número da máquina são obrigatórios.' };
  }
  if (Number.isNaN(payload.horimetro_atual) || payload.horimetro_atual < 0) {
    return { error: 'Horímetro deve ser número positivo.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('machines').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/maquinas');
  redirect('/portal/admin/maquinas');
}

export async function updateMaquinaAction(
  id: string,
  _prev: MaquinaFormState,
  formData: FormData,
): Promise<MaquinaFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);

  const supabase = await createClient();
  const { error } = await supabase.from('machines').update(payload).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/maquinas');
  redirect('/portal/admin/maquinas');
}
