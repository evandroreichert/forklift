# Portal — Fatia 1 (Fundação) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o portal mock atual por uma fundação real com Supabase Auth + Postgres (RLS paranoica), CRUD admin de usuários/clientes/máquinas, e infra base de email com Resend pra uso na Fatia 2.

**Architecture:** Next.js 15 App Router com Server Components + Server Actions; Supabase Postgres com RLS habilitada em toda tabela e policies por role; helper functions em schema `private` (não expostas via PostgREST); service-role key isolada em server-only `lib/supabase/admin.ts` pra operações privilegiadas (criar user, resetar senha).

**Tech Stack:** Next.js 15.5 + React 19 + TypeScript estrito + Tailwind v4 + shadcn/ui + Supabase JS v2 (@supabase/ssr) + Resend SDK + Vitest + Supabase CLI (Docker local).

**Spec:** `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-design.md` (commit 63577c6)

---

## Pré-requisitos do ambiente local (one-time setup)

Antes de iniciar a Task 1, o engineer precisa ter:
- **Docker Desktop** rodando (Supabase CLI usa pra projeto local)
- **Conta no Supabase** com 1 projeto criado pra produção (anote `Project URL`, `anon key`, `service_role key` — vão na seção 10 da spec)
- **Conta no Resend** com 1 API key (anote)

Sem isso, várias tasks não rodam. Se faltar algo, pare e peça pro usuário fornecer.

---

## PHASE 1 — Infra Supabase + Auth real

### Task 1: Instalar dependências e configurar Supabase CLI

**Files:**
- Modify: `package.json`
- Create: `supabase/config.toml` (gerado pelo CLI)
- Modify: `.gitignore`

- [ ] **Step 1: Instalar dependências runtime**

```bash
npm install @supabase/supabase-js @supabase/ssr resend
```

- [ ] **Step 2: Instalar dev dependencies (supabase CLI + vitest)**

```bash
npm install -D supabase vitest @vitest/coverage-v8 tsx dotenv-cli
```

- [ ] **Step 3: Inicializar projeto Supabase local**

```bash
npx supabase init
```

Aceite os defaults. Vai criar `supabase/config.toml` + `supabase/.gitignore`.

- [ ] **Step 4: Atualizar .gitignore raiz**

Abra `.gitignore` e adicione no final:

```
# Supabase local
supabase/.branches
supabase/.temp

# Env
.env.local
.env*.local
```

- [ ] **Step 5: Criar `.env.example` na raiz**

Crie arquivo `.env.example`:

```
# Supabase — preencher com valores do projeto remoto (Settings > API)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend — preencher com API key (resend.com/api-keys)
RESEND_API_KEY=
RESEND_FROM_EMAIL=relatorios@fabianobratti.com
```

- [ ] **Step 6: Criar `.env.local` (NÃO commitar)**

Copie `.env.example` para `.env.local` e **deixe vazio por enquanto** — preencheremos os valores LOCAIS do Supabase na Task 2.

- [ ] **Step 7: Verificar build ainda passa**

Run: `npm run build`
Expected: build verde (nenhum código novo usando as libs ainda).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json supabase/config.toml supabase/.gitignore .gitignore .env.example
git commit -m "chore: instala supabase + resend + vitest + supabase CLI"
```

---

### Task 2: Subir Supabase local e capturar credenciais

**Files:**
- Modify: `.env.local` (não commitar)

- [ ] **Step 1: Subir Supabase local**

```bash
npx supabase start
```

A primeira execução baixa imagens Docker (5-10 min). Ao final imprime:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

- [ ] **Step 2: Preencher .env.local com credenciais LOCAIS**

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key impressa>
SUPABASE_SERVICE_ROLE_KEY=<service_role key impressa>

RESEND_API_KEY=<sua API key do Resend>
RESEND_FROM_EMAIL=onboarding@resend.dev
```

> `onboarding@resend.dev` é o domínio default do Resend pra testes — funciona sem configurar DNS. Trocaremos pelo domínio real (`relatorios@fabianobratti.com`) na deploy notes.

- [ ] **Step 3: Verificar acesso ao Studio**

Abra http://127.0.0.1:54323 no navegador. Deve aparecer o Supabase Studio.

- [ ] **Step 4: (Sem commit nesta task — `.env.local` é gitignored)**

---

### Task 3: Migration inicial (schema + RLS + policies)

**Files:**
- Create: `supabase/migrations/20260529120000_initial_schema.sql`

- [ ] **Step 1: Criar arquivo de migration vazio**

```bash
mkdir -p supabase/migrations
touch supabase/migrations/20260529120000_initial_schema.sql
```

- [ ] **Step 2: Colar conteúdo SQL completo da spec**

Abra `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-design.md`, copie o bloco SQL da **seção 5.2** (linhas após `### 5.2 SQL completo da migration` até o fechamento ```) e cole em `supabase/migrations/20260529120000_initial_schema.sql`.

O bloco começa com `-- =====` e termina depois das policies de `machines`.

- [ ] **Step 3: Aplicar migration localmente**

```bash
npx supabase db reset
```

Esse comando dropa o DB local, recria do zero e aplica todas as migrations + seed. Espera ver no final: `Finished supabase db reset on branch <branch>.`

- [ ] **Step 4: Verificar tabelas criadas no Studio**

Studio (http://127.0.0.1:54323) → Table Editor. Deve ver: `client_companies`, `profiles`, `machines`. Todas com cadeado (RLS habilitada).

- [ ] **Step 5: Verificar policies no Studio**

Studio → Authentication > Policies. Deve listar 4 policies em `profiles`, 4 em `client_companies`, 4 em `machines`.

- [ ] **Step 6: Verificar funções helper**

Studio → SQL Editor, rode:

```sql
select n.nspname, p.proname
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'private'
order by 1, 2;
```

Esperado: 3 rows — `private.set_updated_at`, `private.user_client_company_id`, `private.user_role`.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260529120000_initial_schema.sql
git commit -m "feat(db): schema inicial com RLS paranoica (companies, profiles, machines)"
```

---

### Task 4: Gerar tipos TypeScript do banco

**Files:**
- Create: `lib/database.types.ts`
- Modify: `package.json` (add npm script)

- [ ] **Step 1: Adicionar npm script pra gerar tipos**

Em `package.json`, dentro de `scripts`, adicionar:

```json
"db:types": "supabase gen types typescript --local > lib/database.types.ts"
```

Verifique que ficou (mantenha os scripts existentes):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:types": "supabase gen types typescript --local > lib/database.types.ts"
}
```

- [ ] **Step 2: Gerar tipos**

```bash
npm run db:types
```

- [ ] **Step 3: Verificar arquivo gerado**

`lib/database.types.ts` deve existir, ter ~150-250 linhas, e exportar tipos `Database`, `Tables`, etc.

- [ ] **Step 4: Commit**

```bash
git add package.json lib/database.types.ts
git commit -m "feat(db): script db:types + types gerados do schema"
```

---

### Task 5: Clientes Supabase tipados

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/supabase/admin.ts`

- [ ] **Step 1: Criar `lib/supabase/client.ts`** (browser client, usa anon key)

```ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Criar `lib/supabase/server.ts`** (RSC + server actions, lê/escreve cookies)

```ts
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — cookies só podem ser setados em middleware/server action
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Criar `lib/supabase/middleware.ts`** (helper pra middleware raiz)

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: revalida session em toda request (refresh automático)
  const { data: { user } } = await supabase.auth.getUser();

  return { response, user };
}
```

- [ ] **Step 4: Criar `lib/supabase/admin.ts`** (service-role, server-only)

```ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/
git commit -m "feat(supabase): clientes tipados (browser, server, middleware, admin)"
```

---

### Task 6: Helpers de auth (lib/auth.ts) e tipos de domínio

**Files:**
- Create: `lib/auth.ts`
- Modify: `lib/types.ts` (adicionar tipos de domínio)

- [ ] **Step 1: Atualizar `lib/types.ts`** — adicionar tipos de domínio do portal no final do arquivo

Mantenha tudo que já existe e adicione no final:

```ts
// Portal — domain types
import type { Database } from '@/lib/database.types';

