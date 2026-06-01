import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { adminClient, loggedClient, createTestUser, wipeAll } from './helpers/supabase';

let companyAId: string;
let companyBId: string;
let mech1Id: string;
let mech2Id: string;

beforeAll(async () => {
  await wipeAll();
  const admin = adminClient();

  const { data: cA, error: eA } = await admin
    .from('client_companies').insert({ name: 'Empresa A' }).select().single();
  if (eA) throw eA;
  companyAId = cA.id;

  const { data: cB, error: eB } = await admin
    .from('client_companies').insert({ name: 'Empresa B' }).select().single();
  if (eB) throw eB;
  companyBId = cB.id;

  await createTestUser({ email: 'admin@test.com', password: 'senha123', fullName: 'Admin', role: 'admin' });
  mech1Id = await createTestUser({ email: 'mech1@test.com', password: 'senha123', fullName: 'Mech 1', role: 'mechanic' });
  mech2Id = await createTestUser({ email: 'mech2@test.com', password: 'senha123', fullName: 'Mech 2', role: 'mechanic' });
  await createTestUser({ email: 'clienteA@test.com', password: 'senha123', fullName: 'Cliente A', role: 'client', clientCompanyId: companyAId });
  await createTestUser({ email: 'clienteB@test.com', password: 'senha123', fullName: 'Cliente B', role: 'client', clientCompanyId: companyBId });
});

afterAll(async () => {
  await wipeAll();
});

function newDraft(mechanicId: string, overrides: Partial<{ titulo: string; cliente_nome: string; horimetro: number }> = {}) {
  return {
    mechanic_id: mechanicId,
    cliente_nome: overrides.cliente_nome ?? 'Cliente Livre',
    titulo: overrides.titulo ?? 'Teste',
    maquina_identificador: 'M-99',
    horimetro: overrides.horimetro ?? 100,
    maquina_parada: true,
    sumario_defeitos: 'troca de óleo',
    is_preventiva: true,
    is_corretiva: false,
  } as const;
}

describe('reports RLS: mecânico cria e lê próprios', () => {
  it('mecânico cria draft próprio', async () => {
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { data, error } = await c.from('reports').insert(newDraft(mech1Id)).select('id').single();
    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
  });

  it('mecânico lê os próprios', async () => {
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { data } = await c.from('reports').select('*');
    expect((data ?? []).length).toBeGreaterThan(0);
    expect((data ?? []).every((r) => r.mechanic_id === mech1Id)).toBe(true);
  });

  it('M2 NÃO vê reports do M1', async () => {
    const c = await loggedClient('mech2@test.com', 'senha123');
    const { data } = await c.from('reports').select('*');
    expect((data ?? []).every((r) => r.mechanic_id === mech2Id)).toBe(true);
  });
});

describe('reports RLS: mecânico bloqueado de campos administrativos', () => {
  it('NÃO consegue setar client_company_id no insert', async () => {
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error } = await c.from('reports').insert({ ...newDraft(mech1Id), client_company_id: companyAId });
    expect(error).not.toBeNull();
  });

  it('NÃO consegue setar numero no insert', async () => {
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error } = await c.from('reports').insert({ ...newDraft(mech1Id), numero: 999 });
    expect(error).not.toBeNull();
  });

  it('NÃO consegue setar preco_total no insert', async () => {
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error } = await c.from('reports').insert({ ...newDraft(mech1Id), preco_total: 500 });
    expect(error).not.toBeNull();
  });

  it('NÃO consegue dar update setando client_company_id', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error, data } = await c.from('reports')
      .update({ client_company_id: companyAId }).eq('id', r!.id).select();
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });
});

