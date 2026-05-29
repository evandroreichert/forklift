# Portal — Fatia 1: Fundação (Auth + Cadastros)

**Status:** Approved design — ready for planning
**Date:** 2026-05-29
**Owner:** Fabiano Bratti Empilhadeiras
**Author:** Evandro (com Claude)

---

## 1. Contexto e objetivo

A FB Empilhadeiras usa hoje o sistema externo **Produttivo** pra gerar relatórios de manutenção em PDF (ver exemplo: `Relatorio nº 145.pdf` na raiz do repo). Queremos substituí-lo por um portal próprio integrado ao site `fabianobratti.com`, dividido em **4 fatias** com spec/plano/implementação independentes:

1. **Fatia 1 (esta) — Fundação:** Auth real + CRUD de usuários, clientes e máquinas
2. **Fatia 2:** Mecânico cria relatório (form completo, submete pra aprovação)
3. **Fatia 3:** Admin aprova/edita relatório + adiciona valor manualmente
4. **Fatia 4:** Cliente visualiza relatórios da sua empresa + geração de PDF

**Decisões fundamentais já tomadas (todas as fatias):**
- **Sem upload de fotos** no escopo do projeto
- **Stack:** Next.js 15 + Supabase (Auth + Postgres) + Resend (email) + Vercel
- **Numeração de relatórios:** sequencial global, gerada **apenas quando o admin aprova** (não em rascunho). Numeração nova, não precisa continuar do 145 do sistema antigo
- **3 papéis flat (sem hierarquia):** `admin`, `mechanic`, `client`. Fabiano = admin (faz tudo: gerencia usuários e aprova relatórios)

## 2. Escopo da Fatia 1

**Entrega ao final desta fatia:** Fabiano consegue logar, cadastrar usuários (mecânicos, clientes, outros admins), cadastrar empresas-cliente e máquinas. Mecânicos e clientes conseguem logar e ver dashboards placeholder. Nenhum relatório ainda — isso é Fatia 2.

**Dentro do escopo:**
- Auth real via Supabase (substitui `lib/auth-mock.ts`)
- 3 tabelas: `client_companies`, `profiles`, `machines`
- RLS paranoica em todas as tabelas
- Telas admin: CRUD de usuários, clientes, máquinas
- Reset de senha pelo admin (sem auto-recuperação por email)
- Infra base de email (Resend) — testada mas ainda não usada em fluxo de produto
- Testes automatizados de isolamento RLS

**Fora do escopo desta fatia (vão para fatias futuras):**
- Qualquer coisa relacionada a relatórios
- Notificação por email pra novo relatório (Fatia 2, usando a infra desta fatia)
- Geração de PDF (Fatia 4)
- Auto-recuperação de senha por email (decidido fora do MVP)
- Multi-unidade/filial dentro de um cliente (decidido fora do escopo; estrutura permite evoluir depois)
- Auditoria/log de ações
- i18n

## 3. Decisões de produto

| Decisão | Escolha | Motivo |
|---|---|---|
| Hierarquia cliente | 1 empresa = N usuários, N máquinas | Mais simples; PDF antigo não tem conceito de filial |
| Papéis | 3 flat: `admin`, `mechanic`, `client` | Admin = "faz tudo", não há manager separado |
| Cadastro de usuário | Admin define senha temporária, comunica via WhatsApp | Sem provedor de email no MVP |
| Força troca senha 1º login | **Não** | UX prioritária pra mecânico no celular |
| Política de senha | Default Supabase (mínimo 6 caracteres, sem regras de complexidade) | Mecânico precisa digitar fácil no celular — trade-off consciente |
| Recuperação de senha | Admin reseta manualmente | Coerente com cadastro; baixo volume |
| Cadastro de máquina | Obrigatórios apenas: empresa, número da máquina, horímetro. Demais opcionais | Mecânico não para pra catalogar tudo |
| Email transactional | Resend — setup nesta fatia, uso real na Fatia 2 | Notificação ao admin "novo relatório" será imediata (não digest) |

## 4. Arquitetura

- **Next.js 15 App Router** (já existente). Server Components + Server Actions onde possível; cliente JS só em forms interativos
- **Supabase**:
  - Postgres com RLS habilitada em **toda** tabela do schema `public`
  - Supabase Auth (email + senha) — gerencia `auth.users`; nosso `profiles` faz 1:1 via FK
  - `@supabase/ssr` pra integração com Next.js (cookies httpOnly, refresh automático)
