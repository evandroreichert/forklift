# Portal — Fatia 2: Relatório do Mecânico

**Status:** Draft (aguardando aprovação)
**Date:** 2026-06-01
**Owner:** Fabiano Bratti Empilhadeiras
**Author:** Evandro (com Claude)

---

## 1. Contexto

A Fatia 1 entregou auth real + CRUD de usuários e empresas-cliente. Mecânicos e clientes conseguem logar mas só veem dashboards placeholder. A Fatia 2 entrega o **núcleo do produto**: o mecânico cria um relatório de assistência técnica no celular, em campo, e envia pra aprovação do admin.

Esta fatia substitui parcialmente o sistema externo **Produttivo** que a FB usa hoje (ver `Relatorio nº 145.pdf` na raiz). A Fatia 3 (admin aprova + define valores) e Fatia 4 (cliente vê + PDF) completam a substituição.

**Decisões herdadas das fatias anteriores:**
- Sem upload de fotos
- Sem cadastro prévio de máquinas (identificador + horímetro vão como texto livre)
- Numeração sequencial só atribuída na aprovação (Fatia 3)
- 3 papéis flat: `admin`, `mechanic`, `client`
- Email transactional via Resend (infra já presente)

## 2. Escopo da Fatia 2

**Entrega ao final desta fatia:** Um mecânico logado consegue criar um relatório no celular, preencher todos os campos do PDF 145 (exceto valores monetários e fotos), coletar assinatura desenhada do cliente, e enviar pra aprovação. O Fabiano (admin) recebe notificação por email com link pro relatório pendente. Admin vê lista de pendentes mas **não aprova ainda** — aprovação é Fatia 3.

**Dentro do escopo:**
- Tabelas `reports` e `report_intervals` + RLS por role
- Bucket Storage `signatures` (privado) pra PNG da assinatura do cliente
- Form de criação de relatório (mobile-first)
- Lista "Meus relatórios" pro mecânico (rascunhos + enviados + rejeitados)
- Tela `/portal/admin/relatorios` mostra lista de pendentes (placeholder de aprovação)
- Auto-save de rascunho no backend
- Signature pad via `react-signature-canvas`
- Email Resend pro admin quando mecânico envia
- Remoção dos componentes mock de manutenção (substituídos por dados reais)

**Fora do escopo (vai pra Fatia 3 ou 4):**
- Aprovação/rejeição efetiva (Fatia 3)
- Preenchimento de valores monetários (Fatia 3, admin faz)
- Atribuição de número sequencial (Fatia 3, no momento da aprovação)
- Vinculação `client_company_id` no relatório (Fatia 3 — admin amarra na aprovação)
- Geração de PDF (Fatia 4)
- Portal do cliente final visualizando relatórios (Fatia 4)
- GPS automático (decidido removido)
- Caixa "Empresa responsável" (razão social/WhatsApp) no PDF — removida; só CNPJ no header

## 3. Decisões de produto (Fatia 2)

| Decisão | Escolha | Motivo |
|---|---|---|
| Cliente no relatório | Texto livre digitado pelo mecânico, FK `client_company_id` vazia até admin amarrar | Mecânico não trava esperando cadastro prévio do cliente |
| Identificador da máquina | Texto livre + horímetro número | Sem cadastro prévio (decisão herdada da Fatia 1 revisada) |
| Tipo de atividade | Dois booleanos independentes (preventiva, corretiva) | PDF 145 marca "CORRETIVA & PREVENTIVA" — pode ser uma ou ambas |
| Intervalos início↔fim | Tabela separada `report_intervals`, N por relatório | Mesma atividade pode cruzar dias; ordenadas por sequência |
| GPS | Removido | Decidido em 2026-06-01 — atrito desnecessário pro mecânico |
| Fotos antes/depois | Removidas | Decisão herdada |
| Assinatura do cliente | Canvas (signature pad) → PNG → Supabase Storage privado | Cliente assina no celular do mecânico; embebida no PDF da Fatia 4 |
| Rascunho | Persistido no backend (status `draft`), auto-save | Mecânico pode perder sinal em campo; rascunho no servidor sobrevive a perda de bateria |
| Rejeição | Volta a ser editável pelo mecânico (status `pending_approval` → `rejected` → mecânico edita → `pending_approval` de novo) | Preserva histórico, evita recriar do zero |
| Numeração sequencial | Atribuída só na aprovação (Fatia 3); **continua de 145** (próximo = 146) | Mantém continuidade do sistema antigo (Produttivo). Helper `private.next_report_numero()` retorna `coalesce(max(numero), 145) + 1` |
| Notificação ao admin | Resend imediato quando status muda pra `pending_approval` | Sem digest; admin precisa ver na hora |
| Edição de relatório aprovado | Bloqueada (admin pode reabrir no Fatia 3 se precisar) | Aprovado = imutável pelo mecânico |

