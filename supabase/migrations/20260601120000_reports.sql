-- =========================================================================
-- Portal FB Empilhadeiras — Fatia 2: Relatório do Mecânico
-- Tabelas reports + report_intervals com RLS por role
-- =========================================================================

-- =========================================================================
-- 1. Enums
-- =========================================================================
create type report_status as enum ('draft', 'pending_approval', 'approved', 'rejected');

-- =========================================================================
-- 2. Tabela reports
-- =========================================================================
create table reports (
  id uuid primary key default gen_random_uuid(),

  -- atribuído só na aprovação (Fatia 3)
  numero integer unique,

  status report_status not null default 'draft',

  -- autoria
  mechanic_id uuid not null references profiles(id) on delete restrict,

  -- cliente: texto livre digitado pelo mecânico em campo
  -- client_company_id é amarrado pelo admin na aprovação (Fatia 3)
  cliente_nome text not null,
  client_company_id uuid references client_companies(id) on delete restrict,

  -- título digitado pelo mecânico
  titulo text not null,

  -- máquina (sem cadastro, texto livre)
  maquina_identificador text not null,
  horimetro numeric(10,1) not null,

  -- tipo de atividade (pelo menos um precisa ser true)
  is_preventiva boolean not null default false,
  is_corretiva boolean not null default false,

  -- status operacional
  maquina_parada boolean not null,

  -- descritivos
  sumario_defeitos text not null,
  produtos text,

  -- responsável do cliente que recebeu/assinou o serviço
  responsavel_nome text,
  -- path do PNG no bucket signatures: signatures/<report_id>/cliente.png
  assinatura_path text,

  -- valores monetários (Fatia 3 — admin preenche)
  preco_servicos numeric(12,2),
  preco_pecas numeric(12,2),
  preco_total numeric(12,2),

  -- auditoria de fluxo
  submitted_at timestamptz,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejected_reason text,
  rejected_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tipo_atividade_pelo_menos_um check (is_preventiva or is_corretiva),
  constraint numero_assigned_when_approved check (
    (status = 'approved') = (numero is not null)
  ),
  constraint approval_consistency check (
    (status = 'approved' and approved_by is not null and approved_at is not null) or
    (status <> 'approved' and approved_by is null and approved_at is null)
  ),
  constraint rejection_consistency check (
    (status = 'rejected' and rejected_reason is not null and rejected_at is not null) or
    (status <> 'rejected' and rejected_reason is null and rejected_at is null)
  )
);

-- =========================================================================
-- 3. Tabela report_intervals (N intervalos por relatório)
-- =========================================================================
create table report_intervals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  ordem integer not null,           -- 1, 2, 3 ... corresponde a "DIA 01", "DIA 02"
  inicio timestamptz not null,
  fim timestamptz,                  -- nullable enquanto intervalo aberto
  created_at timestamptz not null default now(),
  unique (report_id, ordem),
  constraint fim_after_inicio check (fim is null or fim >= inicio)
);

-- =========================================================================
-- 4. Índices
-- =========================================================================
create index idx_reports_mechanic on reports(mechanic_id);
create index idx_reports_status on reports(status);
create index idx_reports_client_company on reports(client_company_id) where client_company_id is not null;
create index idx_report_intervals_report on report_intervals(report_id, ordem);

-- =========================================================================
-- 5. Trigger updated_at em reports
-- =========================================================================
create trigger trg_reports_updated before update on reports
  for each row execute function private.set_updated_at();

-- =========================================================================
-- 6. Helper: gerar próximo numero sequencial (usado na Fatia 3)
-- Continua a numeração do sistema antigo (Produttivo): último relatório
-- emitido foi nº 145 → primeiro emitido por este portal será 146.
-- =========================================================================
create or replace function private.next_report_numero()
returns integer
language sql security definer volatile
set search_path = ''
as $$ select coalesce(max(numero), 145) + 1 from public.reports $$;

revoke execute on function private.next_report_numero() from public, anon;
grant execute on function private.next_report_numero() to authenticated;

