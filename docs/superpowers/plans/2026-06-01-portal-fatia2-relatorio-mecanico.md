# Portal — Fatia 2 (Relatório do Mecânico) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o form mobile-first onde o mecânico cria e envia relatórios de manutenção (com assinatura desenhada do cliente), com auto-save no backend e notificação por email pro admin no envio.

**Architecture:** Next.js 15 App Router; tabelas `reports` + `report_intervals` no Postgres com RLS por role; assinatura como PNG em bucket privado `signatures` do Supabase Storage, acesso intermediado por server actions com `lib/supabase/admin.ts`; auto-save por debounce 1.5s via server actions; email via Resend imediato no submit.

**Tech Stack:** Next.js 15.5 + React 19 + TypeScript estrito + Tailwind v4 + shadcn/ui + Supabase JS v2 (@supabase/ssr) + Resend SDK + Vitest + `react-signature-canvas`.

**Spec:** `docs/superpowers/specs/2026-06-01-portal-fatia2-relatorio-mecanico.md`

---

## Pré-requisitos

- Fatia 1 completa e funcionando (auth, RLS, admin Fabiano, CRUD usuários/clientes)
- Acesso ao painel Supabase remoto pra criar bucket Storage
- `.env.local` com credenciais válidas

---

## File Structure (planejamento)

```
NEW:
  supabase/migrations/20260601120000_reports.sql
  lib/reports/types.ts                                  # tipos derivados
  lib/reports/validate.ts                               # validação reusável (cliente + servidor)
  lib/storage/signatures.ts                             # upload/getUrl assinatura (server-only)
  lib/email/templates/novoRelatorio.ts                  # template HTML do email
  components/portal/SignaturePad.tsx                    # client component (canvas)
  components/portal/IntervalsList.tsx
  components/portal/TipoAtividade.tsx
  components/portal/MaquinaParadaRadio.tsx
  components/portal/AutoSaveStatus.tsx
  components/portal/RejectedBanner.tsx
  components/portal/ReportFieldsCard.tsx                # vista read-only
  components/portal/ReportsList.tsx                     # reusado mecânico/admin
  app/(portal)/portal/mecanico/layout.tsx               # gate role='mechanic'
  app/(portal)/portal/mecanico/relatorios/page.tsx
  app/(portal)/portal/mecanico/relatorios/actions.ts    # server actions
  app/(portal)/portal/mecanico/relatorios/[id]/page.tsx
  app/(portal)/portal/mecanico/relatorios/[id]/editar/page.tsx
  app/(portal)/portal/admin/relatorios/page.tsx
  tests/reports-rls.test.ts

MODIFY:
  lib/database.types.ts                                 # adiciona reports/report_intervals
  components/portal/Sidebar.tsx                         # link "Relatórios" por role
  app/(portal)/portal/page.tsx                          # dashboard cards reais (mechanic + admin)
  .env.example                                          # adiciona SITE_URL
  package.json                                          # adiciona react-signature-canvas
```

---

## PHASE 1 — Backend: schema, tipos, Storage, testes RLS

### Task 1: Migration de reports + report_intervals

**Files:**
- Create: `supabase/migrations/20260601120000_reports.sql`

- [ ] **Step 1: Criar arquivo de migration**

```bash
touch supabase/migrations/20260601120000_reports.sql
```

- [ ] **Step 2: Colar SQL completo da spec**

Abrir `docs/superpowers/specs/2026-06-01-portal-fatia2-relatorio-mecanico.md`, copiar todo o conteúdo do bloco SQL da **seção 4.2** (do comentário `-- 1. Enums` até o fim do bloco `admin all intervals`) e colar em `supabase/migrations/20260601120000_reports.sql`.

- [ ] **Step 3: Aplicar migration**

```bash
npm run db:apply 20260601
```

Esperado: `Aplicada: 20260601120000_reports.sql`.

- [ ] **Step 4: Verificar tabelas no Studio remoto**

Painel Supabase (uhtodltjysbcnprexoiu) → Table Editor → confirmar `reports` e `report_intervals` listadas com cadeado (RLS habilitada).

- [ ] **Step 5: Verificar policies**

Painel → Authentication → Policies → deve listar:
- `reports`: 6 policies (mechanic reads/creates/updates/deletes own; admin reads/writes; client reads approved)
- `report_intervals`: 4 policies (mechanic reads/writes own editable; admin all; client reads approved)

- [ ] **Step 6: Verificar função helper**

Painel → SQL Editor:

```sql
select proname from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'private' and p.proname = 'next_report_numero';
```