## 4. Esquema do banco (1 migration nova)

`supabase/migrations/20260601120000_reports.sql`. Mesma ordem da Fatia 1: enums → tabelas → índices → triggers → RLS enable → policies.

### 4.1 Princípios mantidos da Fatia 1

- RLS habilitada em **toda** tabela nova (test estrutural já cobre)
- Helpers de role continuam em schema `private`
- Service role só em `lib/supabase/admin.ts` (server-only)

### 4.2 SQL completo

```sql
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
-- Continua de 145 (último relatório do sistema antigo Produttivo).
-- Primeiro relatório aprovado por este portal terá numero = 146.
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
```

### 4.3 Notas importantes do schema

**Por que `is_preventiva` + `is_corretiva` em vez de enum?**
O PDF 145 marca "CORRETIVA & PREVENTIVA" — pode ser uma ou ambas. Dois booleanos com check constraint é mais simples que array de enum.

**Por que `client_company_id` é nullable e fica pro admin amarrar?**
Decisão de produto (caminho A): mecânico digita o cliente livre pra não travar em campo. Admin amarra no momento da aprovação. As policies de mecânico bloqueiam alteração desse campo via `with check`.

**Por que `report_intervals` em vez de `intervals jsonb[]` em `reports`?**
Permite policies RLS coerentes, validação de constraint (`fim >= inicio`), índices, e queries naturais. Custa uma tabela a mais.

**Por que `numero integer unique` nullable?**
Atribuído só na aprovação. Check constraint garante `(status='approved') = (numero is not null)`. Função `private.next_report_numero()` será chamada pela server action de aprovação na Fatia 3.

**Como mecânico pode "submeter" (draft → pending_approval) sem alterar campos proibidos?**
A policy `mechanic updates own editable reports` permite UPDATE com `status` indo pra `pending_approval` desde que todos os campos administrativos sigam nulos. A server action `submitReport(reportId)` faz `update reports set status='pending_approval', submitted_at=now() where id=...`.

## 5. Storage — bucket de assinaturas

Bucket privado **`signatures`** no Supabase Storage.

**Path:** `signatures/<report_id>/cliente.png`

**Policies:**
- Mecânico pode `INSERT/UPDATE/DELETE` em paths cujo `report_id` pertence a relatório próprio editável (draft ou rejected) — verificado no app via server action que checa ownership antes de gerar URL pré-assinada.
- Admin lê tudo.
- Client lê só se o relatório associado está `approved` e pertence à sua company.

**Decisão de implementação:** em vez de policies complexas no bucket (que exigem checar status do relatório na pasta), as chamadas de upload/leitura passam por **server actions** que fazem a autorização e geram URLs pré-assinadas. O bucket fica fechado pra anon e authenticated diretos; só a service-role escreve/lê. Mais simples e menos bug-prone.

Arquivos novos:
- `lib/storage/signatures.ts` — funções `uploadSignature(reportId, base64Png)` e `getSignatureUrl(reportId)`
- Ambas usam `lib/supabase/admin.ts` (server-only) e checam role + ownership antes

**Bucket criado manualmente** uma vez no painel Supabase (privado, sem policies). Documentado em deploy-notes.

## 6. Server Actions

Centralizadas em `app/(portal)/portal/relatorios/actions.ts`. Padrão da Fatia 1: `use server`, validação com helper, retorna `{ ok, data?, error? }`.