- **Resend SDK** pra envio de email (setup base, sem uso em fluxo de produto ainda)
- **Tailwind v4 + shadcn/ui + lucide-react** já presentes — reusar `Sidebar`/`Topbar` do portal existente
- **Sem ORM**: queries via cliente Supabase tipado (`supabase-js` gera tipos a partir do schema com `supabase gen types`)

## 5. Esquema do banco e RLS (1 migration atômica)

Tudo em **uma única migration** (`supabase/migrations/20260529120000_initial_schema.sql`) na ordem: schema `private` → enums → helper functions → tabelas → índices → triggers → RLS enable → policies. Migration única evita estados intermediários onde tabela existe mas RLS ainda não está ativa.

### 5.1 Princípios de segurança

- **Anon key não acessa dado nenhum.** Só pode chamar `auth.signInWithPassword` (e `auth.signOut`).
- **Toda tabela do schema `public` tem RLS habilitada na mesma migration que a cria.** Test no CI valida isso pra qualquer tabela futura.
- **Nenhuma RPC exposta a anon ou public.** Helper functions ficam em schema próprio `private`, com `execute` revogado de `public, anon` e concedido só a `authenticated`.
- **Service role key (`SUPABASE_SERVICE_ROLE_KEY`) só em server actions específicas** que precisam bypassar RLS — exclusivamente: criar usuário (`auth.admin.createUser`) e resetar senha (`auth.admin.updateUserById`). Centralizadas em `lib/supabase/admin.ts` com `import 'server-only'` no topo.

### 5.2 SQL completo da migration

```sql
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
```

### 5.3 Notas importantes

**`security definer` + `set search_path = ''` é obrigatório em toda função.** Sem isso, vulnerável a search_path hijacking — escalada de privilégio conhecida do Postgres.

**Por que mecânico lê `client_companies` e `machines` desde a Fatia 1?** Porque a Fatia 2 (criação de relatório) vai precisar — mecânico seleciona cliente + máquina no form. Configurar agora evita migration extra depois.

**Por que `on delete restrict` em FKs?** Pra evitar deletar cliente com máquinas/usuários vinculados. Admin precisa desativar (`active = false`) ou limpar dependências primeiro.

**Por que `private.user_role()` dentro de policy de `profiles` não vira loop infinito?** A função é `security definer`, executa com privilégio do owner (postgres), bypassando RLS — o select dentro dela não dispara as policies de `profiles`. Já testado/validado por outros projetos Supabase, mas a suite de testes RLS vai cobrir.

## 6. Fluxo de autenticação

1. Usuário não logado tenta acessar `/portal/*` → middleware redireciona pra `/login`
2. Em `/login`: form email + senha → `supabase.auth.signInWithPassword`
3. Após sucesso, server action carrega `profile` (full_name, role, active, client_company_id)
4. Se `active = false` → desloga + erro "Conta desativada, contate o admin"
5. Caso contrário, redirect pra `/portal` (todos os roles caem na mesma URL; o dashboard renderiza conteúdo por role)
6. Em `/portal/admin/*`, layout adicional checa `role === 'admin'` e redireciona pra `/portal` caso contrário

**Middleware (`middleware.ts`):**
- Roda em toda rota `/portal/*` e `/login`
- Renova session via `@supabase/ssr` (cookies httpOnly)
- Em `/portal/*` sem session → redirect `/login`
- Em `/login` com session válida → redirect `/portal`

## 7. Estrutura de arquivos

Novos arquivos a criar:

```
app/(portal)/
  login/
    page.tsx                       # REFATORAR — hoje é mock
  portal/
    page.tsx                       # REFATORAR — dashboard real por role
    admin/
      layout.tsx                   # NOVO — gate role === 'admin'
      page.tsx                     # NOVO — dashboard admin (atalhos pros 3 cadastros)
      usuarios/
        page.tsx                   # lista
        novo/page.tsx              # criar
        [id]/page.tsx              # editar
      clientes/
        page.tsx
        novo/page.tsx
        [id]/page.tsx
      maquinas/
        page.tsx
        novo/page.tsx
        [id]/page.tsx

components/portal/
  admin/
    UsuariosTable.tsx
    UsuarioForm.tsx
    ResetSenhaButton.tsx
    ClientesTable.tsx
    ClienteForm.tsx
    MaquinasTable.tsx
    MaquinaForm.tsx
  Sidebar.tsx                       # ATUALIZAR — nav dinâmica por role
  Topbar.tsx                        # ATUALIZAR — user real, não mock

lib/
  supabase/
    client.ts                       # NOVO — browser client (anon)
    server.ts                       # NOVO — RSC/server action client (cookie)
    middleware.ts                   # NOVO — middleware client (refresh)
    admin.ts                        # NOVO — service-role client (server-only)
  email.ts                          # NOVO — Resend wrapper
  auth.ts                           # NOVO — requireRole(), getCurrentProfile()
  auth-mock.ts                      # DELETAR
  database.types.ts                 # NOVO — gerado por supabase gen types

middleware.ts                       # NOVO — auth middleware

supabase/
  migrations/
    20260529120000_initial_schema.sql   # tudo: schema, tabelas, RLS, policies, triggers
  seed.sql                          # bootstrap admin Fabiano (rodado manualmente uma vez)

tests/
  rls.test.ts                       # isolamento RLS
  scripts/
    setup-test-data.ts              # cria fixtures pra testes

data/mock/cliente.ts                # DELETAR (mock antigo)
```