-- =========================================================================
-- 7. Habilitar RLS
-- =========================================================================
alter table reports enable row level security;
alter table report_intervals enable row level security;

-- =========================================================================
-- 8. Policies — reports
-- =========================================================================

-- mecânico: lê os próprios relatórios em qualquer status
create policy "mechanic reads own reports"
  on reports for select
  using (private.user_role() = 'mechanic' and mechanic_id = auth.uid());

-- mecânico: cria relatório (mechanic_id força ser ele mesmo, status inicial draft)
create policy "mechanic creates own reports"
  on reports for insert
  with check (
    private.user_role() = 'mechanic'
    and mechanic_id = auth.uid()
    and status = 'draft'
    and numero is null
    and client_company_id is null
    and approved_by is null
    and approved_at is null
    and rejected_reason is null
    and rejected_at is null
    and preco_servicos is null
    and preco_pecas is null
    and preco_total is null
  );

-- mecânico: edita os próprios enquanto status permite (draft ou rejected)
-- e na transição draft → pending_approval (submit). NÃO pode mexer em campos do admin.
create policy "mechanic updates own editable reports"
  on reports for update
  using (
    private.user_role() = 'mechanic'
    and mechanic_id = auth.uid()
    and status in ('draft', 'rejected')
  )
  with check (
    private.user_role() = 'mechanic'
    and mechanic_id = auth.uid()
    and status in ('draft', 'pending_approval')  -- pode submeter
    and numero is null
    and client_company_id is null
    and approved_by is null
    and approved_at is null
    and preco_servicos is null
    and preco_pecas is null
    and preco_total is null
  );

-- mecânico: deleta os próprios rascunhos
create policy "mechanic deletes own drafts"
  on reports for delete
  using (
    private.user_role() = 'mechanic'
    and mechanic_id = auth.uid()
    and status = 'draft'
  );

-- admin: leitura total
create policy "admin reads all reports"
  on reports for select
  using (private.user_role() = 'admin');

-- admin: escrita total (incluindo aprovar, rejeitar, atribuir numero, preços, client_company_id)
create policy "admin writes reports"
  on reports for all
  using (private.user_role() = 'admin')
  with check (private.user_role() = 'admin');

-- client: lê só relatórios aprovados da própria empresa (Fatia 4 vai consumir)
-- Adicionado já na Fatia 2 pra evitar migration extra; cliente não vai navegar nessa tela ainda
create policy "client reads own approved reports"
  on reports for select
  using (
    private.user_role() = 'client'
    and status = 'approved'
    and client_company_id = private.user_client_company_id()
  );

-- =========================================================================
-- 9. Policies — report_intervals
-- =========================================================================

-- mecânico: lê intervalos dos próprios relatórios
create policy "mechanic reads own intervals"
  on report_intervals for select
  using (
    private.user_role() = 'mechanic'
    and exists (
      select 1 from public.reports r
      where r.id = report_intervals.report_id and r.mechanic_id = auth.uid()
    )
  );

-- mecânico: escreve intervalos em relatórios próprios editáveis
create policy "mechanic writes intervals on own editable reports"
  on report_intervals for all
  using (
    private.user_role() = 'mechanic'
    and exists (
      select 1 from public.reports r
      where r.id = report_intervals.report_id
        and r.mechanic_id = auth.uid()
        and r.status in ('draft', 'rejected')
    )
  )
  with check (
    private.user_role() = 'mechanic'
    and exists (
      select 1 from public.reports r
      where r.id = report_intervals.report_id
        and r.mechanic_id = auth.uid()
        and r.status in ('draft', 'rejected', 'pending_approval')
    )
  );

-- admin: tudo
create policy "admin all intervals"
  on report_intervals for all
  using (private.user_role() = 'admin')
  with check (private.user_role() = 'admin');

-- client: lê intervalos de relatórios aprovados da própria empresa
create policy "client reads own approved intervals"
  on report_intervals for select
  using (
    private.user_role() = 'client'
    and exists (
      select 1 from public.reports r
      where r.id = report_intervals.report_id
        and r.status = 'approved'
        and r.client_company_id = private.user_client_company_id()
    )
  );
