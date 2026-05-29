import { describe, it, expect, afterAll } from 'vitest';
import postgres from 'postgres';

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  throw new Error('SUPABASE_DB_URL não configurada — necessária pra testes estruturais de RLS');
}
const sql = postgres(DB_URL);

afterAll(async () => {
  await sql.end();
});

describe('RLS coverage estrutural', () => {
  it('toda tabela do schema public tem relrowsecurity=true', async () => {
    const rows = await sql<{ table_name: string; rls_enabled: boolean }[]>`
      select
        c.relname as table_name,
        c.relrowsecurity as rls_enabled
      from pg_class c
      join pg_namespace n on c.relnamespace = n.oid
      where n.nspname = 'public'
        and c.relkind = 'r'
      order by c.relname
    `;

    expect(rows.length).toBeGreaterThan(0);

    const semRLS = rows.filter((r) => !r.rls_enabled);
    if (semRLS.length > 0) {
      throw new Error(
        `Tabelas SEM RLS habilitada: ${semRLS.map((r) => r.table_name).join(', ')}`,
      );
    }
  });

  it('schema private não permite usage por anon ou public', async () => {
    const rows = await sql<{ grantee: string }[]>`
      select grantee
      from information_schema.usage_privileges
      where object_schema = 'private'
        and object_type = 'SCHEMA'
        and grantee in ('anon', 'PUBLIC')
    `;
    expect(rows).toHaveLength(0);
  });

  it('funções em schema private não têm execute por anon/public', async () => {
    const rows = await sql<{ proname: string; grantee: string }[]>`
      select p.proname, r.grantee
      from pg_proc p
      join pg_namespace n on p.pronamespace = n.oid
      join information_schema.routine_privileges r on r.specific_schema = 'private'
        and r.routine_name = p.proname::text
      where n.nspname = 'private'
        and r.grantee in ('anon', 'PUBLIC')
    `;
    expect(rows).toHaveLength(0);
  });
});