```ts
// criar novo relatório (rascunho vazio)
createDraft(): { id: string }

// atualizar campos do rascunho (auto-save)
updateDraft(reportId: string, fields: Partial<ReportDraft>): void

// adicionar/atualizar/remover intervalo
upsertInterval(reportId: string, interval: { ordem, inicio, fim? }): void
deleteInterval(intervalId: string): void

// upload assinatura (base64 PNG vindo do canvas)
uploadSignature(reportId: string, pngBase64: string): { path: string }

// submeter pra aprovação (valida obrigatórios + transição de status + email pro admin)
submitReport(reportId: string): void

// reabrir relatório rejeitado (status rejected → draft, limpa rejected_reason)
reopenRejected(reportId: string): void

// deletar rascunho
deleteDraft(reportId: string): void
```

**Validação de submit** (server-side, mesmo que client valide antes):
- `titulo`, `cliente_nome`, `maquina_identificador` não vazios
- `horimetro` numérico ≥ 0
- pelo menos um de `is_preventiva`/`is_corretiva` true
- `maquina_parada` boolean preenchido (não null)
- `sumario_defeitos` não vazio
- `responsavel_nome` não vazio
- `assinatura_path` não null
- pelo menos 1 intervalo com `fim` preenchido

Validação falha → retorna `{ ok: false, error: '...' }` e UI mostra inline.

## 7. Fluxo do mecânico (UX)

```
/portal/mecanico/relatorios            Lista: rascunhos + enviados + rejeitados + aprovados
  └ botão "+ Novo relatório"
     ├ createDraft() → redirect /portal/mecanico/relatorios/<id>/editar
     │
     /portal/mecanico/relatorios/<id>/editar   Form (mobile-first)
       ├ Auto-save por debounce (1.5s após cada alteração)
       ├ Seções colapsáveis (acordeão):
       │   1. Identificação (título, cliente, máquina, horímetro)
       │   2. Tipo & status (preventiva/corretiva checkbox, máquina parada radio)
       │   3. Intervalos (lista "+ adicionar dia/intervalo")
       │   4. Defeitos e produtos (textareas)
       │   5. Responsável e assinatura (nome + canvas)
       ├ Indicador "Salvando..." → "Salvo às HH:MM"
       └ Botão fixo no rodapé:
           - "Salvar e sair" → volta pra lista (já salvo, só sai)
           - "Enviar pra aprovação" → submitReport()
```

**Tela de leitura** (`/portal/mecanico/relatorios/<id>`): vista read-only quando status ≠ draft/rejected. Mostra todos os campos como cards. Se status=`rejected`, banner laranja com `rejected_reason` + botão "Reabrir e editar" (chama `reopenRejected`).

## 8. UI — componentes-chave

### 8.1 Signature pad (`components/portal/SignaturePad.tsx`)

Lib: `react-signature-canvas` (~24kb). Wrapper com:
- Canvas full-width, 200px de altura, fundo branco com linha guia
- Botões "Limpar" e "Confirmar" abaixo
- Ao confirmar: chama `ref.toDataURL('image/png')` e envia pro pai
- Pai chama `uploadSignature(reportId, base64)` e armazena o `path` retornado em estado local

Pra evitar dependência de mais uma lib, **avaliar primeiro** se `signature_pad` (vanilla, ~5kb, sem React) atende — wrapper React fica trivial. Decisão final no plan.

### 8.2 Lista de intervalos (`components/portal/IntervalsList.tsx`)

- Cada intervalo: 2 inputs `datetime-local` (início, fim) + botão lixeira
- Botão "+ Adicionar intervalo"
- `ordem` calculado pelo index do array (server reordena se necessário)
- Mobile: cada intervalo ocupa linha inteira, datetime-local nativo (input nativo do iOS/Android é OK)

### 8.3 Tipo de atividade (`components/portal/TipoAtividade.tsx`)

Dois checkboxes lado a lado: "Preventiva" e "Corretiva". Pelo menos um obrigatório (valida no submit).

### 8.4 Máquina parada (`components/portal/MaquinaParadaRadio.tsx`)

Radio group "Sim" / "Não", grande tap target.

### 8.5 Auto-save indicator (`components/portal/AutoSaveStatus.tsx`)

Estado: `idle | saving | saved | error`. Render:
- saving → spinner + "Salvando..."
- saved → checkmark + "Salvo às 14:32"
- error → ícone alerta + "Sem conexão — tente novamente"

## 9. Notificação por email ao admin