## 8. Telas (UI)

Visual mantém o portal dark existente (ink-950 + brand yellow accents). Reusa `Sidebar` e `Topbar` de `components/portal/`. Forms usam shadcn primitives (já instalados).

**`/login`** (refatorar mock)
- Form: email + senha
- Botão "Entrar"
- Erros: credencial inválida / conta desativada
- Link "Esqueci a senha" → toast "Contate o admin pra resetar"

**`/portal`** (refatorar mock)
- Renderiza dashboard por role:
  - **admin:** 3 cards-atalho (Usuários, Clientes, Máquinas) com contagem total
  - **mechanic:** placeholder "Em breve: criar relatório de manutenção"
  - **client:** placeholder "Em breve: visualizar relatórios"

**`/portal/admin/usuarios`** (admin only)
- Tabela: Nome | Email | Papel | Empresa (se client) | Ativo | ações
- Filtros: busca por nome/email; filter por papel
- Paginação simples (20/pág)
- Botão "+ Novo usuário"

**`/portal/admin/usuarios/novo`**
- Form: Nome completo, Email, Papel (select), Empresa (select, visível só se papel=client), Senha temporária
- Submit cria via service-role (`auth.admin.createUser`) + insert em `profiles`

**`/portal/admin/usuarios/[id]`**
- Form: Nome, Papel, Empresa (se client), Ativo (toggle)
- Email é read-only (mudar email = caso extremo, fora MVP)
- Botão destacado "Resetar senha" → dialog define nova senha temporária

**`/portal/admin/clientes`**
- Tabela: Nome | CNPJ | Telefone | Ativo | ações
- Busca por nome/CNPJ

**`/portal/admin/clientes/novo`** e **`/[id]`**
- Form: Nome (obrig), CNPJ, Telefone, Ativo

**`/portal/admin/maquinas`**
- Tabela: Cliente | Nº | Horímetro | Modelo | Ativo | ações
- Filtro: selecionar cliente; busca por nº

**`/portal/admin/maquinas/novo`** e **`/[id]`**
- Form: Cliente (select, obrig), Nº (obrig), Horímetro atual (obrig), Modelo, Fabricante, Combustível, Nº de série, Ativo

## 9. Email (infra base)

`lib/email.ts`:

```ts
import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    ...args,
  });
}
```

**Validação de setup:** rota oculta `/portal/admin/_test-email` (só admin, sem link na UI) envia "Teste de configuração" pro email do user logado. Usada uma vez pra confirmar SPF/DKIM/Resend ok, depois pode ficar.

**Tarefas de DNS** (fora do código, documentar em `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md` — criar como parte do plano):
- Adicionar registros SPF/DKIM do Resend no DNS do `fabianobratti.com`
- Verificar domínio no painel do Resend

## 10. Variáveis de ambiente

