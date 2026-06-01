import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function anonClient(): SupabaseClient<Database> {
  return createClient<Database>(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function adminClient(): SupabaseClient<Database> {
  return createClient<Database>(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function loggedClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Login failed for ${email}: ${error?.message}`);
  return client;
}

export async function createTestUser(args: {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'mechanic' | 'client';
  clientCompanyId?: string;
}) {
  const admin = adminClient();
  const { data: userData, error: userErr } = await admin.auth.admin.createUser({
    email: args.email,
    password: args.password,
    email_confirm: true,
  });
  if (userErr || !userData.user) throw new Error(`createUser failed: ${userErr?.message}`);

  const { error: profErr } = await admin.from('profiles').insert({
    id: userData.user.id,
    full_name: args.fullName,
    role: args.role,
    client_company_id: args.clientCompanyId ?? null,
  });
  if (profErr) throw new Error(`profile insert failed: ${profErr.message}`);

  return userData.user.id;
}

// Lista de projetos Supabase de PRODUÇÃO que NUNCA podem ser wipados via teste.
// Evita destruir auth.users de prod por engano (CI, hook do editor, etc).
const PROD_PROJECT_REFS = ['uhtodltjysbcnprexoiu'];

export async function wipeAll() {
  if (PROD_PROJECT_REFS.some((ref) => URL.includes(ref))) {
    if (process.env.ALLOW_DESTRUCTIVE_WIPE !== '1') {
      throw new Error(
        `wipeAll() bloqueado: o NEXT_PUBLIC_SUPABASE_URL aponta pra um projeto Supabase de produção.\n` +
          `Se você REALMENTE quer apagar todos os usuários ali, defina ALLOW_DESTRUCTIVE_WIPE=1.\n` +
          `Caso contrário, aponte os testes pra um projeto Supabase separado de testes.`,
      );
    }
    console.warn('[wipeAll] ALLOW_DESTRUCTIVE_WIPE=1 em projeto de produção. Procedendo MESMO ASSIM.');
  }

  const admin = adminClient();
  await admin.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('client_companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: users } = await admin.auth.admin.listUsers();
  for (const u of users?.users ?? []) {
    await admin.auth.admin.deleteUser(u.id);
  }
}