Quando `submitReport` move pra `pending_approval`, server action chama `lib/email.ts:sendEmail` com:
- **Para:** todos os profiles com `role='admin'` e `active=true` (query no service-role client)
- **Assunto:** `[FB] Novo relatório aguardando aprovação — <cliente_nome>`
- **HTML:** template simples com nome do mecânico, cliente, identificador da máquina, horímetro, link `${SITE_URL}/portal/admin/relatorios/<id>`

Template em `lib/email/templates/novoRelatorio.ts`. Inline CSS (Resend best practice).

Se `sendEmail` falhar, **não reverte o submit** — log + toast no mecânico "Enviado, mas notificação ao admin falhou". Admin ainda vê na lista quando logar.

## 10. Telas (estrutura de arquivos)

```
app/(portal)/portal/
  mecanico/
    layout.tsx                          # NOVO — gate role='mechanic'
    relatorios/
      page.tsx                          # lista "Meus relatórios"
      actions.ts                        # server actions (todas as RPCs)
      [id]/
        page.tsx                        # vista read-only
        editar/
          page.tsx                      # form completo
  admin/
    relatorios/
      page.tsx                          # NOVO — lista pendentes + outros status
                                        # (aprovação real é Fatia 3, esta tela é placeholder)

components/portal/
  SignaturePad.tsx                      # NOVO
  IntervalsList.tsx                     # NOVO
  TipoAtividade.tsx                     # NOVO
  MaquinaParadaRadio.tsx                # NOVO
  AutoSaveStatus.tsx                    # NOVO
  ReportFieldsCard.tsx                  # NOVO — vista read-only de campos
  RejectedBanner.tsx                    # NOVO
  ReportsList.tsx                       # NOVO — usado por mecânico e admin
  Sidebar.tsx                           # ATUALIZAR — nav inclui "Relatórios" pros roles

  # DELETAR depois de Fatia 2 completa (substituídos por dados reais):
  MaintenanceCard.tsx                   # mock
  # qualquer outro mock de manutenção em data/mock/

lib/
  storage/
    signatures.ts                       # NOVO — upload/get URL assinada
  email/
    templates/
      novoRelatorio.ts                  # NOVO
  reports/
    validate.ts                         # NOVO — validações de submit reusáveis
    types.ts                            # NOVO — tipos derivados do schema

supabase/migrations/
  20260601120000_reports.sql            # NOVO

tests/
  reports-rls.test.ts                   # NOVO — isolamento mecânico/admin/client em reports
```

## 11. Validação visual: header do PDF (preview pra Fatia 4)

Esta fatia **não gera PDF** (Fatia 4 faz), mas o spec já fixa o layout do header pra evitar retrabalho:

```
┌───────────────────────────────────────────────┐
│ [LOGO FB EMPILHADEIRAS]      ASSISTÊNCIA TÉC. │
│ CNPJ: 50.982.211/0001-45      <título>        │
│                              Por: <mecânico>  │
│                              Em:  <data>      │
└───────────────────────────────────────────────┘
```

Comparado ao PDF 145: **removido** "Razão social" + "Celular/WhatsApp" + a caixa inteira "Empresa responsável". CNPJ sobe pro header, embaixo da logo.

A vista read-only no portal (`/portal/mecanico/relatorios/<id>` e admin equivalente) já segue esse layout pra confirmação visual.

## 12. Remoção dos mocks de manutenção

A Fatia 1 deixou os componentes mock de manutenção como placeholder no dashboard. Esta fatia substitui:

- **Dashboard do mecânico (`/portal`):** card "Meus relatórios" com contadores (rascunhos, enviados, rejeitados) + atalho "Criar novo"
- **Dashboard do cliente:** mantém placeholder até Fatia 4 (cliente ainda não vê relatórios próprios — admin precisa aprovar e amarrar `client_company_id` primeiro, e isso é Fatia 3)
- **Dashboard do admin:** card "Pendentes de aprovação" com contagem

Arquivos a remover: `components/portal/MaintenanceCard.tsx` e qualquer mock em `data/mock/*` ligado a manutenção. Build deve quebrar se sobrar import — usar TS pra garantir.

## 13. Testes

`tests/reports-rls.test.ts` (mesma infra da Fatia 1):