`.env.local` (gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only
RESEND_API_KEY=                   # server-only
RESEND_FROM_EMAIL=relatorios@fabianobratti.com
```

`.env.example` checado no git, com placeholders.

## 11. Testes

**Foco:** garantir isolamento RLS. Bug aqui = vazamento de dado de cliente A pro cliente B = morte do produto.

`tests/rls.test.ts` (vitest + `@supabase/supabase-js`):
- Setup: cria 2 empresas-cliente (A, B), 1 user admin, 1 mechanic, 1 user-client-A, 1 user-client-B, 1 máquina por empresa
- Cria 4 clients Supabase: anon, admin-session, mechanic-session, client-A-session
- Assertions:
  - anon: 0 rows em select de qualquer tabela
  - client-A: vê só sua company e suas máquinas, **não vê** company/máquinas de B
  - client-A: tentativa de INSERT/UPDATE em `machines` falha
  - mechanic: lê todas as companies/machines, mas INSERT/UPDATE falha
  - admin: tudo permitido

**Validação estrutural** (`tests/rls-coverage.test.ts`):
- Query `pg_class` pra confirmar `relrowsecurity = true` em **toda** tabela do schema `public`
- Falha CI se alguma tabela tiver RLS desabilitada (proteção pra futuro)

**Como rodar:** projeto Supabase local via `supabase start` (Docker) tanto em dev quanto em CI. Scripts `npm run test:rls` e `npm run test:rls-coverage` apontam pro `SUPABASE_URL` local. CI roda `supabase start` no setup do workflow antes dos testes. Sem dependência de projeto Supabase remoto pra CI — evita custo e isolamento entre PRs.

## 12. Bootstrap inicial

`supabase/seed.sql` (rodado manualmente UMA vez no projeto Supabase):
1. Cria user `fabiano@fb.com.br` via Supabase Dashboard (admin > authentication > add user) com senha temporária
2. Roda SQL:

```sql
insert into profiles (id, full_name, role)
values ('<uuid-do-auth-user>', 'Fabiano Bratti', 'admin');
```

A partir daí o Fabiano loga e cria todos os outros usuários pelo painel.

Documentar processo em `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md`.

## 13. Plano de migração das telas mock atuais

Hoje o portal tem mocks reais funcionando (`lib/auth-mock.ts`, `data/mock/cliente.ts`, `components/portal/MaintenanceCard.tsx` etc.). A Fatia 1 **não toca os componentes de manutenção** — eles serão substituídos na Fatia 2 quando relatórios reais existirem.

**Decisão:** durante a Fatia 1, deixar os componentes mock de manutenção visíveis no dashboard do mechanic/client como **placeholder ilustrativo**, com um aviso "Dados de exemplo — em breve dados reais". Isso evita regressão visual no portal entre fatias.

Refactor real desses componentes vai pra Fatia 2.

## 14. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Esquecer RLS numa tabela futura | Vazamento de dados | Test estrutural no CI valida `relrowsecurity` em toda tabela public |
| `security definer` sem `search_path` | Escalada de privilégio | Convenção forçada no PR template + revisão; presente em todas as funções desta fatia |
| Service role key vazada | Comprometimento total | Apenas em `lib/supabase/admin.ts` com `import 'server-only'`; nunca em client component |
| Senha simples + sem força troca | Conta comprometida | Trade-off consciente do dono. Mitigado parcialmente por: RLS limita o estrago, admin pode desativar conta, sessão expira em 1 semana |
| Email do Resend cai em spam | Notificações da Fatia 2 ignoradas | Configurar SPF + DKIM antes de Fatia 2; testar com rota oculta nesta fatia |
| `private.user_role()` chamado em loop por policy de `profiles` | Recursão infinita | Como é `security definer`, bypassa RLS — sem loop. Mas precisa estar **bem testado** |

## 15. Critérios de pronto (Fatia 1)

- [ ] Migrations rodam clean em projeto Supabase novo
- [ ] Fabiano consegue logar e criar: 1 mecânico, 1 cliente (empresa), 1 user cliente, 1 máquina
- [ ] Mecânico consegue logar e ver dashboard placeholder
- [ ] User cliente consegue logar e ver dashboard placeholder
- [ ] Toggle ativo=false em um user impede login dele
- [ ] Reset de senha pelo admin funciona (user antigo loga com senha nova)
- [ ] Testes RLS passam: client-A não vê dados de client-B
- [ ] Test estrutural confirma RLS em todas as tabelas
- [ ] Build Next.js verde, sem warnings de tipo
- [ ] `/portal/admin/_test-email` envia email com sucesso
- [ ] `.env.example` documenta todas variáveis

## 16. O que vem depois (Fatia 2 prévia)

A Fatia 2 vai adicionar:
- Tabela `reports` com campos do PDF 145 (exceto fotos), status (`draft`, `pending_approval`, `approved`, `rejected`), FK pra `machine`, `mechanic_user`
- Form de criação de relatório (mobile-first — mecânico usa no celular em campo)
- Tela "Meus relatórios" do mecânico
- Notificação por email ao admin **no momento** que mecânico clica "Enviar pra aprovação" (uso real do `lib/email.ts` criado nesta fatia)
- Update do `machines.horimetro_atual` após relatório aprovado

A numeração sequencial (campo `numero` em `reports`) só será atribuída quando o admin aprovar (Fatia 3), via trigger ou server action.
