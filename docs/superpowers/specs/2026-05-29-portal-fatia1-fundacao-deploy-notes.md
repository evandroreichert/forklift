# Portal Fatia 1 — Deploy Notes

> Procedimentos de deploy do portal. Manter atualizado conforme deploy de cada fatia.

## Pré-deploy (one-time)

### 1. Criar projeto Supabase

1. supabase.com → New project
2. Region: **South America (São Paulo)** — `sa-east-1`
3. Database password: defina uma senha forte e anote
4. Após criar, anotar (Settings > API):
   - **Project URL** (ex: `https://abcxxxxxxxxxxxxx.supabase.co`)
   - **anon public key**
   - **service_role secret key** (NUNCA committar)
5. Anotar **connection string Postgres** (Settings > Database > Connection string > URI):
   - Formato: `postgresql://postgres.PROJREF:SENHA@aws-0-REGIAO.pooler.supabase.com:5432/postgres`
   - É essa string que vai em `SUPABASE_DB_URL` (necessária pros testes RLS estruturais)

### 2. Aplicar migrations no projeto

**Opção A — Via CLI (recomendado pra repetibilidade):**

```bash
npx supabase login                              # abre browser, cole o code
npx supabase link --project-ref <project-ref>   # pede database password
npx supabase db push                            # aplica migrations da pasta supabase/migrations
```

**Opção B — Manual (rápido pra primeira vez):**

1. Studio remoto → SQL Editor → New query
2. Cole conteúdo de `supabase/migrations/20260529120000_initial_schema.sql`
3. Run

Verifique no Table Editor que as 3 tabelas (`client_companies`, `profiles`, `machines`) foram criadas com cadeado de RLS.

### 3. Gerar tipos TypeScript do projeto remoto

Após o link (Opção A), rodar localmente:

```bash
npm run db:types
```

Sobrescreve `lib/database.types.ts` com tipos exatos do projeto. Commit a mudança se houver drift do stub manual.

### 4. Configurar Resend

1. resend.com → Settings → API Keys → Create API Key (read+write)
2. Anotar a key (começa com `re_`)

### 5. Configurar domínio Resend (pra emails virem de `@fabianobratti.com`)

1. resend.com → Domains → Add Domain → `fabianobratti.com`
2. Adicione os registros DNS fornecidos (SPF, DKIM) no painel do seu DNS
3. Aguarde verificação (até 24h, normalmente <1h)
4. Quando "Verified", atualize `RESEND_FROM_EMAIL` em todos os envs pra `relatorios@fabianobratti.com`

Enquanto não verifica: use `onboarding@resend.dev` (default do Resend, funciona sem DNS).

### 6. Configurar SMTP Resend no Supabase Auth

> Pra que o Supabase Auth possa enviar emails (confirmações futuras, magic links — não usados nesta fatia, mas boa prática deixar configurado).

Studio remoto > Project Settings > Auth > SMTP Settings:
- Sender email: `relatorios@fabianobratti.com` (ou `onboarding@resend.dev` se domínio ainda não verificado)
- Sender name: `FB Empilhadeiras`
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: `<RESEND_API_KEY>`

### 7. Bootstrap do user admin (Fabiano)

Studio remoto > Authentication > Add user:
- Email: `fabiano@fb.com.br`
- Senha: senha forte temporária (anotar pra comunicar)
- "Auto Confirm User": ON

Copiar o UUID gerado. SQL Editor:

```sql
insert into profiles (id, full_name, role)
values ('<UUID>', 'Fabiano Bratti', 'admin');
```

### 8. Deploy Vercel

```bash
vercel link
# Para produção:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_DB_URL production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
# Repetir os mesmos pra "preview" também
vercel --prod
```

## Pós-deploy: validação

1. Acessar URL Vercel → /login
2. Logar como Fabiano com a senha temporária
3. Criar 1 cliente (empresa), 1 máquina, 1 usuário mecânico
4. Logar como mecânico → ver dashboard placeholder
5. Acessar `/portal/admin/_test-email` → enviar email pra você → confirmar chegada
6. Deslogar mecânico, voltar como admin, desativar conta do mecânico (toggle ativo), tentar logar como mecânico → deve dar "Conta desativada"

## CI (GitHub Actions)

A spec prevê CI rodando testes RLS estruturais antes de qualquer merge. Implementação fica pra task futura — adicionar quando criar fluxo de PRs.

Quando criar: usar um projeto Supabase dedicado a CI (separado de dev/prod), aplicar migrations no início do workflow, rodar `npm test`, e zerar dados no final (via `wipeAll()`).

---

## Fatia 2 — Bucket Storage `signatures`

Criar bucket manualmente no painel Supabase (uma vez por projeto):

1. Painel → **Storage** → "New bucket"
2. Nome: `signatures`
3. Public: **OFF** (privado)
4. File size limit: **200 KB**
5. Allowed MIME types: `image/png`
6. **Sem policies** — acesso intermediado por server actions usando service role (`lib/supabase/admin.ts`)

Estrutura de paths: `signatures/<report_id>/cliente.png` (upsert quando mecânico coleta nova assinatura).

## Fatia 2 — Variáveis de ambiente novas

`.env.local` e Vercel (preview + production):

```
SITE_URL=https://fabianobratti.com   # localhost:3000 em dev
```

Usada nos emails transactionais pra montar link absoluto pro relatório (`${SITE_URL}/portal/admin/relatorios/<id>`).