export type UserRole = Database['public']['Enums']['user_role'];
export type FuelType = Database['public']['Enums']['fuel_type'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ClientCompany = Database['public']['Tables']['client_companies']['Row'];
export type Machine = Database['public']['Tables']['machines']['Row'];
```

- [ ] **Step 2: Criar `lib/auth.ts`**

```ts
import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/lib/types';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.active) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login?error=inactive');
  }
  return profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) redirect('/portal');
  return profile;
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts lib/types.ts
git commit -m "feat(auth): helpers getCurrentProfile / requireProfile / requireRole"
```

---

### Task 7: Middleware raiz (proteção de rotas)

**Files:**
- Create: `middleware.ts` (raiz do projeto)

- [ ] **Step 1: Criar `middleware.ts` na raiz**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // /portal/* exige session
  if (pathname.startsWith('/portal') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // /login com session válida redireciona pra /portal
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/login',
  ],
};
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Smoke test manual**

```bash
npm run dev
```

Abra http://localhost:3000/portal sem estar logado → deve redirecionar pra `/login`. (Não vai funcionar ainda porque AuthGate antigo + form mock estão no caminho — vamos resolver nas próximas tasks.)

Mate o dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): middleware raiz protege /portal e redireciona /login se logado"
```

---

### Task 8: Refatorar /login com auth real (server action)

**Files:**
- Create: `app/(portal)/login/actions.ts`
- Modify: `app/(portal)/login/page.tsx`

- [ ] **Step 1: Criar server action `app/(portal)/login/actions.ts`**

```ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Preencha email e senha.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Email ou senha inválidos.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', data.user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    return { error: 'Conta desativada. Contate o admin.' };
  }

  redirect('/portal');
}
```

- [ ] **Step 2: Refatorar `app/(portal)/login/page.tsx`** — substituir conteúdo todo

```tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/public/Logo';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { loginAction, type LoginState } from './actions';

const INITIAL: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const searchParams = useSearchParams();
  const inactiveError = searchParams.get('error') === 'inactive'
    ? 'Sua conta foi desativada. Contate o admin.'
    : null;
  const displayError = state.error ?? inactiveError;

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-6 py-12 text-white">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,227,75,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      <div className="absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-brand-yellow/10 blur-3xl" aria-hidden />
      <div className="absolute -right-32 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-brand-yellow/5 blur-3xl" aria-hidden />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-small text-ink-100/70 transition-colors hover:text-brand-yellow">
          <ArrowLeft className="size-4" />
          Voltar ao site
        </Link>

        <Logo className="brightness-0 invert" />

        <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-ink-900/60 backdrop-blur-sm">
          <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent px-8 py-6">
            <p className="inline-flex items-center gap-2 text-label uppercase tracking-[0.18em] text-brand-yellow">
              <ShieldCheck className="size-3.5" />
              Acesso restrito
            </p>
            <h1 className="mt-3 font-display text-h2 font-bold text-white">Portal FB Empilhadeiras</h1>
            <p className="mt-2 text-small text-ink-100/65">
              Acesso para mecânicos, clientes e administradores.
            </p>
          </div>

          <form action={formAction} className="space-y-5 px-8 py-7">
            <div>
              <Label htmlFor="email" className="text-ink-100">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 border-white/15 bg-ink-950/50 text-white placeholder:text-ink-300"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-ink-100">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-2 border-white/15 bg-ink-950/50 text-white placeholder:text-ink-300"
                placeholder="••••••••"
              />
            </div>

            {displayError && (
              <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">
                {displayError}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 transition-colors hover:bg-white disabled:opacity-50"
            >
              {pending ? 'Entrando…' : 'Entrar no portal'}
            </button>

            <p className="text-center text-[12px] text-ink-100/55">
              Esqueceu a senha? Contate o administrador para resetar.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/\(portal\)/login/
git commit -m "feat(auth): login real com Supabase (substitui mock)"
```

---

### Task 9: Substituir AuthGate (mock client-side) por proteção server-side

**Files:**
- Modify: `app/(portal)/portal/layout.tsx`
- Delete: `components/portal/AuthGate.tsx`
- Delete: `lib/auth-mock.ts`
- Modify: `components/portal/Sidebar.tsx` (remover import de auth-mock)

- [ ] **Step 1: Refatorar `app/(portal)/portal/layout.tsx`** — substituir AuthGate por server-side check

```tsx
import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth';
import { Sidebar } from '@/components/portal/Sidebar';
import { Topbar } from '@/components/portal/Topbar';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Portal',
  description: 'Área restrita Fabiano Bratti Empilhadeiras.',
  path: '/portal',
  noIndex: true,
});

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-100">
      <Sidebar profile={profile} />
      <div className="flex flex-1 flex-col">
        <Topbar profile={profile} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
```

> `Sidebar` e `Topbar` ainda não aceitam `profile` como prop — vamos ajustar na Task 21. Por ora o TypeScript vai reclamar; deixe quebrar e seguimos pra refactor neste mesmo passo a seguir.

- [ ] **Step 2: Refatorar `components/portal/Sidebar.tsx`** — aceitar profile, logout via server action

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/public/Logo';
import { Wrench, LogOut, Users, Building2, Settings, LayoutDashboard } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { logoutAction } from '@/app/(portal)/portal/actions';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_BY_ROLE: Record<Profile['role'], NavItem[]> = {
  admin: [
    { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/portal/admin/clientes', label: 'Clientes', icon: Building2 },
    { href: '/portal/admin/maquinas', label: 'Máquinas', icon: Settings },
  ],
  mechanic: [
    { href: '/portal', label: 'Manutenções', icon: Wrench },
  ],
  client: [
    { href: '/portal', label: 'Relatórios', icon: Wrench },
  ],
};

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const nav = NAV_BY_ROLE[profile.role];

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-ink-900 md:flex">
      <div className="border-b border-white/10 px-6 py-5">
        <Logo className="brightness-0 invert" />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 rounded px-3 py-2 text-small transition-colors',
                active
                  ? 'bg-brand-yellow/10 text-brand-yellow'
                  : 'text-ink-100/70 hover:bg-white/[0.04] hover:text-white',
              ].join(' ')}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t border-white/10 p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded px-3 py-2 text-small text-ink-100/70 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </form>
    </aside>
  );
}
```

- [ ] **Step 3: Refatorar `components/portal/Topbar.tsx`** — usar profile real

```tsx
import { Bell } from 'lucide-react';
import type { Profile } from '@/lib/types';

const ROLE_LABEL: Record<Profile['role'], string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  client: 'Cliente',
};

export function Topbar({ profile }: { profile: Profile }) {
  const iniciais = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-ink-900 px-6">
      <span className="inline-flex items-center gap-2 text-label uppercase tracking-wider text-ink-100/60">
        <span className="size-1.5 rounded-full bg-brand-yellow" aria-hidden />
        {ROLE_LABEL[profile.role]}
      </span>
      <div className="flex items-center gap-4">
        <span className="hidden text-small text-ink-100/70 md:inline">{profile.full_name}</span>
        <button
          className="relative text-ink-100/70 transition-colors hover:text-brand-yellow"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
        </button>
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-yellow text-small font-bold text-ink-950">
          {iniciais}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Criar `app/(portal)/portal/actions.ts`** com logout

```ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

- [ ] **Step 5: Deletar mocks que não serão mais usados**

```bash
git rm components/portal/AuthGate.tsx lib/auth-mock.ts
```

- [ ] **Step 6: Type-check + build**

```bash
npx tsc --noEmit && npm run build
```

> Se reclamar de imports faltando em `app/(portal)/portal/page.tsx` (que ainda usa mocks `CLIENTE_DEMO`, etc.), **deixe quebrado** — vamos consertar na Task 10. Apenas faça type-check passar sobre os arquivos modificados acima. Se build quebra, tudo bem nessa task.

> Se quiser ver build verde aqui, comente temporariamente as importações no `page.tsx` antigo — mas é mais limpo seguir pra Task 10 direto.

- [ ] **Step 7: Commit**

```bash
git add app/\(portal\)/portal/layout.tsx app/\(portal\)/portal/actions.ts components/portal/Sidebar.tsx components/portal/Topbar.tsx
git commit -m "refactor(portal): proteção server-side + Sidebar/Topbar com profile real"
```

---

### Task 10: Dashboard `/portal` com renderização por role

**Files:**
- Modify: `app/(portal)/portal/page.tsx` (rewrite completo)

- [ ] **Step 1: Substituir `app/(portal)/portal/page.tsx`** por dashboard real

```tsx
import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, Building2, Settings, Wrench } from 'lucide-react';