- Setup: 2 empresas (A, B), 1 admin, 2 mecânicos (M1, M2), 2 clients (cA em A, cB em B)
- M1 cria report → consegue ler, editar, deletar
- M2 não lê reports de M1
- M1 não pode setar `client_company_id`, `numero`, `preco_*`, `approved_*`, `rejected_*` via insert/update (RLS rejeita)
- Admin lê tudo, escreve tudo
- Client cA não vê nada enquanto reports estão `draft`/`pending_approval`
- Após admin updates: status=approved, client_company_id=A → cA vê, cB continua sem ver
- `report_intervals` segue mesmo padrão: mecânico só lê/escreve dos próprios; cascade delete funciona

Test estrutural (`tests/rls-coverage.test.ts` da Fatia 1) já cobre `reports` e `report_intervals` automaticamente.

**Testes de UI**: fora do escopo. Form é mobile e validado manualmente em device real antes de "pronto".

## 14. Variáveis de ambiente (novas)

```
SITE_URL=https://fabianobratti.com   # usado nos emails pra montar link absoluto
```

Atualizar `.env.example`.

## 15. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Mecânico perde conexão a meio-form | Perde tudo digitado | Auto-save a cada 1.5s; rascunho persistente no backend |
| Assinatura PNG muito grande (canvas em alta resolução) | Storage caro + upload lento em 4G | Canvas 600x200, qualidade média → ~10-20kb por PNG |
| Email Resend falha → admin não fica sabendo | Relatório fica pendente sem ninguém olhar | Status `pending_approval` visível na lista quando admin loga; log de falhas + alertar admin em UI |
| RLS de mecânico permite escapatória (setar campos do admin) | Mecânico aprova próprio relatório | `with check` lista cada campo administrativo explicitamente nulo; teste cobre |
| Auto-save dispara muito → custo Supabase | Bill alta | Debounce 1.5s + diff client-side antes de chamar action |
| Signature pad libs adicionam peso ao bundle | TBT pior no mobile | Dynamic import do componente (só carrega quando seção de assinatura é expandida) |
| Mecânico esquece `fim` de um intervalo e submete | Relatório incompleto aprovado | Validação server-side rejeita submit se algum intervalo ainda está aberto (fim is null) |

## 16. Critérios de pronto (Fatia 2)

- [ ] Migration `20260601120000_reports.sql` roda clean
- [ ] Bucket `signatures` criado (manualmente, documentado em deploy-notes)
- [ ] Mecânico consegue criar rascunho, editar, sair, voltar e continuar onde parou
- [ ] Auto-save salva em <2s sem travar UI
- [ ] Mecânico consegue adicionar/remover intervalos, todos persistem
- [ ] Mecânico consegue coletar assinatura no canvas → PNG salvo em `signatures/<id>/cliente.png`
- [ ] Submit valida obrigatórios e bloqueia se falta algo
- [ ] Submit envia email pro `fabiano@fb.com.br` com link clicável
- [ ] Admin vê relatório na lista `/portal/admin/relatorios` (aprovação só na Fatia 3)
- [ ] Mecânico vê rejeitados com `rejected_reason` (preenchido via DB direto, já que Fatia 3 ainda não rejeita pela UI)
- [ ] Mecânico consegue reabrir rejeitado, editar e reenviar
- [ ] Cliente em `/portal` ainda vê placeholder (não tem nada amarrado a ele)
- [ ] Testes RLS de reports/intervals passam
- [ ] Test estrutural confirma RLS em `reports` e `report_intervals`
- [ ] Build verde, sem warnings de tipo
- [ ] Sem imports quebrados depois de remover mocks de manutenção

## 17. O que vem depois (Fatia 3 prévia)

A Fatia 3 vai entregar:
- Tela `/portal/admin/relatorios/<id>` com botões **Aprovar** e **Rejeitar**
- Form de aprovação: input numérico pros 3 valores (`preco_servicos`, `preco_pecas`, `preco_total`) + select `client_company_id` (amarrar empresa)
- Server action `approveReport`: valida valores + amarra company + chama `private.next_report_numero()` → status `approved`
- Server action `rejectReport`: define `rejected_reason` + `rejected_at` → status `rejected`
- Email pro mecânico em ambos os casos (Resend)

A Fatia 4 entrega visualização pelo cliente + geração de PDF (com header novo: logo + CNPJ embaixo + título + autor + data; assinatura embebida).
