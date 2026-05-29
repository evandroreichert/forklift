-- =========================================================================
-- Portal FB Empilhadeiras — Fatia 1: Fundação
-- Schema inicial: client_companies, profiles, machines
-- RLS habilitada em todas as tabelas + policies por role
-- Helpers em schema private (não exposto a anon)
-- =========================================================================

-- =========================================================================
-- 1. Schema privado pra helpers (não exposto via PostgREST/anon)
-- =========================================================================
create schema if not exists private;
revoke usage on schema private from public, anon;
grant usage on schema private to authenticated;

-- =========================================================================
-- 2. Enums
-- =========================================================================
create type user_role as enum ('admin', 'mechanic', 'client');
create type fuel_type as enum ('glp', 'diesel', 'eletrica', 'gasolina', 'outro');

-- =========================================================================
-- 3. Funções utilitárias (criadas ANTES das tabelas que as usam em triggers)
-- =========================================================================
create or replace function private.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

-- =========================================================================
-- 4. Tabelas (ordem importa: client_companies antes de profiles e machines)
-- =========================================================================
create table client_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text unique,
  contact_phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null,
  client_company_id uuid references client_companies(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_must_have_company check (
    (role = 'client' and client_company_id is not null) or
    (role <> 'client' and client_company_id is null)
  )
);

create table machines (
  id uuid primary key default gen_random_uuid(),
  client_company_id uuid not null references client_companies(id) on delete restrict,
  numero_maquina text not null,
  horimetro_atual numeric(10,1) not null default 0,
  modelo text,
  fabricante text,
  tipo_combustivel fuel_type,
  numero_serie text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_company_id, numero_maquina)
);

-- =========================================================================
-- 5. Índices
-- =========================================================================
create index idx_machines_client on machines(client_company_id);
create index idx_profiles_client on profiles(client_company_id);

-- =========================================================================
-- 6. Triggers updated_at
-- =========================================================================
create trigger trg_client_companies_updated before update on client_companies
  for each row execute function private.set_updated_at();
create trigger trg_profiles_updated before update on profiles
  for each row execute function private.set_updated_at();
create trigger trg_machines_updated before update on machines
  for each row execute function private.set_updated_at();

-- =========================================================================
-- 7. Funções helper de RLS (criadas APÓS profiles, que elas leem)
-- =========================================================================
create or replace function private.user_role()
returns user_role
language sql security definer stable
set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function private.user_client_company_id()
returns uuid
language sql security definer stable
set search_path = ''
as $$ select client_company_id from public.profiles where id = auth.uid() $$;

revoke execute on function private.user_role() from public, anon;
revoke execute on function private.user_client_company_id() from public, anon;
grant execute on function private.user_role() to authenticated;
grant execute on function private.user_client_company_id() to authenticated;

-- =========================================================================
-- 8. Habilitar RLS (ANTES das policies, senão policies não tomam efeito)
-- =========================================================================
alter table client_companies enable row level security;
alter table profiles enable row level security;
alter table machines enable row level security;

-- =========================================================================
-- 9. Policies — profiles
-- =========================================================================
create policy "user reads own profile"
  on profiles for select using (id = auth.uid());

create policy "admin reads all profiles"
  on profiles for select using (private.user_role() = 'admin');

create policy "admin writes profiles"
  on profiles for all
  using (private.user_role() = 'admin')
  with check (private.user_role() = 'admin');

-- =========================================================================
-- 10. Policies — client_companies
-- =========================================================================
create policy "admin reads all companies"
  on client_companies for select using (private.user_role() = 'admin');

create policy "mechanic reads all companies"
  on client_companies for select using (private.user_role() = 'mechanic');

create policy "client reads own company"
  on client_companies for select
  using (id = private.user_client_company_id());

create policy "admin writes companies"
  on client_companies for all
  using (private.user_role() = 'admin')
  with check (private.user_role() = 'admin');

-- =========================================================================
-- 11. Policies — machines
-- =========================================================================
create policy "admin reads all machines"
  on machines for select using (private.user_role() = 'admin');

create policy "mechanic reads all machines"
  on machines for select using (private.user_role() = 'mechanic');

create policy "client reads own machines"
  on machines for select
  using (client_company_id = private.user_client_company_id());

create policy "admin writes machines"
  on machines for all
  using (private.user_role() = 'admin')
  with check (private.user_role() = 'admin');