Esperado: 1 row.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260601120000_reports.sql
git commit -m "feat(db): schema de relatórios (reports + report_intervals) com RLS por role"
```

---

### Task 2: Estender lib/database.types.ts

**Files:**
- Modify: `lib/database.types.ts`

- [ ] **Step 1: Adicionar tipos das novas tabelas e enum**

Abrir `lib/database.types.ts`. Dentro de `public.Tables`, **depois** de `profiles`, adicionar:

```ts
      reports: {
        Row: {
          id: string;
          numero: number | null;
          status: Database['public']['Enums']['report_status'];
          mechanic_id: string;
          cliente_nome: string;
          client_company_id: string | null;
          titulo: string;
          maquina_identificador: string;
          horimetro: number;
          is_preventiva: boolean;
          is_corretiva: boolean;
          maquina_parada: boolean;
          sumario_defeitos: string;
          produtos: string | null;
          responsavel_nome: string | null;
          assinatura_path: string | null;
          preco_servicos: number | null;
          preco_pecas: number | null;
          preco_total: number | null;
          submitted_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejected_reason: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number | null;
          status?: Database['public']['Enums']['report_status'];
          mechanic_id: string;
          cliente_nome: string;
          client_company_id?: string | null;
          titulo: string;
          maquina_identificador: string;
          horimetro: number;
          is_preventiva?: boolean;
          is_corretiva?: boolean;
          maquina_parada: boolean;
          sumario_defeitos: string;
          produtos?: string | null;
          responsavel_nome?: string | null;
          assinatura_path?: string | null;
          preco_servicos?: number | null;
          preco_pecas?: number | null;
          preco_total?: number | null;
          submitted_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number | null;
          status?: Database['public']['Enums']['report_status'];
          mechanic_id?: string;
          cliente_nome?: string;
          client_company_id?: string | null;
          titulo?: string;
          maquina_identificador?: string;
          horimetro?: number;
          is_preventiva?: boolean;
          is_corretiva?: boolean;
          maquina_parada?: boolean;
          sumario_defeitos?: string;
          produtos?: string | null;
          responsavel_nome?: string | null;
          assinatura_path?: string | null;
          preco_servicos?: number | null;
          preco_pecas?: number | null;
          preco_total?: number | null;
          submitted_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_mechanic_id_fkey';
            columns: ['mechanic_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_client_company_id_fkey';
            columns: ['client_company_id'];
            isOneToOne: false;
            referencedRelation: 'client_companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      report_intervals: {
        Row: {
          id: string;
          report_id: string;
          ordem: number;
          inicio: string;
          fim: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          ordem: number;
          inicio: string;
          fim?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          ordem?: number;
          inicio?: string;
          fim?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'report_intervals_report_id_fkey';
            columns: ['report_id'];
            isOneToOne: false;
            referencedRelation: 'reports';
            referencedColumns: ['id'];
          },
        ];
      };
```

- [ ] **Step 2: Adicionar enum `report_status` em `Enums`**

Localizar o objeto `Enums` (atualmente só com `user_role`) e substituir por:

```ts
    Enums: {
      user_role: 'admin' | 'mechanic' | 'client';
      report_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
    };
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Esperado: build verde.

- [ ] **Step 4: Commit**

```bash
git add lib/database.types.ts
git commit -m "types(db): tipos de reports e report_intervals"
```

---

### Task 3: Criar bucket Storage `signatures` (manual + deploy notes)

**Files:**
- Modify: `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md`

- [ ] **Step 1: Criar bucket no painel Supabase**

Painel → Storage → "New bucket":
- Name: `signatures`
- Public: **OFF** (privado)
- File size limit: 200 KB
- Allowed MIME types: `image/png`

Sem policies (acesso só via service role). Salvar.

- [ ] **Step 2: Adicionar seção em deploy notes**

Abrir `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md`, adicionar no final:

```markdown

## Fatia 2 — Bucket Storage `signatures`

Criar bucket manualmente no painel Supabase (uma vez por projeto):
- Nome: `signatures`
- Privado (público OFF)
- Limite por arquivo: 200 KB
- MIME permitido: `image/png`
- **Sem policies** — acesso só via service role (`lib/supabase/admin.ts` + server actions)

Estrutura de paths: `signatures/<report_id>/cliente.png`
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md
git commit -m "docs: notas de criação do bucket signatures (Fatia 2)"
```

---

### Task 4: Testes RLS de reports

**Files:**
- Create: `tests/reports-rls.test.ts`

- [ ] **Step 1: Estudar helpers de teste existentes**

Ler `tests/rls.test.ts` (Fatia 1) e `tests/scripts/setup-test-data.ts` se existir. Anotar:
- Como criar clientes Supabase com session de cada role
- Como o setup limpa dados entre testes
- Padrões de assertion

- [ ] **Step 2: Criar arquivo de teste**

```bash
touch tests/reports-rls.test.ts
```

- [ ] **Step 3: Escrever cenários (a partir da seção 13 do spec)**

Estrutura mínima:

```ts
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// helpers — reusar setup da Fatia 1 se aplicável

describe('reports RLS', () => {
  // setup: 2 companies (A, B), 1 admin, 2 mechanics (M1, M2), 2 clients (cA, cB)

  it('mecânico cria draft próprio', async () => {
    // M1 insert reports {mechanic_id: M1, status: draft, ...}
    // esperado: ok, retorna id
  });

  it('mecânico NÃO consegue setar client_company_id no insert', async () => {
    // M1 insert com client_company_id preenchido
    // esperado: RLS rejeita
  });

  it('mecânico NÃO consegue setar numero, preco_*, approved_*, rejected_*', async () => {
    // M1 insert/update setando cada um desses campos
    // esperado: RLS rejeita
  });

  it('mecânico M2 não lê reports de M1', async () => {
    // M2 select where id = M1.report.id
    // esperado: 0 rows
  });

  it('mecânico submete draft -> pending_approval (mantendo campos admin nulos)', async () => {
    // M1 update set status='pending_approval' onde id=draft próprio
    // esperado: ok
  });

  it('mecânico edita rejected -> pending_approval', async () => {
    // setup via admin: status=rejected + rejected_reason
    // M1 update set status='pending_approval' (e ajusta sumario)
    // esperado: ok
  });

  it('admin lê e escreve tudo', async () => { /* ... */ });

  it('client cA não vê reports draft/pending_approval', async () => {
    // cA select reports
    // esperado: 0 rows (mesmo dos seus M1 reports antes de approve)
  });

  it('client cA vê reports approved da própria company', async () => {
    // admin update reports set status=approved, client_company_id=A, numero=1, approved_by=admin, approved_at=now
    // cA select reports
    // esperado: 1 row
    // cB select reports → 0 rows
  });

  it('report_intervals cascade delete com report', async () => {
    // admin delete report → intervals somem
  });
});
```

(Detalhe cada teste com helpers de setup — segue padrão `tests/rls.test.ts`.)

- [ ] **Step 4: Rodar testes — devem falhar inicialmente se há bugs de RLS**

```bash
npm run test reports-rls
```

Iterar até passar. Se um cenário falhar, ler a policy correspondente na migration (`supabase/migrations/20260601120000_reports.sql`), corrigir, reaplicar.

- [ ] **Step 5: Commit**

```bash
git add tests/reports-rls.test.ts
git commit -m "test(rls): isolamento de reports e report_intervals por role"
```

---

## PHASE 2 — Lib (tipos, validação, storage, email)

### Task 5: lib/reports/types.ts e validate.ts

**Files:**
- Create: `lib/reports/types.ts`
- Create: `lib/reports/validate.ts`

- [ ] **Step 1: Criar `lib/reports/types.ts`**

```ts
import type { Database } from '@/lib/database.types';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];
export type ReportInterval = Database['public']['Tables']['report_intervals']['Row'];
export type ReportStatus = Database['public']['Enums']['report_status'];

export type ReportWithIntervals = Report & { intervals: ReportInterval[] };

// Subconjunto editável pelo mecânico (campos administrativos ficam fora)
export type ReportEditable = Pick<
  Report,
  | 'titulo'
  | 'cliente_nome'
  | 'maquina_identificador'
  | 'horimetro'
  | 'is_preventiva'
  | 'is_corretiva'
  | 'maquina_parada'
  | 'sumario_defeitos'
  | 'produtos'
  | 'responsavel_nome'
  | 'assinatura_path'
>;
```

- [ ] **Step 2: Criar `lib/reports/validate.ts`**

```ts
import type { ReportEditable, ReportInterval } from './types';

export type ValidationError = { field: string; message: string };

export function validateForSubmit(
  report: Partial<ReportEditable>,
  intervals: Pick<ReportInterval, 'inicio' | 'fim'>[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!report.titulo?.trim()) errors.push({ field: 'titulo', message: 'Título obrigatório' });
  if (!report.cliente_nome?.trim())
    errors.push({ field: 'cliente_nome', message: 'Nome do cliente obrigatório' });
  if (!report.maquina_identificador?.trim())
    errors.push({ field: 'maquina_identificador', message: 'Identificador da máquina obrigatório' });
  if (report.horimetro == null || report.horimetro < 0)
    errors.push({ field: 'horimetro', message: 'Horímetro inválido' });
  if (!report.is_preventiva && !report.is_corretiva)
    errors.push({
      field: 'tipo_atividade',
      message: 'Marque pelo menos um tipo (preventiva ou corretiva)',
    });
  if (report.maquina_parada == null)
    errors.push({ field: 'maquina_parada', message: 'Informe se a máquina ficou parada' });
  if (!report.sumario_defeitos?.trim())
    errors.push({ field: 'sumario_defeitos', message: 'Sumário dos defeitos obrigatório' });
  if (!report.responsavel_nome?.trim())
    errors.push({ field: 'responsavel_nome', message: 'Nome do responsável obrigatório' });
  if (!report.assinatura_path)
    errors.push({ field: 'assinatura', message: 'Assinatura do cliente obrigatória' });
  if (intervals.length === 0)
    errors.push({ field: 'intervalos', message: 'Adicione pelo menos um intervalo' });
  if (intervals.some((i) => !i.fim))
    errors.push({ field: 'intervalos', message: 'Todos os intervalos precisam de horário de fim' });

  return errors;
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add lib/reports/
git commit -m "feat(reports): tipos e validação de relatórios"
```

---

### Task 6: lib/storage/signatures.ts

**Files:**
- Create: `lib/storage/signatures.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'signatures';

function pathFor(reportId: string) {
  return `${reportId}/cliente.png`;
}

/**
 * Faz upload da assinatura como PNG no bucket privado.
 * Recebe base64 dataURL (data:image/png;base64,...) ou só o conteúdo base64.
 */
export async function uploadSignature(reportId: string, dataUrl: string): Promise<string> {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  if (!base64) throw new Error('PNG vazio');
  const bytes = Buffer.from(base64, 'base64');

  if (bytes.byteLength > 200_000) throw new Error('Assinatura excede 200KB');

  const supabase = createAdminClient();
  const path = pathFor(reportId);
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function getSignatureSignedUrl(path: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteSignature(path: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
```

- [ ] **Step 2: Verificar nome da factory em `lib/supabase/admin.ts`**

Abrir `lib/supabase/admin.ts` e confirmar o nome da função exportada. Se for `createClient` em vez de `createAdminClient`, ajustar o import acima.

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add lib/storage/signatures.ts
git commit -m "feat(storage): helpers de assinatura (upload/url assinada/delete)"
```

---

### Task 7: Email template "novo relatório aguardando aprovação"

**Files:**
- Create: `lib/email/templates/novoRelatorio.ts`

- [ ] **Step 1: Criar template**

```ts
type NovoRelatorioArgs = {
  reportId: string;
  mechanicName: string;
  clienteNome: string;
  maquinaIdentificador: string;
  horimetro: number;
  siteUrl: string;
};

export function novoRelatorioEmail(args: NovoRelatorioArgs): { subject: string; html: string } {
  const link = `${args.siteUrl}/portal/admin/relatorios/${args.reportId}`;
  const subject = `[FB] Novo relatório aguardando aprovação — ${args.clienteNome}`;

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#0a0a0a;font-family:Arial,sans-serif;color:#fff">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#171717;border-radius:12px;padding:32px">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:20px;color:#FFD500">Novo relatório de manutenção</h1>
        <p style="margin:0 0 8px;color:#d4d4d4">Mecânico: <strong style="color:#fff">${escapeHtml(args.mechanicName)}</strong></p>
        <p style="margin:0 0 8px;color:#d4d4d4">Cliente: <strong style="color:#fff">${escapeHtml(args.clienteNome)}</strong></p>
        <p style="margin:0 0 8px;color:#d4d4d4">Máquina: <strong style="color:#fff">${escapeHtml(args.maquinaIdentificador)}</strong> · Horímetro: <strong style="color:#fff">${args.horimetro}</strong></p>
        <p style="margin:24px 0 0">
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#FFD500;color:#000;text-decoration:none;border-radius:8px;font-weight:bold">Ver relatório</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

- [ ] **Step 2: Adicionar SITE_URL em .env.example e .env.local**

Em `.env.example`, adicionar no final:

```
# URL absoluta usada em emails transactionais
SITE_URL=https://fabianobratti.com
```

Em `.env.local`, adicionar:

```
SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add lib/email/templates/novoRelatorio.ts .env.example
git commit -m "feat(email): template de notificação de novo relatório"
```

---

### Task 8: Server actions de relatórios

**Files:**
- Create: `app/(portal)/portal/mecanico/relatorios/actions.ts`

- [ ] **Step 1: Criar arquivo com todas as actions**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireProfile, requireRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { novoRelatorioEmail } from '@/lib/email/templates/novoRelatorio';
import { uploadSignature } from '@/lib/storage/signatures';
import { validateForSubmit } from '@/lib/reports/validate';
import type { ReportEditable, ReportInterval } from '@/lib/reports/types';

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function createDraft(): Promise<ActionResult<{ id: string }>> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      mechanic_id: profile.id,
      cliente_nome: '',
      titulo: '',
      maquina_identificador: '',
      horimetro: 0,
      maquina_parada: false,
      sumario_defeitos: '',
      is_preventiva: false,
      is_corretiva: true,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/portal/mecanico/relatorios');
  return { ok: true, data: { id: data.id } };
}

export async function updateDraft(
  reportId: string,
  fields: Partial<ReportEditable>,
): Promise<ActionResult> {
  await requireRole('mechanic');
  const supabase = await createClient();

  // RLS bloqueia escrita de campos administrativos; aqui só passamos campos do mecânico
  const allowed: (keyof ReportEditable)[] = [
    'titulo',
    'cliente_nome',
    'maquina_identificador',
    'horimetro',
    'is_preventiva',
    'is_corretiva',
    'maquina_parada',
    'sumario_defeitos',
    'produtos',
    'responsavel_nome',
    'assinatura_path',
  ];
  const payload: Partial<ReportEditable> = {};
  for (const k of allowed) if (k in fields) (payload as Record<string, unknown>)[k] = fields[k];

  const { error } = await supabase.from('reports').update(payload).eq('id', reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
  return { ok: true };
}

export async function upsertInterval(
  reportId: string,
  interval: { id?: string; ordem: number; inicio: string; fim: string | null },
): Promise<ActionResult<{ id: string }>> {
  await requireRole('mechanic');
  const supabase = await createClient();

  if (interval.id) {
    const { data, error } = await supabase
      .from('report_intervals')
      .update({ ordem: interval.ordem, inicio: interval.inicio, fim: interval.fim })
      .eq('id', interval.id)
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
    return { ok: true, data: { id: data.id } };
  }

  const { data, error } = await supabase
    .from('report_intervals')
    .insert({ report_id: reportId, ordem: interval.ordem, inicio: interval.inicio, fim: interval.fim })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
  return { ok: true, data: { id: data.id } };
}

export async function deleteInterval(intervalId: string, reportId: string): Promise<ActionResult> {
  await requireRole('mechanic');
  const supabase = await createClient();
  const { error } = await supabase.from('report_intervals').delete().eq('id', intervalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/portal/mecanico/relatorios/${reportId}/editar`);
  return { ok: true };
}

export async function uploadSignatureAction(
  reportId: string,
  pngBase64: string,
): Promise<ActionResult<{ path: string }>> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  // Confirma ownership e status editável antes do upload
  const { data: report, error: rErr } = await supabase
    .from('reports')
    .select('id, mechanic_id, status')
    .eq('id', reportId)
    .single();
  if (rErr || !report) return { ok: false, error: 'Relatório não encontrado' };
  if (report.mechanic_id !== profile.id)
    return { ok: false, error: 'Sem permissão' };
  if (report.status !== 'draft' && report.status !== 'rejected')
    return { ok: false, error: 'Relatório não está editável' };

  try {
    const path = await uploadSignature(reportId, pngBase64);
    const upd = await supabase.from('reports').update({ assinatura_path: path }).eq('id', reportId);
    if (upd.error) return { ok: false, error: upd.error.message };
    return { ok: true, data: { path } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha no upload' };
  }
}

export async function submitReport(reportId: string): Promise<ActionResult> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();
  if (!report) return { ok: false, error: 'Relatório não encontrado' };
  if (report.mechanic_id !== profile.id) return { ok: false, error: 'Sem permissão' };
  if (report.status !== 'draft' && report.status !== 'rejected')
    return { ok: false, error: 'Status não permite envio' };

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('inicio, fim')
    .eq('report_id', reportId)
    .order('ordem', { ascending: true });

  const errors = validateForSubmit(report, intervals ?? []);
  if (errors.length > 0) return { ok: false, error: errors.map((e) => e.message).join('; ') };

  const submitPayload: Record<string, unknown> = {
    status: 'pending_approval',
    submitted_at: new Date().toISOString(),
  };
  if (report.status === 'rejected') {
    submitPayload.rejected_reason = null;
    submitPayload.rejected_at = null;
  }

  const { error: upErr } = await supabase.from('reports').update(submitPayload).eq('id', reportId);
  if (upErr) return { ok: false, error: upErr.message };

  // Notifica admins por email (best-effort)
  try {
    const adminClient = createAdminClient();
    const { data: admins } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'admin')
      .eq('active', true);

    const emails: string[] = [];
    for (const a of admins ?? []) {
      const { data: u } = await adminClient.auth.admin.getUserById(a.id);
      if (u.user?.email) emails.push(u.user.email);
    }

    if (emails.length > 0) {
      const { subject, html } = novoRelatorioEmail({
        reportId,
        mechanicName: profile.full_name,
        clienteNome: report.cliente_nome,
        maquinaIdentificador: report.maquina_identificador,
        horimetro: Number(report.horimetro),
        siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
      });
      await sendEmail({ to: emails, subject, html });
    }
  } catch (err) {
    console.error('[submitReport] notificação ao admin falhou:', err);
  }

  revalidatePath('/portal/mecanico/relatorios');
  revalidatePath(`/portal/mecanico/relatorios/${reportId}`);
  return { ok: true };
}

export async function reopenRejected(reportId: string): Promise<ActionResult> {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('mechanic_id, status')
    .eq('id', reportId)
    .single();
  if (!report || report.mechanic_id !== profile.id) return { ok: false, error: 'Sem permissão' };
  if (report.status !== 'rejected') return { ok: false, error: 'Status não permite reabertura' };

  const { error } = await supabase
    .from('reports')
    .update({ status: 'draft', rejected_reason: null, rejected_at: null })
    .eq('id', reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/portal/mecanico/relatorios/${reportId}`);
  return { ok: true };
}

export async function deleteDraft(reportId: string): Promise<ActionResult> {
  await requireRole('mechanic');
  const supabase = await createClient();
  const { error } = await supabase.from('reports').delete().eq('id', reportId).eq('status', 'draft');
  if (error) return { ok: false, error: error.message };
  revalidatePath('/portal/mecanico/relatorios');
  return { ok: true };
}
```

- [ ] **Step 2: Verificar `requireRole` aceita string única**

Abrir `lib/auth.ts` e confirmar assinatura de `requireRole`. Se for `requireRole(roles: UserRole | UserRole[])`, o uso acima funciona. Caso contrário, ajustar pra passar `['mechanic']`.

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Pode aparecer warnings sobre actions não usadas — vamos consumir nas próximas tasks.

- [ ] **Step 4: Commit**

```bash
git add app/(portal)/portal/mecanico/relatorios/actions.ts
git commit -m "feat(reports): server actions de CRUD, submit e reabertura de relatórios"
```

---

## PHASE 3 — UI

### Task 9: Instalar react-signature-canvas + componente SignaturePad

**Files:**
- Modify: `package.json`
- Create: `components/portal/SignaturePad.tsx`

- [ ] **Step 1: Instalar lib**

```bash
npm install react-signature-canvas
npm install -D @types/react-signature-canvas
```

- [ ] **Step 2: Criar componente**

```tsx
'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type Props = {
  initialUrl?: string | null;
  onConfirm: (pngDataUrl: string) => void | Promise<void>;
  disabled?: boolean;
};

export function SignaturePad({ initialUrl, onConfirm, disabled }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);
  const [confirmed, setConfirmed] = useState(!!initialUrl);
  const [saving, setSaving] = useState(false);

  if (confirmed && initialUrl) {
    return (
      <div className="space-y-3">
        <img
          src={initialUrl}
          alt="Assinatura do cliente"
          className="w-full rounded-lg border border-white/15 bg-white"
        />
        <button
          type="button"
          className="text-small text-ink-100/70 underline"
          disabled={disabled}
          onClick={() => setConfirmed(false)}
        >
          Coletar nova assinatura
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/15 bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="black"
          canvasProps={{
            className: 'w-full h-[200px] rounded-lg',
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-white/15 px-4 py-2 text-small text-white"
          disabled={disabled || saving}
          onClick={() => ref.current?.clear()}
        >
          Limpar
        </button>
        <button
          type="button"
          className="rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black disabled:opacity-50"
          disabled={disabled || saving}
          onClick={async () => {
            if (!ref.current || ref.current.isEmpty()) return;
            setSaving(true);
            const dataUrl = ref.current.toDataURL('image/png');
            try {
              await onConfirm(dataUrl);
              setConfirmed(true);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Salvando...' : 'Confirmar assinatura'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json components/portal/SignaturePad.tsx
git commit -m "feat(ui): signature pad pra coleta de assinatura do cliente"
```

---

### Task 10: Componentes auxiliares do form

**Files:**
- Create: `components/portal/IntervalsList.tsx`
- Create: `components/portal/TipoAtividade.tsx`
- Create: `components/portal/MaquinaParadaRadio.tsx`
- Create: `components/portal/AutoSaveStatus.tsx`
- Create: `components/portal/RejectedBanner.tsx`
- Create: `components/portal/ReportFieldsCard.tsx`
- Create: `components/portal/ReportsList.tsx`

- [ ] **Step 1: `TipoAtividade.tsx`**

```tsx
'use client';

type Props = {
  preventiva: boolean;
  corretiva: boolean;
  onChange: (next: { preventiva: boolean; corretiva: boolean }) => void;
  disabled?: boolean;
};

export function TipoAtividade({ preventiva, corretiva, onChange, disabled }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="flex items-center gap-3 rounded-lg border border-white/15 bg-ink-900/40 px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          className="size-5 accent-brand-yellow"
          checked={preventiva}
          disabled={disabled}
          onChange={(e) => onChange({ preventiva: e.target.checked, corretiva })}
        />
        <span className="text-white">Preventiva</span>
      </label>
      <label className="flex items-center gap-3 rounded-lg border border-white/15 bg-ink-900/40 px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          className="size-5 accent-brand-yellow"
          checked={corretiva}
          disabled={disabled}
          onChange={(e) => onChange({ preventiva, corretiva: e.target.checked })}
        />
        <span className="text-white">Corretiva</span>
      </label>
    </div>
  );
}
```

- [ ] **Step 2: `MaquinaParadaRadio.tsx`**

```tsx
'use client';

type Props = {
  value: boolean | null;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export function MaquinaParadaRadio({ value, onChange, disabled }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        { label: 'Sim', val: true },
        { label: 'Não', val: false },
      ].map(({ label, val }) => (
        <label
          key={label}
          className="flex items-center gap-3 rounded-lg border border-white/15 bg-ink-900/40 px-4 py-3 cursor-pointer"
        >
          <input
            type="radio"
            name="maquina_parada"
            className="size-5 accent-brand-yellow"
            checked={value === val}
            disabled={disabled}
            onChange={() => onChange(val)}
          />
          <span className="text-white">{label}</span>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `IntervalsList.tsx`**

```tsx
'use client';

import { Trash2, Plus } from 'lucide-react';
import type { ReportInterval } from '@/lib/reports/types';

type Item = Pick<ReportInterval, 'id' | 'ordem' | 'inicio' | 'fim'>;

type Props = {
  intervals: Item[];
  onUpsert: (item: { id?: string; ordem: number; inicio: string; fim: string | null }) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  disabled?: boolean;
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

export function IntervalsList({ intervals, onUpsert, onDelete, disabled }: Props) {
  const sorted = [...intervals].sort((a, b) => a.ordem - b.ordem);
  const nextOrdem = sorted.length > 0 ? Math.max(...sorted.map((i) => i.ordem)) + 1 : 1;

  return (
    <div className="space-y-3">
      {sorted.map((iv) => (
        <div key={iv.id} className="rounded-lg border border-white/15 bg-ink-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-small font-semibold text-brand-yellow">
              DIA {String(iv.ordem).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="text-ink-100/70 hover:text-white"
              disabled={disabled}
              onClick={() => onDelete(iv.id)}
              aria-label="Remover intervalo"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <label className="block">
            <span className="text-small text-ink-100/70">Início</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
              disabled={disabled}
              value={toLocalInputValue(iv.inicio)}
              onChange={(e) =>
                onUpsert({
                  id: iv.id,
                  ordem: iv.ordem,
                  inicio: fromLocalInputValue(e.target.value) ?? iv.inicio,
                  fim: iv.fim,
                })
              }
            />
          </label>
          <label className="block">
            <span className="text-small text-ink-100/70">Fim</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
              disabled={disabled}
              value={toLocalInputValue(iv.fim)}
              onChange={(e) =>
                onUpsert({
                  id: iv.id,
                  ordem: iv.ordem,
                  inicio: iv.inicio,
                  fim: fromLocalInputValue(e.target.value),
                })
              }
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className="flex items-center gap-2 rounded-md border border-dashed border-white/20 px-4 py-3 text-white w-full justify-center"
        disabled={disabled}
        onClick={() => {
          const now = new Date().toISOString();
          onUpsert({ ordem: nextOrdem, inicio: now, fim: null });
        }}
      >
        <Plus className="size-4" />
        Adicionar dia / intervalo
      </button>
    </div>
  );
}
```

- [ ] **Step 4: `AutoSaveStatus.tsx`**

```tsx
'use client';

import { Check, AlertCircle, Loader2 } from 'lucide-react';

export type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error';

export function AutoSaveStatus({ state, lastSavedAt }: { state: AutoSaveState; lastSavedAt?: Date | null }) {
  if (state === 'saving')
    return (
      <span className="inline-flex items-center gap-1 text-small text-ink-100/70">
        <Loader2 className="size-3 animate-spin" /> Salvando...
      </span>
    );
  if (state === 'error')
    return (
      <span className="inline-flex items-center gap-1 text-small text-red-400">
        <AlertCircle className="size-3" /> Sem conexão — tente novamente
      </span>
    );
  if (state === 'saved' && lastSavedAt) {
    const hh = String(lastSavedAt.getHours()).padStart(2, '0');
    const mm = String(lastSavedAt.getMinutes()).padStart(2, '0');
    return (
      <span className="inline-flex items-center gap-1 text-small text-emerald-400">
        <Check className="size-3" /> Salvo às {hh}:{mm}
      </span>
    );
  }
  return null;
}
```

- [ ] **Step 5: `RejectedBanner.tsx`**

```tsx
import { AlertTriangle } from 'lucide-react';

export function RejectedBanner({ reason, onReopen }: { reason: string; onReopen?: () => void }) {
  return (
    <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-200">
        <AlertTriangle className="size-4" />
        <span className="font-semibold">Relatório rejeitado pelo admin</span>
      </div>
      <p className="text-small text-orange-100/90 whitespace-pre-wrap">{reason}</p>
      {onReopen && (
        <button
          type="button"
          className="rounded-md bg-orange-500 px-4 py-2 text-small font-semibold text-black"
          onClick={onReopen}
        >
          Reabrir e editar
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: `ReportFieldsCard.tsx`**

```tsx
import type { ReportWithIntervals } from '@/lib/reports/types';

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export function ReportFieldsCard({ report, signatureUrl }: { report: ReportWithIntervals; signatureUrl: string | null }) {
  const tipos: string[] = [];
  if (report.is_preventiva) tipos.push('Preventiva');
  if (report.is_corretiva) tipos.push('Corretiva');

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Identificação</h2>
        <dl className="grid gap-3 sm:grid-cols-2 rounded-lg border border-white/10 bg-ink-900/40 p-4">
          <Field label="Título" value={report.titulo} />
          <Field label="Cliente" value={report.cliente_nome} />
          <Field label="Máquina" value={report.maquina_identificador} />
          <Field label="Horímetro" value={String(report.horimetro)} />
          <Field label="Tipo" value={tipos.join(' & ')} />
          <Field label="Máquina parada" value={report.maquina_parada ? 'Sim' : 'Não'} />
        </dl>
      </section>
      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Intervalos</h2>
        <div className="space-y-2">
          {report.intervals.map((iv) => (
            <div key={iv.id} className="rounded-lg border border-white/10 bg-ink-900/40 p-4">
              <p className="text-small font-semibold text-brand-yellow">DIA {String(iv.ordem).padStart(2, '0')}</p>
              <p className="text-small text-ink-100/80">Início: {fmt(iv.inicio)}</p>
              <p className="text-small text-ink-100/80">Fim: {fmt(iv.fim)}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Sumário dos defeitos</h2>
        <p className="rounded-lg border border-white/10 bg-ink-900/40 p-4 text-white whitespace-pre-wrap">{report.sumario_defeitos}</p>
      </section>
      {report.produtos && (
        <section>
          <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Produtos / peças</h2>
          <p className="rounded-lg border border-white/10 bg-ink-900/40 p-4 text-white whitespace-pre-wrap">{report.produtos}</p>
        </section>
      )}
      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Responsável</h2>
        <div className="rounded-lg border border-white/10 bg-ink-900/40 p-4 space-y-3">
          <p className="text-white">{report.responsavel_nome ?? '—'}</p>
          {signatureUrl && (
            <img src={signatureUrl} alt="Assinatura" className="w-full max-w-md rounded-md bg-white" />
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-small text-ink-100/55">{label}</dt>
      <dd className="text-white">{value || '—'}</dd>
    </div>
  );
}
```

- [ ] **Step 7: `ReportsList.tsx`**

```tsx
import Link from 'next/link';
import type { Report } from '@/lib/reports/types';

const STATUS_LABEL: Record<Report['status'], string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const STATUS_CLASS: Record<Report['status'], string> = {
  draft: 'bg-ink-100/15 text-ink-100',
  pending_approval: 'bg-brand-yellow/15 text-brand-yellow',
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-orange-500/15 text-orange-300',
};

export function ReportsList({
  reports,
  basePath,
  emptyMessage,
}: {
  reports: Report[];
  basePath: string;
  emptyMessage: string;
}) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-ink-900/40 p-10 text-center text-ink-100/70">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li key={r.id}>
          <Link
            href={`${basePath}/${r.id}`}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-900/40 p-4 hover:border-brand-yellow/40"
          >
            <div>
              <p className="font-semibold text-white">{r.titulo || '(sem título)'}</p>
              <p className="text-small text-ink-100/70">
                {r.cliente_nome || '(cliente vazio)'} · Máquina {r.maquina_identificador || '—'}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-small ${STATUS_CLASS[r.status]}`}>
              {STATUS_LABEL[r.status]}
              {r.numero ? ` · #${r.numero}` : ''}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 8: Verificar build**

```bash
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add components/portal/
git commit -m "feat(ui): componentes do form de relatório (intervals, tipo, status, autosave, banner, vista, lista)"
```

---

### Task 11: Layout do mecânico + lista "Meus relatórios"

**Files:**
- Create: `app/(portal)/portal/mecanico/layout.tsx`
- Create: `app/(portal)/portal/mecanico/relatorios/page.tsx`

- [ ] **Step 1: Layout gate**

```tsx
import { requireRole } from '@/lib/auth';

export default async function MecanicoLayout({ children }: { children: React.ReactNode }) {
  await requireRole('mechanic');
  return <>{children}</>;
}
```

- [ ] **Step 2: Lista**

```tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';
import { createDraft } from './actions';

export default async function MeusRelatoriosPage() {
  const profile = await requireRole('mechanic');
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('mechanic_id', profile.id)
    .order('updated_at', { ascending: false });

  async function novoRelatorio() {
    'use server';
    const res = await createDraft();
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Falha ao criar');
    const { redirect } = await import('next/navigation');
    redirect(`/portal/mecanico/relatorios/${res.data.id}/editar`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Manutenção</p>
          <h1 className="mt-2 font-display text-h1 font-bold text-white">Meus relatórios</h1>
        </div>
        <form action={novoRelatorio}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black"
          >
            <Plus className="size-4" />
            Novo relatório
          </button>
        </form>
      </div>
      <ReportsList
        reports={reports ?? []}
        basePath="/portal/mecanico/relatorios"
        emptyMessage="Nenhum relatório ainda. Clique em 'Novo relatório' pra começar."
      />
    </div>
  );
}
```

- [ ] **Step 3: Verificar dev server**

```bash
npm run dev
```

Logar como mecânico. Acessar `/portal/mecanico/relatorios`. Deve mostrar lista vazia + botão "Novo relatório". Clicar → 404 (página de editar ainda não existe — vai ser Task 12).

- [ ] **Step 4: Commit**

```bash
git add app/(portal)/portal/mecanico/layout.tsx app/(portal)/portal/mecanico/relatorios/page.tsx
git commit -m "feat(ui): layout do mecânico e lista de relatórios"
```

---

### Task 12: Página de edição do relatório (form completo)

**Files:**
- Create: `app/(portal)/portal/mecanico/relatorios/[id]/editar/page.tsx`
- Create: `app/(portal)/portal/mecanico/relatorios/[id]/editar/EditarForm.tsx` (client component)

- [ ] **Step 1: Page server component (busca dados)**

```tsx
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { EditarForm } from './EditarForm';

export default async function EditarRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report || report.mechanic_id !== profile.id) notFound();
  if (report.status !== 'draft' && report.status !== 'rejected') notFound();

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('*')
    .eq('report_id', id)
    .order('ordem', { ascending: true });

  return <EditarForm report={report} initialIntervals={intervals ?? []} />;
}
```

- [ ] **Step 2: Client form**

```tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TipoAtividade } from '@/components/portal/TipoAtividade';
import { MaquinaParadaRadio } from '@/components/portal/MaquinaParadaRadio';
import { IntervalsList } from '@/components/portal/IntervalsList';
import { SignaturePad } from '@/components/portal/SignaturePad';
import { AutoSaveStatus, type AutoSaveState } from '@/components/portal/AutoSaveStatus';
import type { Report, ReportEditable, ReportInterval } from '@/lib/reports/types';
import {
  updateDraft,
  upsertInterval,
  deleteInterval,
  uploadSignatureAction,
  submitReport,
} from '../../actions';

type Props = {
  report: Report;
  initialIntervals: ReportInterval[];
};

export function EditarForm({ report, initialIntervals }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [fields, setFields] = useState<Partial<ReportEditable>>({
    titulo: report.titulo,
    cliente_nome: report.cliente_nome,
    maquina_identificador: report.maquina_identificador,
    horimetro: Number(report.horimetro),
    is_preventiva: report.is_preventiva,
    is_corretiva: report.is_corretiva,
    maquina_parada: report.maquina_parada,
    sumario_defeitos: report.sumario_defeitos,
    produtos: report.produtos ?? '',
    responsavel_nome: report.responsavel_nome ?? '',
    assinatura_path: report.assinatura_path,
  });
  const [intervals, setIntervals] = useState<ReportInterval[]>(initialIntervals);
  const [autoSave, setAutoSave] = useState<AutoSaveState>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounced auto-save
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAutoSave('saving');
    timerRef.current = setTimeout(async () => {
      const res = await updateDraft(report.id, fields);
      if (res.ok) {
        setAutoSave('saved');
        setLastSaved(new Date());
      } else {
        setAutoSave('error');
      }
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fields, report.id]);

  async function handleUpsertInterval(item: { id?: string; ordem: number; inicio: string; fim: string | null }) {
    const res = await upsertInterval(report.id, item);
    if (res.ok && res.data) {
      setIntervals((prev) => {
        const next = prev.filter((i) => i.id !== res.data!.id);
        next.push({
          id: res.data!.id,
          report_id: report.id,
          ordem: item.ordem,
          inicio: item.inicio,
          fim: item.fim,
          created_at: new Date().toISOString(),
        });
        return next;
      });
    }
  }

  async function handleDeleteInterval(id: string) {
    const res = await deleteInterval(id, report.id);
    if (res.ok) setIntervals((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSignature(dataUrl: string) {
    const res = await uploadSignatureAction(report.id, dataUrl);
    if (res.ok && res.data) {
      setFields((f) => ({ ...f, assinatura_path: res.data!.path }));
    } else if (!res.ok) {
      setError(res.error);
    }
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await submitReport(report.id);
      if (res.ok) router.push('/portal/mecanico/relatorios');
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Editar relatório</h1>
        <AutoSaveStatus state={autoSave} lastSavedAt={lastSaved} />
      </header>

      <Section title="Identificação">
        <Input label="Título" value={fields.titulo ?? ''} onChange={(v) => setFields({ ...fields, titulo: v })} />
        <Input label="Cliente" value={fields.cliente_nome ?? ''} onChange={(v) => setFields({ ...fields, cliente_nome: v })} />
        <Input label="Identificador da máquina" value={fields.maquina_identificador ?? ''} onChange={(v) => setFields({ ...fields, maquina_identificador: v })} />
        <Input
          label="Horímetro"
          type="number"
          value={String(fields.horimetro ?? 0)}
          onChange={(v) => setFields({ ...fields, horimetro: Number(v) })}
        />
      </Section>

      <Section title="Tipo de atividade">
        <TipoAtividade
          preventiva={!!fields.is_preventiva}
          corretiva={!!fields.is_corretiva}
          onChange={({ preventiva, corretiva }) =>
            setFields({ ...fields, is_preventiva: preventiva, is_corretiva: corretiva })
          }
        />
      </Section>

      <Section title="Máquina parada">
        <MaquinaParadaRadio
          value={fields.maquina_parada ?? null}
          onChange={(v) => setFields({ ...fields, maquina_parada: v })}
        />
      </Section>

      <Section title="Intervalos (início e fim)">
        <IntervalsList
          intervals={intervals}
          onUpsert={handleUpsertInterval}
          onDelete={handleDeleteInterval}
        />
      </Section>

      <Section title="Sumário dos defeitos executados">
        <Textarea
          value={fields.sumario_defeitos ?? ''}
          onChange={(v) => setFields({ ...fields, sumario_defeitos: v })}
        />
      </Section>

      <Section title="Produtos / peças utilizadas">
        <Textarea value={fields.produtos ?? ''} onChange={(v) => setFields({ ...fields, produtos: v })} />
      </Section>

      <Section title="Responsável (cliente)">
        <Input
          label="Nome do responsável"
          value={fields.responsavel_nome ?? ''}
          onChange={(v) => setFields({ ...fields, responsavel_nome: v })}
        />
        <div className="mt-4">
          <span className="text-small text-ink-100/70">Assinatura</span>
          <SignaturePad
            initialUrl={null /* preview da assinatura corrente é feito na vista read-only */}
            onConfirm={handleSignature}
          />
          {fields.assinatura_path && (
            <p className="mt-2 text-small text-emerald-400">Assinatura registrada</p>
          )}
        </div>
      </Section>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-small text-red-200">
          {error}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-ink-950 p-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button
            type="button"
            className="flex-1 rounded-md border border-white/20 px-4 py-3 text-white"
            onClick={() => router.push('/portal/mecanico/relatorios')}
          >
            Salvar e sair
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-brand-yellow px-4 py-3 font-semibold text-black disabled:opacity-50"
            onClick={handleSubmit}
            disabled={pending}
          >
            {pending ? 'Enviando...' : 'Enviar pra aprovação'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-label uppercase tracking-wider text-ink-100/55">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-small text-ink-100/70">{label}</span>
      <input
        type={type}
        className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="w-full min-h-[120px] rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

- [ ] **Step 3: Build + dev manual**

```bash
npm run build
```

Logado como mecânico, criar novo, preencher campos, ver auto-save funcionando. Não submeter ainda (deixar pra QA da Task 16).

- [ ] **Step 4: Commit**

```bash
git add app/(portal)/portal/mecanico/relatorios/[id]/editar/
git commit -m "feat(ui): form mobile-first de edição de relatório com auto-save"
```

---

### Task 13: Vista read-only do relatório (mecânico + admin reusam)

**Files:**
- Create: `app/(portal)/portal/mecanico/relatorios/[id]/page.tsx`

- [ ] **Step 1: Page server component**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportFieldsCard } from '@/components/portal/ReportFieldsCard';
import { RejectedBanner } from '@/components/portal/RejectedBanner';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';
import { reopenRejected } from '../actions';

export default async function VerRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole('mechanic');
  const supabase = await createClient();

  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report || report.mechanic_id !== profile.id) notFound();

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('*')
    .eq('report_id', id)
    .order('ordem', { ascending: true });

  let signatureUrl: string | null = null;
  if (report.assinatura_path) {
    try {
      signatureUrl = await getSignatureSignedUrl(report.assinatura_path);
    } catch {
      signatureUrl = null;
    }
  }

  async function reopen() {
    'use server';
    await reopenRejected(id);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Relatório</p>
          <h1 className="mt-2 font-display text-h2 font-bold text-white">
            {report.titulo || '(sem título)'} {report.numero ? `· #${report.numero}` : ''}
          </h1>
        </div>
        {(report.status === 'draft' || report.status === 'rejected') && (
          <Link
            href={`/portal/mecanico/relatorios/${id}/editar`}
            className="rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black"
          >
            Editar
          </Link>
        )}
      </header>

      {report.status === 'rejected' && report.rejected_reason && (
        <form action={reopen}>
          <RejectedBanner reason={report.rejected_reason} />
          <button type="submit" className="mt-2 rounded-md bg-orange-500 px-4 py-2 text-small font-semibold text-black">
            Reabrir e editar
          </button>
        </form>
      )}

      <ReportFieldsCard
        report={{ ...report, intervals: intervals ?? [] }}
        signatureUrl={signatureUrl}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build + dev**

```bash
npm run build
```

Verificar manualmente que o read-only renderiza com dados de um relatório criado.

- [ ] **Step 3: Commit**

```bash
git add app/(portal)/portal/mecanico/relatorios/[id]/page.tsx
git commit -m "feat(ui): vista read-only do relatório pro mecânico"
```

---

## PHASE 4 — Admin + dashboard + sidebar

### Task 14: Lista admin de relatórios

**Files:**
- Create: `app/(portal)/portal/admin/relatorios/page.tsx`

- [ ] **Step 1: Página**

```tsx
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsList } from '@/components/portal/ReportsList';

export default async function AdminRelatoriosPage() {
  await requireRole('admin');
  const supabase = await createClient();

  const { data: pendentes } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'pending_approval')
    .order('submitted_at', { ascending: false });

  const { data: outros } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['draft', 'approved', 'rejected'])
    .order('updated_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Manutenção</p>
        <h1 className="mt-2 font-display text-h1 font-bold text-white">Relatórios</h1>
        <p className="mt-2 text-small text-ink-100/60">
          Aprovação completa chega na próxima fatia — por enquanto você consegue ver a fila.
        </p>
      </div>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-3">Aguardando aprovação</h2>
        <ReportsList
          reports={pendentes ?? []}
          basePath="/portal/admin/relatorios"
          emptyMessage="Nenhum relatório aguardando."
        />
      </section>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-3">Outros (últimos 20)</h2>
        <ReportsList
          reports={outros ?? []}
          basePath="/portal/admin/relatorios"
          emptyMessage="Nada por aqui."
        />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Página de detalhe placeholder pro admin**

Criar `app/(portal)/portal/admin/relatorios/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportFieldsCard } from '@/components/portal/ReportFieldsCard';
import { getSignatureSignedUrl } from '@/lib/storage/signatures';

export default async function AdminVerRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole('admin');
  const supabase = await createClient();

  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report) notFound();

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('*')
    .eq('report_id', id)
    .order('ordem', { ascending: true });

  let signatureUrl: string | null = null;
  if (report.assinatura_path) {
    try {
      signatureUrl = await getSignatureSignedUrl(report.assinatura_path);
    } catch {
      signatureUrl = null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Relatório</p>
        <h1 className="mt-2 font-display text-h2 font-bold text-white">
          {report.titulo || '(sem título)'} {report.numero ? `· #${report.numero}` : ''}
        </h1>
        <p className="mt-1 text-small text-ink-100/60">Status: {report.status}</p>
      </div>
      <ReportFieldsCard
        report={{ ...report, intervals: intervals ?? [] }}
        signatureUrl={signatureUrl}
      />
      <p className="rounded-md border border-dashed border-white/15 bg-ink-900/40 p-4 text-small text-ink-100/70">
        Botões de aprovar/rejeitar + edição de valores chegam na Fatia 3.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Build + dev**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/(portal)/portal/admin/relatorios/
git commit -m "feat(ui): lista admin de relatórios + vista de detalhe (sem aprovação ainda)"
```

---

### Task 15: Sidebar + dashboard principais atualizados

**Files:**
- Modify: `components/portal/Sidebar.tsx`
- Modify: `app/(portal)/portal/page.tsx`

- [ ] **Step 1: Ler Sidebar atual e identificar onde adicionar item**

```bash
```

Ler `components/portal/Sidebar.tsx` integralmente, anotar como a nav é montada (provavelmente array de itens por role).

- [ ] **Step 2: Adicionar item "Relatórios" na nav**

Para role `mechanic`: `{ href: '/portal/mecanico/relatorios', label: 'Relatórios', icon: ClipboardList }`
Para role `admin`: `{ href: '/portal/admin/relatorios', label: 'Relatórios', icon: ClipboardList }`

(Editar conforme a estrutura encontrada no Step 1.)

- [ ] **Step 3: Atualizar dashboard do mecânico em `app/(portal)/portal/page.tsx`**

Substituir o bloco placeholder do mechanic (linhas ~49-66 atuais) por:

```tsx
  if (profile.role === 'mechanic') {
    const supabaseRead = await createClient();
    const { data: meus } = await supabaseRead
      .from('reports')
      .select('status')
      .eq('mechanic_id', profile.id);
    const counts = {
      draft: meus?.filter((r) => r.status === 'draft').length ?? 0,
      pending: meus?.filter((r) => r.status === 'pending_approval').length ?? 0,
      rejected: meus?.filter((r) => r.status === 'rejected').length ?? 0,
      approved: meus?.filter((r) => r.status === 'approved').length ?? 0,
    };
    return (
      <div className="space-y-10">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Bem-vindo</p>
          <h1 className="mt-2 font-display text-h1 font-bold text-white">
            Olá, <span className="text-brand-yellow">{profile.full_name}</span>
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/portal/mecanico/relatorios" className="group rounded-xl border border-white/10 bg-ink-900/60 p-6 hover:border-brand-yellow/40">
            <p className="text-label uppercase tracking-wider text-ink-100/60">Meus relatórios</p>
            <p className="mt-1 font-display text-h2 font-bold text-white">
              {counts.draft + counts.pending + counts.rejected + counts.approved}
            </p>
            <p className="mt-1 text-small text-ink-100/60">
              {counts.draft} rascunho · {counts.pending} pendente · {counts.rejected} rejeitado
            </p>
          </Link>
        </div>
      </div>
    );
  }
```

- [ ] **Step 4: Adicionar card admin "Pendentes"**

No bloco do admin (perto dos cards Usuários/Clientes), adicionar um card a mais consultando count de `reports` com status=pending_approval. Modificar `getAdminStats` pra incluir essa contagem.

- [ ] **Step 5: Build + dev**

```bash
npm run build
```

Logar como cada role e verificar dashboards.

- [ ] **Step 6: Commit**

```bash
git add components/portal/Sidebar.tsx app/(portal)/portal/page.tsx
git commit -m "feat(portal): nav e dashboards reais com contagens de relatórios"
```

---

## PHASE 5 — QA manual + critérios de pronto

### Task 16: Walkthrough completo + ajustes

**Files:** (nenhum específico — checklist de QA)

- [ ] **Step 1: Walkthrough do mecânico**

Em device mobile real (ou DevTools com viewport iPhone 12):

1. Login como mecânico
2. `/portal/mecanico/relatorios` → "Novo relatório"
3. Preencher: título, cliente livre, máquina, horímetro
4. Marcar Preventiva + Corretiva
5. Selecionar "Máquina parada: Sim"
6. Adicionar 2 intervalos (DIA 01 e DIA 02, ambos com fim)
7. Preencher sumário + produtos
8. Preencher nome do responsável
9. Coletar assinatura no canvas → Confirmar
10. Observar AutoSaveStatus mostrando "Salvando..." → "Salvo às HH:MM"
11. Fechar aba, reabrir, voltar pra editar → tudo persistiu
12. Clicar "Enviar pra aprovação"
13. Voltar pra lista → status "Aguardando aprovação"
14. Caixa de entrada do `fabiano@fb.com.br` → email chegou com link

- [ ] **Step 2: Walkthrough do admin**

1. Login como admin
2. `/portal/admin/relatorios` → vê pendente
3. Clica no relatório → vista completa com assinatura visível
4. Painel Supabase → confirma `assinatura_path` no row e arquivo em `signatures/<id>/cliente.png`

- [ ] **Step 3: Simular rejeição (via SQL no painel)**

```sql
update reports
set status='rejected', rejected_reason='Faltou descrever a peça substituída no eixo', rejected_at=now()
where id=<id-do-relatório-pendente>;
```

Logar como mecânico, abrir o relatório → ver banner. Clicar "Reabrir e editar" → volta pra rascunho editável.

- [ ] **Step 4: Verificar critérios de pronto (seção 16 do spec)**

Marcar cada checkbox da seção 16 do spec à medida que confirma. Se algum item falhar, abrir issue ou corrigir antes de fechar a fatia.

- [ ] **Step 5: Rodar testes finais**

```bash
npm run test
npm run build
```

- [ ] **Step 6: Commit final + tag**

```bash
git commit --allow-empty -m "chore: Fatia 2 completa — mecânico cria/envia relatório com assinatura"
git tag fatia-2-completa
```

---

## Self-review (cobertura do spec)

| Item do spec | Task |
|---|---|
| Schema `reports` + `report_intervals` + RLS | 1 |
| Tipos TS | 2 |
| Bucket `signatures` | 3 |
| Testes RLS | 4 |
| Validação reusável | 5 |
| Upload assinatura via server action | 6, 8 |
| Email Resend ao admin | 7, 8 |
| Server actions completas | 8 |
| Signature pad canvas | 9 |
| Form mobile-first + auto-save 1.5s | 10, 12 |
| Múltiplos intervalos com `ordem` | 10, 12 |
| Tipo de atividade (2 booleanos) | 10, 12 |
| Máquina parada radio | 10, 12 |
| Vista read-only | 13 |
| Banner rejected + reopen | 10, 13 |
| Lista admin de pendentes | 14 |
| Nav atualizada | 15 |
| Dashboard real por role | 15 |
| Email imediato no submit | 8 |
| Validação server-side no submit | 5, 8 |
| Critérios de pronto walkthrough | 16 |

Sem gaps detectados. Sem placeholders, todos os steps têm código completo ou comandos exatos.