async function getAdminStats() {
  const supabase = await createClient();
  const [{ count: usuarios }, { count: clientes }, { count: maquinas }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('client_companies').select('*', { count: 'exact', head: true }),
    supabase.from('machines').select('*', { count: 'exact', head: true }),
  ]);
  return { usuarios: usuarios ?? 0, clientes: clientes ?? 0, maquinas: maquinas ?? 0 };
}

export default async function PortalPage() {
  const profile = await requireProfile();

  if (profile.role === 'admin') {
    const stats = await getAdminStats();
    const cards = [
      { href: '/portal/admin/usuarios', label: 'Usuários', count: stats.usuarios, icon: Users },
      { href: '/portal/admin/clientes', label: 'Clientes', count: stats.clientes, icon: Building2 },
      { href: '/portal/admin/maquinas', label: 'Máquinas', count: stats.maquinas, icon: Settings },
    ];
    return (
      <div className="space-y-10">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Bem-vindo</p>
          <h1 className="mt-2 font-display text-h1 font-bold text-white">
            Olá, <span className="text-brand-yellow">{profile.full_name}</span>
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map(({ href, label, count, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-white/10 bg-ink-900/60 p-6 transition-colors hover:border-brand-yellow/40"
            >
              <Icon className="size-6 text-brand-yellow" />
              <p className="mt-4 text-label uppercase tracking-wider text-ink-100/60">{label}</p>
              <p className="mt-1 font-display text-h2 font-bold text-white">{count}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const placeholderTitle = profile.role === 'mechanic'
    ? 'Em breve: criar relatório de manutenção'
    : 'Em breve: visualizar relatórios da sua empresa';

  return (
    <div className="space-y-8">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Bem-vindo</p>
        <h1 className="mt-2 font-display text-h1 font-bold text-white">
          Olá, <span className="text-brand-yellow">{profile.full_name}</span>
        </h1>
      </div>
      <div className="rounded-xl border border-dashed border-white/15 bg-ink-900/40 px-8 py-12 text-center">
        <Wrench className="mx-auto size-10 text-brand-yellow/70" />
        <h2 className="mt-4 font-display text-h3 font-bold text-white">{placeholderTitle}</h2>
        <p className="mt-2 text-small text-ink-100/60">Esta funcionalidade chega na próxima fatia.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Deletar `data/mock/cliente.ts` e arquivos relacionados que não são mais usados**

> Cuidado: outros arquivos podem importar `CLIENTE_DEMO` ou `getManutencoesRecentes`. Antes de deletar, rode busca:

```bash
grep -rl "data/mock/cliente\|data/mock/manutencoes\|CLIENTE_DEMO\|getManutencoesRecentes" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v .next
```

Se só `data/mock/*` e arquivos já refatorados aparecerem, pode deletar:

```bash
git rm data/mock/cliente.ts data/mock/manutencoes.ts 2>/dev/null || true
```

> Se `MaintenanceCard.tsx`/`MaintenanceDialog.tsx`/`DashboardStats.tsx` ainda dependerem do mock, **deixe os componentes intactos** (são usados como exemplo visual; vão ser substituídos na Fatia 2). Apenas confirme que não estão sendo importados em lugar nenhum agora.

- [ ] **Step 3: Build + type-check**

```bash
npx tsc --noEmit && npm run build
```

Esperado: verde.

- [ ] **Step 4: Smoke test manual completo**

```bash
npm run dev
```

Abrir Studio (http://127.0.0.1:54323) → Authentication → Add user → criar `admin@fb.com.br` / senha `senha123`. Copie o UUID.

Studio → SQL Editor:

```sql
insert into profiles (id, full_name, role)
values ('<UUID-copiado>', 'Admin Teste', 'admin');
```

Volte ao navegador, vá em http://localhost:3000/portal → redirect pra /login. Logue com `admin@fb.com.br` / `senha123`. Deve cair em `/portal` mostrando dashboard admin com 3 cards (Usuários=1, Clientes=0, Máquinas=0).

Logout pelo botão no Sidebar → volta pra /login. ✅

- [ ] **Step 5: Commit**

```bash
git add app/\(portal\)/portal/page.tsx
git add -u data/ 2>/dev/null || true
git commit -m "feat(portal): dashboard real por role (admin com stats, mechanic/client placeholder)"
```

---

## PHASE 2 — Email + Testes

### Task 11: Setup Resend (lib/email.ts)

**Files:**
- Create: `lib/email.ts`

- [ ] **Step 1: Criar `lib/email.ts`**

```ts
import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    ...args,
  });
  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
  return result.data;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/email.ts
git commit -m "feat(email): wrapper sendEmail com Resend"
```

---

### Task 12: Rota oculta de teste de email

**Files:**
- Create: `app/(portal)/portal/admin/_test-email/page.tsx`
- Create: `app/(portal)/portal/admin/_test-email/actions.ts`

- [ ] **Step 1: Criar diretório**

```bash
mkdir -p "app/(portal)/portal/admin/_test-email"
```

- [ ] **Step 2: Criar `app/(portal)/portal/admin/_test-email/actions.ts`**

```ts
'use server';

import { requireRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export type TestEmailState = { message: string | null; error: string | null };

export async function sendTestEmailAction(
  _prev: TestEmailState,
  formData: FormData,
): Promise<TestEmailState> {
  const profile = await requireRole('admin');
  const to = String(formData.get('to') ?? profile.full_name).trim();
  if (!to.includes('@')) {
    return { message: null, error: 'Forneça um email válido.' };
  }

  try {
    await sendEmail({
      to,
      subject: 'Teste de configuração — Portal FB Empilhadeiras',
      html: '<p>Se você está vendo este email, o Resend está configurado corretamente.</p>',
    });
    return { message: `Email enviado para ${to}.`, error: null };
  } catch (e) {
    return { message: null, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
```

- [ ] **Step 3: Criar `app/(portal)/portal/admin/_test-email/page.tsx`**

```tsx
'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendTestEmailAction, type TestEmailState } from './actions';

const INITIAL: TestEmailState = { message: null, error: null };

export default function TestEmailPage() {
  const [state, formAction, pending] = useActionState(sendTestEmailAction, INITIAL);

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-display text-h2 font-bold text-white">Teste de Email</h1>
        <p className="mt-2 text-small text-ink-100/60">Valida setup do Resend.</p>
      </div>
      <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-ink-900/60 p-6">
        <div>
          <Label htmlFor="to" className="text-ink-100">Enviar para</Label>
          <Input
            id="to"
            name="to"
            type="email"
            required
            className="mt-2 border-white/15 bg-ink-950/50 text-white"
            placeholder="seu@email.com"
          />
        </div>
        {state.error && <p className="text-small text-red-300">{state.error}</p>}
        {state.message && <p className="text-small text-emerald-300">{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white disabled:opacity-50"
        >
          {pending ? 'Enviando…' : 'Enviar teste'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Type-check + build**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Smoke test (opcional, depende de chave Resend válida)**

`npm run dev`, logue como admin, vá em http://localhost:3000/portal/admin/_test-email. Note: vai dar 404 porque o `(portal)/portal/admin/` ainda não tem layout — vai funcionar após Task 16. Pule por agora.

- [ ] **Step 6: Commit**

```bash
git add app/\(portal\)/portal/admin/_test-email/
git commit -m "feat(email): rota oculta de teste do Resend (admin only)"
```

---

### Task 13: Setup Vitest + helper de fixtures

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/helpers/supabase.ts`
- Modify: `package.json` (scripts de teste)

- [ ] **Step 1: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    testTimeout: 30_000,
    fileParallel: false, // testes RLS compartilham DB
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
```

- [ ] **Step 2: Adicionar scripts em `package.json`**

```json
"test": "dotenv -e .env.local -- vitest run",
"test:watch": "dotenv -e .env.local -- vitest"
```

Verifique scripts ficaram assim (mantenha existentes):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:types": "supabase gen types typescript --local > lib/database.types.ts",
  "test": "dotenv -e .env.local -- vitest run",
  "test:watch": "dotenv -e .env.local -- vitest"
}
```

- [ ] **Step 3: Criar `tests/helpers/supabase.ts`**

```ts
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

export async function wipeAll() {
  const admin = adminClient();
  await admin.from('machines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('client_companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: users } = await admin.auth.admin.listUsers();
  for (const u of users?.users ?? []) {
    await admin.auth.admin.deleteUser(u.id);
  }
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests/helpers/ package.json package-lock.json
git commit -m "test: setup vitest + helpers Supabase pra testes RLS"
```

---

### Task 14: Testes RLS (isolamento entre clientes)

**Files:**
- Create: `tests/rls.test.ts`

- [ ] **Step 1: Criar `tests/rls.test.ts`**

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { adminClient, anonClient, loggedClient, createTestUser, wipeAll } from './helpers/supabase';

let companyAId: string;
let companyBId: string;
let machineAId: string;
let machineBId: string;

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

  const { data: mA, error: emA } = await admin
    .from('machines').insert({ client_company_id: companyAId, numero_maquina: '1', horimetro_atual: 100 }).select().single();
  if (emA) throw emA;
  machineAId = mA.id;

  const { data: mB, error: emB } = await admin
    .from('machines').insert({ client_company_id: companyBId, numero_maquina: '1', horimetro_atual: 200 }).select().single();
  if (emB) throw emB;
  machineBId = mB.id;

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
  it('vê 0 rows em machines', async () => {
    const { data } = await anonClient().from('machines').select('*');
    expect(data ?? []).toHaveLength(0);
  });
});

describe('RLS: cliente A isolamento', () => {
  it('vê só sua própria company', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { data } = await client.from('client_companies').select('*');
    expect(data).toHaveLength(1);
    expect(data?.[0].id).toBe(companyAId);
  });

  it('vê só suas próprias máquinas', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { data } = await client.from('machines').select('*');
    expect(data).toHaveLength(1);
    expect(data?.[0].id).toBe(machineAId);
  });

  it('NÃO consegue inserir máquina', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { error } = await client.from('machines').insert({
      client_company_id: companyAId, numero_maquina: '99', horimetro_atual: 0,
    });
    expect(error).not.toBeNull();
  });

  it('NÃO consegue atualizar company', async () => {
    const client = await loggedClient('clienteA@test.com', 'senha123');
    const { error, data } = await client.from('client_companies')
      .update({ name: 'Hack' }).eq('id', companyAId).select();
    // RLS pode retornar erro OU silenciosamente filtrar (0 rows afetadas)
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });
});

describe('RLS: mechanic', () => {
  it('lê todas as companies', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { data } = await client.from('client_companies').select('*');
    expect(data).toHaveLength(2);
  });

  it('lê todas as machines', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { data } = await client.from('machines').select('*');
    expect(data).toHaveLength(2);
  });

  it('NÃO consegue inserir company', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { error } = await client.from('client_companies').insert({ name: 'X' });
    expect(error).not.toBeNull();
  });

  it('NÃO consegue inserir machine', async () => {
    const client = await loggedClient('mech@test.com', 'senha123');
    const { error } = await client.from('machines').insert({
      client_company_id: companyAId, numero_maquina: '88', horimetro_atual: 0,
    });
    expect(error).not.toBeNull();
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
```

- [ ] **Step 2: Rodar testes**

```bash
npm test
```

Esperado: todos passam (esperar ~10-20s).

> Se algum teste falha, **NÃO mude o teste pra passar**. Investigue: provavelmente a policy SQL está errada na migration ou o helper criou user diferente do esperado. Corrija a fonte.

- [ ] **Step 3: Commit**

```bash
git add tests/rls.test.ts
git commit -m "test(rls): isolamento entre clientes + permissões por role"
```

---

### Task 15: Teste estrutural — RLS em toda tabela public

**Files:**
- Create: `tests/rls-coverage.test.ts`
- Modify: `package.json` + `.env.local` (+ `.env.example`)

> Esse teste precisa de acesso a `pg_class` (catálogo do Postgres), que Supabase REST/PostgREST NÃO expõe. Vamos conectar ao Postgres diretamente via biblioteca `postgres`.

- [ ] **Step 1: Instalar driver postgres**

```bash
npm install -D postgres
```

- [ ] **Step 2: Adicionar `SUPABASE_DB_URL` ao `.env.local` e `.env.example`**

`.env.local`:

```
SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

`.env.example` (mesma linha):

```
SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

- [ ] **Step 3: Criar `tests/rls-coverage.test.ts`**

```ts
import { describe, it, expect, afterAll } from 'vitest';
import postgres from 'postgres';

const DB_URL = process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
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
```

- [ ] **Step 4: Rodar testes**

```bash
npm test
```

Esperado: testes da Task 14 (RLS) + 3 testes de cobertura, todos passam.

- [ ] **Step 5: Commit**

```bash
git add tests/rls-coverage.test.ts .env.example package.json package-lock.json
git commit -m "test(rls): cobertura estrutural — toda tabela public tem RLS"
```

---

## PHASE 3 — CRUD Admin

### Task 16: Layout `/portal/admin` (gate de role)

**Files:**
- Create: `app/(portal)/portal/admin/layout.tsx`

- [ ] **Step 1: Criar `app/(portal)/portal/admin/layout.tsx`**

```tsx
import { requireRole } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin');
  return <>{children}</>;
}
```

- [ ] **Step 2: Smoke test**

`npm run dev`. Logue como admin → tente acessar http://localhost:3000/portal/admin/usuarios → 404 (route ainda não existe — esperado). Logue como mechanic (crie um via Studio se precisar) → tente acessar /portal/admin → redireciona pra /portal.

- [ ] **Step 3: Commit**

```bash
git add app/\(portal\)/portal/admin/layout.tsx
git commit -m "feat(admin): gate role=admin no layout /portal/admin"
```

---

### Task 17: CRUD Clientes (lista + criar + editar)

**Files:**
- Create: `app/(portal)/portal/admin/clientes/page.tsx`
- Create: `app/(portal)/portal/admin/clientes/novo/page.tsx`
- Create: `app/(portal)/portal/admin/clientes/[id]/page.tsx`
- Create: `app/(portal)/portal/admin/clientes/actions.ts`
- Create: `components/portal/admin/ClienteForm.tsx`

- [ ] **Step 1: Criar `app/(portal)/portal/admin/clientes/actions.ts`**

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export type ClienteFormState = { error: string | null };

function parseForm(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    cnpj: String(formData.get('cnpj') ?? '').trim() || null,
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || null,
    active: formData.get('active') === 'on',
  };
}

export async function createClienteAction(
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);
  if (!payload.name) return { error: 'Nome é obrigatório.' };

  const supabase = await createClient();
  const { error } = await supabase.from('client_companies').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/clientes');
  redirect('/portal/admin/clientes');
}

export async function updateClienteAction(
  id: string,
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);
  if (!payload.name) return { error: 'Nome é obrigatório.' };

  const supabase = await createClient();
  const { error } = await supabase.from('client_companies').update(payload).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/clientes');
  redirect('/portal/admin/clientes');
}
```

- [ ] **Step 2: Criar `components/portal/admin/ClienteForm.tsx`**

```tsx
'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClientCompany } from '@/lib/types';

type Action = (prev: { error: string | null }, fd: FormData) => Promise<{ error: string | null }>;

export function ClienteForm({ action, initial }: { action: Action; initial?: ClientCompany }) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-white/10 bg-ink-900/60 p-6">
      <div>
        <Label htmlFor="name" className="text-ink-100">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial?.name ?? ''}
          className="mt-2 border-white/15 bg-ink-950/50 text-white"
        />
      </div>
      <div>
        <Label htmlFor="cnpj" className="text-ink-100">CNPJ</Label>
        <Input
          id="cnpj"
          name="cnpj"
          defaultValue={initial?.cnpj ?? ''}
          className="mt-2 border-white/15 bg-ink-950/50 text-white"
        />
      </div>
      <div>
        <Label htmlFor="contact_phone" className="text-ink-100">Telefone</Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          defaultValue={initial?.contact_phone ?? ''}
          className="mt-2 border-white/15 bg-ink-950/50 text-white"
        />
      </div>
      <label className="flex items-center gap-3 text-small text-ink-100">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-4" />
        Ativo
      </label>
      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white disabled:opacity-50"
        >
          {pending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Criar `app/(portal)/portal/admin/clientes/page.tsx`** (lista)

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('client_companies').select('*').order('name');
  if (q) query = query.or(`name.ilike.%${q}%,cnpj.ilike.%${q}%`);
  const { data: clientes } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Clientes</h1>
        <Link
          href="/portal/admin/clientes/novo"
          className="inline-flex items-center gap-2 rounded bg-brand-yellow px-4 py-2 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white"
        >
          <Plus className="size-4" /> Novo cliente
        </Link>
      </div>
      <form className="max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nome ou CNPJ…"
          className="w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white placeholder:text-ink-300"
        />
      </form>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
        <table className="w-full text-small">
          <thead className="bg-white/[0.03] text-label uppercase tracking-wider text-ink-100/60">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">CNPJ</th>
              <th className="px-4 py-3 text-left">Telefone</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(clientes ?? []).map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{c.name}</td>
                <td className="px-4 py-3 text-ink-100/70">{c.cnpj ?? '—'}</td>
                <td className="px-4 py-3 text-ink-100/70">{c.contact_phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={c.active ? 'text-emerald-300' : 'text-ink-100/40'}>
                    {c.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/portal/admin/clientes/${c.id}`} className="text-brand-yellow hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(clientes ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-100/50">Nenhum cliente.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar `app/(portal)/portal/admin/clientes/novo/page.tsx`**

```tsx
import { ClienteForm } from '@/components/portal/admin/ClienteForm';
import { createClienteAction } from '../actions';

export default function NovoClientePage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Novo cliente</h1>
      <ClienteForm action={createClienteAction} />
    </div>
  );
}
```

- [ ] **Step 5: Criar `app/(portal)/portal/admin/clientes/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { ClienteForm } from '@/components/portal/admin/ClienteForm';
import { createClient } from '@/lib/supabase/server';
import { updateClienteAction } from '../actions';

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from('client_companies').select('*').eq('id', id).single();

  if (!cliente) notFound();

  const boundAction = updateClienteAction.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Editar cliente</h1>
      <ClienteForm action={boundAction} initial={cliente} />
    </div>
  );
}
```

- [ ] **Step 6: Type-check + build**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 7: Smoke test**

`npm run dev`, logue como admin, vá em /portal/admin/clientes. Crie "Cliente Teste". Edite. Confirme que listou.

- [ ] **Step 8: Commit**

```bash
git add app/\(portal\)/portal/admin/clientes/ components/portal/admin/ClienteForm.tsx
git commit -m "feat(admin): CRUD de clientes (empresas)"
```

---

### Task 18: CRUD Máquinas (lista + criar + editar)

**Files:**
- Create: `app/(portal)/portal/admin/maquinas/page.tsx`
- Create: `app/(portal)/portal/admin/maquinas/novo/page.tsx`
- Create: `app/(portal)/portal/admin/maquinas/[id]/page.tsx`
- Create: `app/(portal)/portal/admin/maquinas/actions.ts`
- Create: `components/portal/admin/MaquinaForm.tsx`

- [ ] **Step 1: Criar `app/(portal)/portal/admin/maquinas/actions.ts`**

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { FuelType } from '@/lib/types';

export type MaquinaFormState = { error: string | null };

const FUEL_VALUES: FuelType[] = ['glp', 'diesel', 'eletrica', 'gasolina', 'outro'];

function parseForm(formData: FormData) {
  const tipo = String(formData.get('tipo_combustivel') ?? '');
  return {
    client_company_id: String(formData.get('client_company_id') ?? ''),
    numero_maquina: String(formData.get('numero_maquina') ?? '').trim(),
    horimetro_atual: Number(formData.get('horimetro_atual') ?? 0),
    modelo: String(formData.get('modelo') ?? '').trim() || null,
    fabricante: String(formData.get('fabricante') ?? '').trim() || null,
    tipo_combustivel: FUEL_VALUES.includes(tipo as FuelType) ? (tipo as FuelType) : null,
    numero_serie: String(formData.get('numero_serie') ?? '').trim() || null,
    active: formData.get('active') === 'on',
  };
}

export async function createMaquinaAction(
  _prev: MaquinaFormState,
  formData: FormData,
): Promise<MaquinaFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);
  if (!payload.client_company_id || !payload.numero_maquina) {
    return { error: 'Empresa e número da máquina são obrigatórios.' };
  }
  if (Number.isNaN(payload.horimetro_atual) || payload.horimetro_atual < 0) {
    return { error: 'Horímetro deve ser número positivo.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('machines').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/maquinas');
  redirect('/portal/admin/maquinas');
}

export async function updateMaquinaAction(
  id: string,
  _prev: MaquinaFormState,
  formData: FormData,
): Promise<MaquinaFormState> {
  await requireRole('admin');
  const payload = parseForm(formData);

  const supabase = await createClient();
  const { error } = await supabase.from('machines').update(payload).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/maquinas');
  redirect('/portal/admin/maquinas');
}
```

- [ ] **Step 2: Criar `components/portal/admin/MaquinaForm.tsx`**

```tsx
'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Machine, ClientCompany, FuelType } from '@/lib/types';

type Action = (prev: { error: string | null }, fd: FormData) => Promise<{ error: string | null }>;

const FUEL_LABELS: Record<FuelType, string> = {
  glp: 'GLP',
  diesel: 'Diesel',
  eletrica: 'Elétrica',
  gasolina: 'Gasolina',
  outro: 'Outro',
};

export function MaquinaForm({
  action,
  initial,
  empresas,
}: {
  action: Action;
  initial?: Machine;
  empresas: Pick<ClientCompany, 'id' | 'name'>[];
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-white/10 bg-ink-900/60 p-6">
      <div>
        <Label htmlFor="client_company_id" className="text-ink-100">Empresa *</Label>
        <select
          id="client_company_id"
          name="client_company_id"
          required
          defaultValue={initial?.client_company_id ?? ''}
          className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
        >
          <option value="">Selecione…</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="numero_maquina" className="text-ink-100">Nº da máquina *</Label>
          <Input
            id="numero_maquina"
            name="numero_maquina"
            required
            defaultValue={initial?.numero_maquina ?? ''}
            className="mt-2 border-white/15 bg-ink-950/50 text-white"
          />
        </div>
        <div>
          <Label htmlFor="horimetro_atual" className="text-ink-100">Horímetro atual *</Label>
          <Input
            id="horimetro_atual"
            name="horimetro_atual"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={initial?.horimetro_atual ?? 0}
            className="mt-2 border-white/15 bg-ink-950/50 text-white"
          />
        </div>
        <div>
          <Label htmlFor="modelo" className="text-ink-100">Modelo</Label>
          <Input id="modelo" name="modelo" defaultValue={initial?.modelo ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
        </div>
        <div>
          <Label htmlFor="fabricante" className="text-ink-100">Fabricante</Label>
          <Input id="fabricante" name="fabricante" defaultValue={initial?.fabricante ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
        </div>
        <div>
          <Label htmlFor="tipo_combustivel" className="text-ink-100">Combustível</Label>
          <select
            id="tipo_combustivel"
            name="tipo_combustivel"
            defaultValue={initial?.tipo_combustivel ?? ''}
            className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
          >
            <option value="">—</option>
            {(Object.entries(FUEL_LABELS) as [FuelType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="numero_serie" className="text-ink-100">Nº de série</Label>
          <Input id="numero_serie" name="numero_serie" defaultValue={initial?.numero_serie ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
        </div>
      </div>
      <label className="flex items-center gap-3 text-small text-ink-100">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-4" />
        Ativa
      </label>
      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white disabled:opacity-50"
      >
        {pending ? 'Salvando…' : 'Salvar'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Criar `app/(portal)/portal/admin/maquinas/page.tsx`** (lista)

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

export default async function MaquinasPage({ searchParams }: { searchParams: Promise<{ q?: string; cliente?: string }> }) {
  const { q, cliente } = await searchParams;
  const supabase = await createClient();

  const [{ data: empresas }, machinesQuery] = await Promise.all([
    supabase.from('client_companies').select('id, name').order('name'),
    (async () => {
      let qb = supabase
        .from('machines')
        .select('*, client_companies(name)')
        .order('numero_maquina');
      if (cliente) qb = qb.eq('client_company_id', cliente);
      if (q) qb = qb.ilike('numero_maquina', `%${q}%`);
      return qb;
    })(),
  ]);

  const { data: maquinas } = machinesQuery;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Máquinas</h1>
        <Link href="/portal/admin/maquinas/novo" className="inline-flex items-center gap-2 rounded bg-brand-yellow px-4 py-2 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white">
          <Plus className="size-4" /> Nova máquina
        </Link>
      </div>
      <form className="flex flex-wrap gap-3">
        <select
          name="cliente"
          defaultValue={cliente ?? ''}
          className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
        >
          <option value="">Todos os clientes</option>
          {(empresas ?? []).map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar nº…"
          className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white placeholder:text-ink-300"
        />
        <button type="submit" className="rounded border border-white/15 px-4 py-2 text-small text-white hover:border-brand-yellow">
          Filtrar
        </button>
      </form>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
        <table className="w-full text-small">
          <thead className="bg-white/[0.03] text-label uppercase tracking-wider text-ink-100/60">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Nº</th>
              <th className="px-4 py-3 text-left">Horímetro</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(maquinas ?? []).map((m) => (
              <tr key={m.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{(m as any).client_companies?.name ?? '—'}</td>
                <td className="px-4 py-3 text-ink-100/80">{m.numero_maquina}</td>
                <td className="px-4 py-3 text-ink-100/70">{m.horimetro_atual}</td>
                <td className="px-4 py-3 text-ink-100/70">{m.modelo ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={m.active ? 'text-emerald-300' : 'text-ink-100/40'}>
                    {m.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/portal/admin/maquinas/${m.id}`} className="text-brand-yellow hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
            {(maquinas ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-100/50">Nenhuma máquina.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar `app/(portal)/portal/admin/maquinas/novo/page.tsx`**

```tsx
import { MaquinaForm } from '@/components/portal/admin/MaquinaForm';
import { createClient } from '@/lib/supabase/server';
import { createMaquinaAction } from '../actions';

export default async function NovaMaquinaPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from('client_companies').select('id, name').eq('active', true).order('name');

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Nova máquina</h1>
      <MaquinaForm action={createMaquinaAction} empresas={empresas ?? []} />
    </div>
  );
}
```

- [ ] **Step 5: Criar `app/(portal)/portal/admin/maquinas/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { MaquinaForm } from '@/components/portal/admin/MaquinaForm';
import { createClient } from '@/lib/supabase/server';
import { updateMaquinaAction } from '../actions';

export default async function EditarMaquinaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: maquina }, { data: empresas }] = await Promise.all([
    supabase.from('machines').select('*').eq('id', id).single(),
    supabase.from('client_companies').select('id, name').order('name'),
  ]);

  if (!maquina) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Editar máquina</h1>
      <MaquinaForm action={updateMaquinaAction.bind(null, id)} initial={maquina} empresas={empresas ?? []} />
    </div>
  );
}
```

- [ ] **Step 6: Build + smoke test**

```bash
npm run build
```

`npm run dev`, criar máquina vinculada ao cliente criado na Task 17. Editar.

- [ ] **Step 7: Commit**

```bash
git add app/\(portal\)/portal/admin/maquinas/ components/portal/admin/MaquinaForm.tsx
git commit -m "feat(admin): CRUD de máquinas"
```

---

### Task 19: CRUD Usuários (lista + criar + editar + resetar senha)

**Files:**
- Create: `app/(portal)/portal/admin/usuarios/page.tsx`
- Create: `app/(portal)/portal/admin/usuarios/novo/page.tsx`
- Create: `app/(portal)/portal/admin/usuarios/[id]/page.tsx`
- Create: `app/(portal)/portal/admin/usuarios/actions.ts`
- Create: `components/portal/admin/UsuarioForm.tsx`
- Create: `components/portal/admin/ResetSenhaButton.tsx`

- [ ] **Step 1: Criar `app/(portal)/portal/admin/usuarios/actions.ts`**

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export type UsuarioFormState = { error: string | null };

const ROLE_VALUES: UserRole[] = ['admin', 'mechanic', 'client'];

export async function createUsuarioAction(
  _prev: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  await requireRole('admin');

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const full_name = String(formData.get('full_name') ?? '').trim();
  const roleRaw = String(formData.get('role') ?? '');
  const client_company_id = String(formData.get('client_company_id') ?? '').trim() || null;

  if (!email || !password || !full_name) return { error: 'Nome, email e senha são obrigatórios.' };
  if (!ROLE_VALUES.includes(roleRaw as UserRole)) return { error: 'Papel inválido.' };
  const role = roleRaw as UserRole;
  if (password.length < 6) return { error: 'Senha mínima de 6 caracteres.' };
  if (role === 'client' && !client_company_id) return { error: 'Cliente requer empresa.' };
  if (role !== 'client' && client_company_id) return { error: 'Só usuários cliente têm empresa.' };

  const admin = createAdminClient();
  const { data: user, error: userErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userErr || !user.user) return { error: `Erro Auth: ${userErr?.message ?? 'desconhecido'}` };

  const { error: profErr } = await admin.from('profiles').insert({
    id: user.user.id,
    full_name,
    role,
    client_company_id,
  });
  if (profErr) {
    // rollback: deletar user que criamos
    await admin.auth.admin.deleteUser(user.user.id);
    return { error: `Erro profile: ${profErr.message}` };
  }

  revalidatePath('/portal/admin/usuarios');
  redirect('/portal/admin/usuarios');
}

export async function updateUsuarioAction(
  id: string,
  _prev: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  await requireRole('admin');

  const full_name = String(formData.get('full_name') ?? '').trim();
  const roleRaw = String(formData.get('role') ?? '');
  const client_company_id = String(formData.get('client_company_id') ?? '').trim() || null;
  const active = formData.get('active') === 'on';

  if (!full_name) return { error: 'Nome é obrigatório.' };
  if (!ROLE_VALUES.includes(roleRaw as UserRole)) return { error: 'Papel inválido.' };
  const role = roleRaw as UserRole;
  if (role === 'client' && !client_company_id) return { error: 'Cliente requer empresa.' };

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({
    full_name, role, client_company_id: role === 'client' ? client_company_id : null, active,
  }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/portal/admin/usuarios');
  redirect('/portal/admin/usuarios');
}

export type ResetSenhaState = { message: string | null; error: string | null };

export async function resetSenhaAction(
  userId: string,
  _prev: ResetSenhaState,
  formData: FormData,
): Promise<ResetSenhaState> {
  await requireRole('admin');
  const newPassword = String(formData.get('new_password') ?? '');
  if (newPassword.length < 6) return { message: null, error: 'Mínimo 6 caracteres.' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { message: null, error: error.message };

  return { message: 'Senha atualizada. Comunique ao usuário.', error: null };
}
```

- [ ] **Step 2: Criar `components/portal/admin/UsuarioForm.tsx`**

```tsx
'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile, ClientCompany, UserRole } from '@/lib/types';

type Action = (prev: { error: string | null }, fd: FormData) => Promise<{ error: string | null }>;

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  client: 'Cliente (acesso de leitura)',
};

export function UsuarioForm({
  action,
  initial,
  empresas,
  mode,
}: {
  action: Action;
  initial?: Profile & { email?: string };
  empresas: Pick<ClientCompany, 'id' | 'name'>[];
  mode: 'create' | 'edit';
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [role, setRole] = useState<UserRole>(initial?.role ?? 'mechanic');

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-white/10 bg-ink-900/60 p-6">
      <div>
        <Label htmlFor="full_name" className="text-ink-100">Nome completo *</Label>
        <Input id="full_name" name="full_name" required defaultValue={initial?.full_name ?? ''} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
      </div>

      {mode === 'create' && (
        <>
          <div>
            <Label htmlFor="email" className="text-ink-100">Email *</Label>
            <Input id="email" name="email" type="email" required className="mt-2 border-white/15 bg-ink-950/50 text-white" />
          </div>
          <div>
            <Label htmlFor="password" className="text-ink-100">Senha temporária *</Label>
            <Input id="password" name="password" type="text" required minLength={6} className="mt-2 border-white/15 bg-ink-950/50 text-white" />
            <p className="mt-1 text-[12px] text-ink-100/55">Mínimo 6 caracteres. Comunique ao usuário via WhatsApp.</p>
          </div>
        </>
      )}

      {mode === 'edit' && initial?.email && (
        <div>
          <Label className="text-ink-100">Email</Label>
          <p className="mt-2 rounded border border-white/10 bg-ink-950/30 px-3 py-2 text-small text-ink-100/60">{initial.email}</p>
        </div>
      )}

      <div>
        <Label htmlFor="role" className="text-ink-100">Papel *</Label>
        <select
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
        >
          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {role === 'client' && (
        <div>
          <Label htmlFor="client_company_id" className="text-ink-100">Empresa *</Label>
          <select
            id="client_company_id"
            name="client_company_id"
            required
            defaultValue={initial?.client_company_id ?? ''}
            className="mt-2 w-full rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white"
          >
            <option value="">Selecione…</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      )}

      {mode === 'edit' && (
        <label className="flex items-center gap-3 text-small text-ink-100">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-4" />
          Conta ativa (desmarque pra impedir login)
        </label>
      )}

      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white disabled:opacity-50"
      >
        {pending ? 'Salvando…' : 'Salvar'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Criar `components/portal/admin/ResetSenhaButton.tsx`**

```tsx
'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetSenhaAction, type ResetSenhaState } from '@/app/(portal)/portal/admin/usuarios/actions';

const INITIAL: ResetSenhaState = { message: null, error: null };

export function ResetSenhaButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = resetSenhaAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(boundAction, INITIAL);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-white/15 px-4 py-2 text-small text-white hover:border-brand-yellow"
      >
        Resetar senha
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded border border-white/15 bg-ink-950/40 p-4">
      <Label htmlFor="new_password" className="text-ink-100">Nova senha temporária</Label>
      <Input
        id="new_password"
        name="new_password"
        type="text"
        required
        minLength={6}
        className="border-white/15 bg-ink-950/50 text-white"
      />
      {state.error && <p className="text-small text-red-300">{state.error}</p>}
      {state.message && <p className="text-small text-emerald-300">{state.message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded bg-brand-yellow px-4 py-2 text-small font-bold text-ink-950 disabled:opacity-50">
          {pending ? 'Resetando…' : 'Confirmar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/15 px-4 py-2 text-small text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Criar `app/(portal)/portal/admin/usuarios/page.tsx`** (lista)

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

const ROLE_LABEL = { admin: 'Admin', mechanic: 'Mecânico', client: 'Cliente' } as const;

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const { q, role } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('*, client_companies(name)')
    .order('full_name');
  if (q) query = query.ilike('full_name', `%${q}%`);
  if (role && (role === 'admin' || role === 'mechanic' || role === 'client')) {
    query = query.eq('role', role);
  }
  const { data: profiles } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Usuários</h1>
        <Link href="/portal/admin/usuarios/novo" className="inline-flex items-center gap-2 rounded bg-brand-yellow px-4 py-2 text-small font-bold uppercase tracking-wider text-ink-950 hover:bg-white">
          <Plus className="size-4" /> Novo usuário
        </Link>
      </div>
      <form className="flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar nome…"
          className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white placeholder:text-ink-300"
        />
        <select name="role" defaultValue={role ?? ''} className="rounded border border-white/15 bg-ink-950/50 px-3 py-2 text-small text-white">
          <option value="">Todos os papéis</option>
          <option value="admin">Admin</option>
          <option value="mechanic">Mecânico</option>
          <option value="client">Cliente</option>
        </select>
        <button type="submit" className="rounded border border-white/15 px-4 py-2 text-small text-white hover:border-brand-yellow">
          Filtrar
        </button>
      </form>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
        <table className="w-full text-small">
          <thead className="bg-white/[0.03] text-label uppercase tracking-wider text-ink-100/60">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Papel</th>
              <th className="px-4 py-3 text-left">Empresa</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{p.full_name}</td>
                <td className="px-4 py-3 text-ink-100/70">{ROLE_LABEL[p.role]}</td>
                <td className="px-4 py-3 text-ink-100/70">{(p as any).client_companies?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={p.active ? 'text-emerald-300' : 'text-ink-100/40'}>
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/portal/admin/usuarios/${p.id}`} className="text-brand-yellow hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
            {(profiles ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-100/50">Nenhum usuário.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Criar `app/(portal)/portal/admin/usuarios/novo/page.tsx`**

```tsx
import { UsuarioForm } from '@/components/portal/admin/UsuarioForm';
import { createClient } from '@/lib/supabase/server';
import { createUsuarioAction } from '../actions';

export default async function NovoUsuarioPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from('client_companies').select('id, name').eq('active', true).order('name');

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Novo usuário</h1>
      <UsuarioForm action={createUsuarioAction} empresas={empresas ?? []} mode="create" />
    </div>
  );
}
```

- [ ] **Step 6: Criar `app/(portal)/portal/admin/usuarios/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { UsuarioForm } from '@/components/portal/admin/UsuarioForm';
import { ResetSenhaButton } from '@/components/portal/admin/ResetSenhaButton';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateUsuarioAction } from '../actions';

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profile }, { data: empresas }, { data: authUser }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('client_companies').select('id, name').order('name'),
    admin.auth.admin.getUserById(id),
  ]);

  if (!profile) notFound();

  const initial = { ...profile, email: authUser.user?.email };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-white">Editar usuário</h1>
      <UsuarioForm
        action={updateUsuarioAction.bind(null, id)}
        initial={initial}
        empresas={empresas ?? []}
        mode="edit"
      />
      <div className="space-y-3">
        <h2 className="text-label uppercase tracking-wider text-ink-100/60">Senha</h2>
        <ResetSenhaButton userId={id} />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Build + smoke test**

```bash
npm run build
```

`npm run dev`. Criar usuário mecânico. Editar. Resetar senha. Tentar logar com mecânico novo (deve funcionar). Tentar acessar `/portal/admin/usuarios` como mecânico → redirect /portal.

- [ ] **Step 8: Commit**

```bash
git add app/\(portal\)/portal/admin/usuarios/ components/portal/admin/UsuarioForm.tsx components/portal/admin/ResetSenhaButton.tsx
git commit -m "feat(admin): CRUD de usuários + reset de senha"
```

---

## PHASE 4 — Bootstrap e finalização

### Task 20: Seed file + documentação de deploy

**Files:**
- Create: `supabase/seed.sql` (vazio com instruções em comentário)
- Create: `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md`

- [ ] **Step 1: Criar `supabase/seed.sql`**

```sql
-- Este arquivo NÃO é executado em produção automaticamente.
-- Em produção, o bootstrap do user admin é feito manualmente:
--
-- 1. Supabase Dashboard > Authentication > Add user
--    Email: fabiano@fb.com.br
--    Senha: <senha forte temporária>
--    "Auto Confirm User": ON
--
-- 2. Pegar o UUID do user criado e rodar no SQL Editor:
--
--    insert into profiles (id, full_name, role)
--    values ('<uuid>', 'Fabiano Bratti', 'admin');
--
-- 3. Logar em /login e criar demais usuários pelo painel.
--
-- Para DEV local (supabase start), o supabase db reset roda este arquivo —
-- útil pra pré-popular um admin de teste:

-- Cria admin de teste (só DEV local — UUID determinístico pra facilitar):
-- (Descomente as 2 linhas abaixo se quiser admin pré-criado em dev)

-- insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
-- values ('00000000-0000-0000-0000-000000000001', 'admin@local.dev', crypt('admin123', gen_salt('bf')), now(), '{}', '{}', 'authenticated', 'authenticated');
-- insert into profiles (id, full_name, role) values ('00000000-0000-0000-0000-000000000001', 'Admin Dev', 'admin');
```

- [ ] **Step 2: Criar `docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md`**

```markdown
# Portal Fatia 1 — Deploy Notes

> Procedimentos de deploy para o portal. Manter atualizado conforme deploy de cada fatia.

## Pré-deploy (one-time)

### 1. Criar projeto Supabase de produção

1. supabase.com → New project
2. Region: South America (São Paulo) — `sa-east-1`
3. Anotar: Project URL, anon key, service_role key (Settings > API)
4. Copiar database password (necessário pra rodar migrations remotas)

### 2. Link CLI com projeto remoto

```bash
npx supabase link --project-ref <project-ref>
# usa database password quando pedir
```

### 3. Rodar migrations no remoto

```bash
npx supabase db push
```

Verificar no Studio remoto que as 3 tabelas (`client_companies`, `profiles`, `machines`) foram criadas com RLS habilitada.

### 4. Configurar SMTP Resend no Supabase Auth

Studio remoto > Project Settings > Auth > SMTP Settings:
- Sender email: `relatorios@fabianobratti.com`
- Sender name: FB Empilhadeiras
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: `<RESEND_API_KEY>`

> Necessário pra confirmações de email (mesmo com `email_confirm: true` em createUser, é boa prática ter SMTP configurado pra futuras features).

### 5. Configurar DNS para Resend (fabianobratti.com)

No painel DNS do `fabianobratti.com`:
- Adicionar TXT (SPF): `v=spf1 include:_spf.resend.com ~all`
- Adicionar TXT (DKIM): valor fornecido pelo painel Resend > Domains > Add domain
- Aguardar propagação (até 24h)
- Verificar no painel Resend que domínio está "Verified"

### 6. Bootstrap do user admin (Fabiano)

Studio remoto > Authentication > Add user:
- Email: `fabiano@fb.com.br`
- Senha: senha forte temporária (anotar)
- "Auto Confirm User": ON

Copiar o UUID gerado. SQL Editor:

```sql
insert into profiles (id, full_name, role)
values ('<UUID>', 'Fabiano Bratti', 'admin');
```

### 7. Deploy Vercel

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
# repetir pra "preview" também
vercel --prod
```

## Pós-deploy: validação

1. Acessar URL Vercel → /login
2. Logar como Fabiano
3. Criar 1 cliente, 1 máquina, 1 usuário mecânico
4. Logar como mecânico → ver dashboard placeholder
5. Acessar /portal/admin/_test-email → enviar email pra você → confirmar chegada

## CI (GitHub Actions)

A spec prevê CI rodando testes RLS contra Supabase local. Implementação fica pra task futura
(fora do escopo da Fatia 1 — adicionar quando criar fluxo de PRs).
```

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql docs/superpowers/specs/2026-05-29-portal-fatia1-fundacao-deploy-notes.md
git commit -m "docs(portal): seed file + deploy notes"
```

---

### Task 21: Atualizar página de login para mostrar link "Voltar" oculto em uso interno

> Nada a fazer. Login já está correto após Task 8. Verificação rápida:
> - O CTA "Voltar ao site" no /login é apropriado pra portal acessado pelo site público — manter.

Pule pra Task 22.

---

### Task 22: Cleanup de componentes mock não usados

**Files:**
- Delete (condicional): `components/portal/AuthGate.tsx` (já deletado na Task 9, confirmar)
- Delete (condicional): `components/portal/DashboardStats.tsx`, `MaintenanceCard.tsx`, `MaintenanceDialog.tsx`
- Delete (condicional): `data/mock/cliente.ts`, `data/mock/manutencoes.ts`
- Delete (condicional): `lib/auth-mock.ts` (já deletado na Task 9, confirmar)

- [ ] **Step 1: Identificar referências aos arquivos mock**

```bash
grep -rl "MaintenanceCard\|MaintenanceDialog\|DashboardStats\|data/mock\|auth-mock" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v .next | grep -v supabase/migrations
```

- [ ] **Step 2: Se não houver referências reais (só os próprios arquivos), deletar**

```bash
git rm components/portal/DashboardStats.tsx components/portal/MaintenanceCard.tsx components/portal/MaintenanceDialog.tsx 2>/dev/null || true
git rm data/mock/cliente.ts data/mock/manutencoes.ts 2>/dev/null || true
git rm lib/auth-mock.ts components/portal/AuthGate.tsx 2>/dev/null || true
```

> Se algum desses arquivos ainda for referenciado em algum lugar (sitemap, página obscura), **não delete** — apenas anote pra Fatia 2.

- [ ] **Step 3: Build**

```bash
npm run build
```

Verde.

- [ ] **Step 4: Commit (se algo foi removido)**

```bash
git status
# se houver deleções:
git commit -m "chore(portal): remove mocks não utilizados após auth real"
```

---

### Task 23: Verificação final (critérios de pronto da spec)

> Esta task NÃO produz código — é uma walkthrough manual pra validar que tudo da spec seção 15 foi atendido.

- [ ] **Step 1: Build verde**

```bash
npm run build
```

- [ ] **Step 2: Todos os testes passam**

```bash
npm test
```

Esperado: testes RLS (Task 14) + cobertura estrutural (Task 15) todos verdes.

- [ ] **Step 3: Walkthrough manual**

`npm run dev` + Studio local (http://127.0.0.1:54323).

Marque cada um dos critérios da spec seção 15 conforme verifica:

- [ ] Migrations rodam clean em projeto Supabase novo (`supabase db reset` — Task 3 já provou)
- [ ] Fabiano (admin) consegue logar e criar: 1 mecânico, 1 cliente, 1 user cliente, 1 máquina
- [ ] Mecânico consegue logar e ver dashboard placeholder
- [ ] User cliente consegue logar e ver dashboard placeholder
- [ ] Toggle ativo=false em um user impede login dele (`Conta desativada` no /login)
- [ ] Reset de senha pelo admin funciona (user antigo loga com senha nova)
- [ ] Testes RLS passam (Task 14)
- [ ] Test estrutural confirma RLS em todas as tabelas (Task 15)
- [ ] `/portal/admin/_test-email` envia email com sucesso (depende de Resend API key válida)
- [ ] `.env.example` documenta todas variáveis

- [ ] **Step 4: Atualizar memória do projeto**

(opcional — fora do plano técnico, mas útil pra contexto futuro)

Mencione ao usuário que pode atualizar `~/.claude/projects/.../memory/project_forklift_state.md` pra refletir o novo estado (portal com auth real, fim do mock).

- [ ] **Step 5: Commit final + ready pra PR**

```bash
git log --oneline origin/main..HEAD
```

Deve mostrar todos os commits da Fatia 1. Pra ir pra produção:

```bash
git push origin main
```

(Apenas se o usuário autorizar — não foi pushed antes; ver memória.)

---

## Apêndice: Notas pra subagente executor

- **Sempre rodar `npx supabase status`** antes de qualquer task que toca DB pra confirmar que o local está up.
- **Se DB local desligar entre tasks**, rodar `npx supabase start` novamente (Docker mantém o volume — dados persistem).
- **Quando rodar `db reset`**, todos os dados do dev são perdidos. Recrie o admin (Studio > Auth > Add user) + insert em profiles.
- **Erros típicos:**
  - "relation does not exist" → faltou rodar a migration
  - "permission denied for relation" → policy faltando ou role errada
  - "function private.user_role() does not exist" → migration aplicada parcialmente; `db reset`
  - "JWT expired" no client → middleware não está renovando; verificar `lib/supabase/middleware.ts`
- **Pra debugar policy**, no Studio SQL Editor:
  ```sql
  set role authenticated;
  set request.jwt.claims = '{"sub": "<UUID>", "role": "authenticated"}';
  select * from machines;
  reset role; reset request.jwt.claims;
  ```
