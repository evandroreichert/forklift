import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { adminClient, anonClient, loggedClient, createTestUser, wipeAll } from './helpers/supabase';

let companyAId: string;
let companyBId: string;

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
  await createTestUser({ email: 'mech@test.com', password: 'senha123', fullName: 'Mech', role: 'mechanic' });
  await createTestUser({ email: 'clienteA@test.com', password: 'senha123', fullName: 'Cliente A', role: 'client', clientCompanyId: companyAId });
  await createTestUser({ email: 'clienteB@test.com', password: 'senha123', fullName: 'Cliente B', role: 'client', clientCompanyId: companyBId });
});

afterAll(async () => {
  await wipeAll();
});

describe('RLS: anon client', () => {
  it('vê 0 rows em client_companies', async () => {
    const { data } = await anonClient().from('client_companies').select('*');
    expect(data ?? []).toHaveLength(0);
  });
  it('vê 0 rows em profiles', async () => {
    const { data } = await anonClient().from('profiles').select('*');
    expect(data ?? []).toHaveLength(0);
  });
});

describe('RLS: cliente A isolamento', () => {
  it('vê só sua própria company', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { data } = await client.from('client_companies').select('*');
    expect(data).toHaveLength(1);
    const first = data?.[0];
    expect(first?.id).toBe(companyAId);
  });

  it('NÃO vê company de outro cliente (B)', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { data } = await client.from('client_companies').select('*').eq('id', companyBId);
    expect(data ?? []).toHaveLength(0);
  });

  it('NÃO consegue atualizar company', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { error, data } = await client.from('client_companies')
      .update({ name: 'Hack' }).eq('id', companyAId).select();
    // RLS pode retornar erro OU silenciosamente filtrar (0 rows afetadas)
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('NÃO consegue inserir company', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { error } = await client.from('client_companies').insert({ name: 'Tentativa' });
    expect(error).not.toBeNull();
  });
});

describe('RLS: mechanic', () => {
  it('lê todas as companies (precisa pra criar relatório na Fatia 2)', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { data } = await client.from('client_companies').select('*');
    expect(data).toHaveLength(2);
  });

  it('NÃO consegue inserir company', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { error } = await client.from('client_companies').insert({ name: 'X' });
    expect(error).not.toBeNull();
  });

  it('NÃO consegue atualizar company', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { error, data } = await client.from('client_companies')
      .update({ name: 'Hack' }).eq('id', companyAId).select();
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });
});

describe('RLS: admin', () => {
  it('lê todos os profiles', async () => {
    const client = await loggedClient('admin@test.com', 'senha123');
    const { data } = await client.from('profiles').select('*');
    expect((data ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('insere company', async () => {
    const client = await loggedClient('admin@test.com', 'senha123');
    const { error } = await client.from('client_companies').insert({ name: 'C' });
    expect(error).toBeNull();
  });
});
