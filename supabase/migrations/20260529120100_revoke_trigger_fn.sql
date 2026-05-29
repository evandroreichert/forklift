-- Fix: revogar execute em private.set_updated_at() de public/anon.
-- Quando criamos a função sem revoke explícito, Postgres concede
-- execute a PUBLIC por default (CVE-2022-1552 style). Mesmo que a
-- função só faça sentido em contexto de trigger, é higiene revogar.

revoke execute on function private.set_updated_at() from public, anon;