describe('reports RLS: transições de status do mecânico', () => {
  it('mecânico submete draft → pending_approval (campos admin nulos)', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error } = await c.from('reports')
      .update({ status: 'pending_approval', submitted_at: new Date().toISOString() })
      .eq('id', r!.id);
    expect(error).toBeNull();
  });

  it('mecânico NÃO consegue editar relatório em pending_approval', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    await admin.from('reports').update({ status: 'pending_approval', submitted_at: new Date().toISOString() }).eq('id', r!.id);
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error, data } = await c.from('reports')
      .update({ titulo: 'tentando editar' }).eq('id', r!.id).select();
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('mecânico edita rejected → submete de novo', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    await admin.from('reports').update({
      status: 'rejected',
      rejected_reason: 'falta info',
      rejected_at: new Date().toISOString(),
    }).eq('id', r!.id);
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error: editErr } = await c.from('reports')
      .update({ titulo: 'corrigido' }).eq('id', r!.id);
    expect(editErr).toBeNull();
  });
});

describe('reports RLS: admin', () => {
  it('lê todos os reports', async () => {
    const c = await loggedClient('admin@test.com', 'senha123');
    const { data } = await c.from('reports').select('*');
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it('aprova: define numero, client_company_id, approved_by, approved_at', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id, { titulo: 'pra aprovar' })).select('id').single();
    const { data: adminProfile } = await admin.from('profiles').select('id').eq('role', 'admin').single();

    const c = await loggedClient('admin@test.com', 'senha123');
    const { error } = await c.from('reports').update({
      status: 'approved',
      numero: 1,
      client_company_id: companyAId,
      approved_by: adminProfile!.id,
      approved_at: new Date().toISOString(),
      preco_total: 1500,
    }).eq('id', r!.id);
    expect(error).toBeNull();
  });
});

describe('reports RLS: client', () => {
  it('cliente A NÃO vê draft/pending', async () => {
    const admin = adminClient();
    await admin.from('reports').insert(newDraft(mech1Id, { titulo: 'draft pra cliente nao ver' }));
    const c = await loggedClient('clienteA@test.com', 'senha123');
    const { data } = await c.from('reports').select('*').neq('status', 'approved');
    expect(data ?? []).toHaveLength(0);
  });

  it('cliente A vê approved da própria company; B não vê', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id, { titulo: 'pro cliente A' })).select('id').single();
    const { data: adminProfile } = await admin.from('profiles').select('id').eq('role', 'admin').single();
    await admin.from('reports').update({
      status: 'approved',
      numero: 100,
      client_company_id: companyAId,
      approved_by: adminProfile!.id,
      approved_at: new Date().toISOString(),
    }).eq('id', r!.id);

    const cA = await loggedClient('clienteA@test.com', 'senha123');
    const { data: visiveis } = await cA.from('reports').select('id').eq('id', r!.id);
    expect(visiveis ?? []).toHaveLength(1);

    const cB = await loggedClient('clienteB@test.com', 'senha123');
    const { data: invisiveis } = await cB.from('reports').select('id').eq('id', r!.id);
    expect(invisiveis ?? []).toHaveLength(0);
  });
});

describe('report_intervals RLS', () => {
  it('mecânico escreve intervalo em report próprio (draft)', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    const c = await loggedClient('mech1@test.com', 'senha123');
    const { error } = await c.from('report_intervals').insert({
      report_id: r!.id,
      ordem: 1,
      inicio: new Date().toISOString(),
    });
    expect(error).toBeNull();
  });

  it('M2 NÃO consegue inserir intervalo em report do M1', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    const c = await loggedClient('mech2@test.com', 'senha123');
    const { error } = await c.from('report_intervals').insert({
      report_id: r!.id,
      ordem: 1,
      inicio: new Date().toISOString(),
    });
    expect(error).not.toBeNull();
  });

  it('intervalos somem em cascade quando report é deletado', async () => {
    const admin = adminClient();
    const { data: r } = await admin.from('reports').insert(newDraft(mech1Id)).select('id').single();
    await admin.from('report_intervals').insert({
      report_id: r!.id,
      ordem: 1,
      inicio: new Date().toISOString(),
    });
    await admin.from('reports').delete().eq('id', r!.id);
    const { data: leftover } = await admin.from('report_intervals').select('id').eq('report_id', r!.id);
    expect(leftover ?? []).toHaveLength(0);
  });
});
