# Refatoração do site Fabiano Bratti Empilhadeiras para Next.js

**Data:** 2026-05-27
**Autor:** Evandro + Claude (sessão de brainstorming)
**Status:** Aprovado para implementação

## Contexto

O site atual (`fabianobratti.com`) é um conjunto de páginas HTML/CSS/JS estáticas, hospedado no GitHub Pages, que serve como catálogo da empresa **Fabiano Bratti Empilhadeiras**, revendedora de empilhadeiras e equipamentos de construção civil no Vale do Itajaí. A estrutura atual tem:

- Home com hero (vídeo), grid de produtos, seção de reviews, footer com contato
- Páginas índice: `empilhadeiras.html`, `construcao-civil.html`, `contato.html`
- Páginas de produto: GLP, Diesel, Elétricas / Carregadeiras, Escavadeiras, Retroescavadeiras, Rolo Compactador, Trator Esteira
- Integrações externas: Google Analytics (`G-SZ721W5TLQ`), Glassix WhatsApp Widget, Elfsight Reviews
- Identidade visual: amarelo `#ffe34b` + preto, fontes Bebas Neue + Roboto

A refatoração tem dois objetivos:

1. **Modernizar o site público** (catálogo) — migrar para Next.js, melhorar design, manter conteúdo
2. **Adicionar uma área do cliente** (portal de manutenção, apenas mock) — para clientes acompanharem relatórios de manutenção das empilhadeiras que possuem com a empresa

Hospedagem alvo: **Vercel**, mantendo domínio `fabianobratti.com`.

## Objetivos

- Site público modernizado mantendo identidade reconhecível mas elevando posicionamento (mercado premium B2B)
- Estrutura escalável: adicionar/editar produtos sem mexer em código de UI
- Área do cliente funcional como mock visual (sem backend real ainda), preparada para receber lógica real depois
- Deploy contínuo na Vercel, performance e SEO superiores ao site atual

## Não-objetivos

- Sistema real de autenticação (será mock)
- Backend ou banco de dados (dados mock estáticos no front)
- Implementação completa do relatório de manutenção (campos exatos serão definidos depois — estrutura flexível)
- CMS headless (produtos serão arquivos TypeScript versionados em git)
- E-commerce com checkout (continua sendo catálogo + orçamento por WhatsApp)
- Internacionalização (apenas português)

## Stack técnica

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 15+ (App Router)** | RSC, streaming, route groups, melhor DX |
| Linguagem | **TypeScript** estrito | Tipagem em produtos e dados mock evita bugs |
| Estilização | **Tailwind CSS** | Consistência via design tokens, dev rápido |
| Componentes UI | **shadcn/ui** | Componentes Radix + Tailwind, acessíveis, customizáveis |
| Fontes | `next/font/google` (Inter, Space Grotesk, JetBrains Mono) | Variable fonts otimizadas, sem CLS |
| Imagens | `next/image` | WebP/AVIF automático, lazy loading |
| Deploy | **Vercel** | CI/CD nativo Next.js, edge cache, preview deploys |
| Auth (mock) | Context + `localStorage` | Sem dependência de NextAuth ainda |

## Arquitetura

### Route groups

Um único app Next.js separando público e portal via route groups (parênteses no path = não geram segmento de URL):

```
app/
├── (public)/
│   ├── layout.tsx                    ← header + footer públicos
│   ├── page.tsx                      ← home
│   ├── empilhadeiras/
│   │   ├── page.tsx                  ← índice de empilhadeiras
│   │   └── [slug]/page.tsx           ← GLP, Diesel, Elétricas (dinâmico)
│   ├── construcao-civil/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx           ← Carregadeiras, Escavadeiras, etc.
│   └── contato/page.tsx
├── (portal)/
│   ├── login/page.tsx                ← sem sidebar (usa só layout root)
│   └── portal/
│       ├── layout.tsx                ← sidebar + topbar + verifica auth mock
│       └── page.tsx                  ← dashboard único com lista de manutenções
└── layout.tsx                        ← root: fontes, GA, providers
```

**URLs resultantes:**

| URL | Origem |
|---|---|
| `/` | `app/(public)/page.tsx` |
| `/empilhadeiras` | `app/(public)/empilhadeiras/page.tsx` |
| `/empilhadeiras/glp` | `app/(public)/empilhadeiras/[slug]/page.tsx` |
| `/construcao-civil/escavadeiras` | `app/(public)/construcao-civil/[slug]/page.tsx` |
| `/contato` | `app/(public)/contato/page.tsx` |
| `/login` | `app/(portal)/login/page.tsx` |
| `/portal` | `app/(portal)/portal/page.tsx` |

### Estrutura de pastas

```
forklift/
├── app/                       ← rotas (acima)
├── components/
│   ├── ui/                    ← shadcn/ui primitives
│   ├── public/                ← Header, Footer, Hero, ProductGrid, ProductCard, ContactForm
│   ├── portal/                ← Sidebar, Topbar, MaintenanceCard, MaintenanceDialog
│   └── shared/                ← Logo, WhatsAppWidget, ReviewsWidget, GAScript
├── data/
│   ├── produtos.ts            ← catálogo tipado (todas empilhadeiras + construção civil)
│   └── mock/
│       ├── cliente.ts         ← cliente fake logado
│       └── manutencoes.ts     ← array de manutenções mock
├── lib/
│   ├── auth-mock.ts           ← funções login/logout/getCurrentUser via localStorage
│   ├── types.ts               ← Produto, Categoria, Manutencao, Equipamento, Cliente
│   └── utils.ts               ← cn() do shadcn, formatadores (data, moeda)
├── public/
│   ├── images/                ← fotos de produtos (migradas de assets/)
│   ├── videos/                ← hero-video.mp4, glp.mp4
│   ├── logo.png
│   └── favicon.png
├── docs/
│   └── superpowers/specs/     ← este documento
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json            ← config shadcn/ui
├── package.json
└── CNAME                      ← removido após deploy Vercel
```

## Modelo de dados

### Produto (catálogo público)

```ts
// lib/types.ts
export type CategoriaPai = 'empilhadeiras' | 'construcao-civil';

export interface Produto {
  slug: string;                  // 'glp', 'escavadeiras'
  categoriaPai: CategoriaPai;
  nome: string;                  // 'Empilhadeira GLP'
  titulo: string;                // hero: 'POTÊNCIA E ROBUSTEZ PARA DESAFIOS'
  descricao: string;             // parágrafo do hero
  imagemCapa: string;            // '/images/glp.jpg' (para a grid)
  imagensGaleria: string[];      // fotos da página de detalhe
  videoUrl?: string;             // opcional, ex: '/videos/glp.mp4'
  specs?: { label: string; valor: string }[]; // tabela de specs
  variantes?: { nome: string; capacidade: string }[]; // ex: GLP 2.5T, GLP 3T 3.5T
}
```

Arquivo `data/produtos.ts` exporta `PRODUTOS: Produto[]` com todas as 8 entradas atuais. Páginas dinâmicas (`[slug]`) usam `generateStaticParams` para pré-renderizar todas em build.

### Dados mock do portal

```ts
export interface Cliente {
  id: string;
  nomeEmpresa: string;          // 'SN Logística LTDA'
  emailContato: string;
  cnpj: string;
}

export interface Equipamento {
  id: string;
  clienteId: string;
  modelo: string;               // 'Empilhadeira GLP 2.5T'
  serie: string;
  horimetro: number;
  imagem?: string;
}

export type StatusManutencao = 'concluida' | 'em_andamento' | 'agendada';
export type TipoManutencao = 'preventiva' | 'corretiva';

export interface Manutencao {
  id: string;
  equipamentoId: string;
  data: string;                 // ISO
  tipo: TipoManutencao;
  tecnico: string;
  descricao: string;
  status: StatusManutencao;
  horimetroNaData?: number;
  pecasTrocadas?: { nome: string; quantidade: number }[];
  proximaSugerida?: string;     // ISO
  custo?: number;               // BRL
}
```

`data/mock/cliente.ts` → 1 cliente fake (`SN Logística LTDA`, 4-6 equipamentos).
`data/mock/manutencoes.ts` → ~15 manutenções distribuídas no tempo (algumas concluídas, 1-2 em andamento, 2-3 agendadas futuras).

## Design system

### Direção visual: Premium Industrial

Sofisticado, denso, editorial. Amarelo como detalhe estratégico (CTAs, números, bordas) e não como cor dominante. Foco em fotografia de produto, tipografia editorial e muito espaço em branco/preto.

### Paleta de cores (Tailwind tokens)

```ts
// tailwind.config.ts (extend.colors)
{
  brand: {
    yellow: '#FFE34B',
    yellowDim: '#D4BC32',
  },
  ink: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    300: '#888888',
    500: '#555555',
    700: '#1F1F1F',
    900: '#111111',
    950: '#0A0A0A',
  }
}
```

Dark mode habilitado (`darkMode: 'class'`) — portal usa `dark` por padrão, público alterna seções claras e escuras.

### Tipografia

| Uso | Fonte | Pesos |
|---|---|---|
| UI, body, navegação | **Inter** (variable) | 400, 500, 600, 800 |
| Hero, títulos display, h1/h2 | **Space Grotesk** (variable) | 400, 600, 700 |
| Números técnicos (specs, horímetro, série) | **JetBrains Mono** | 400, 600 |

Escala:
- `text-display`: 72px / 1.0 / `-0.04em`
- `text-h1`: 56px / 1.05 / `-0.03em`
- `text-h2`: 36px / 1.1 / `-0.02em`
- `text-h3`: 24px / 1.2 / `-0.01em`
- `text-body`: 16px / 1.6 / `0`
- `text-small`: 13px / 1.5 / `0`
- `text-label`: 12px / 1 / `0.15em` (uppercase)

### Princípios visuais

- Padding generoso: seções com altura mínima ~600px, container max-width 1280px
- Bordas finas (`border-ink-700` no dark, `border-ink-100` no light) em vez de sombras pesadas
- Animações sutis com `framer-motion`: fade-in on scroll, hover discreto (escala 1.02)
- Labels uppercase com tracking grande em ganchos de seção (`— PRODUTOS / 01`)
- Imagens dominam a composição; texto se posiciona em torno delas

## Telas do site público

### Home (`/`)

1. **Header sticky** com fundo translúcido + blur. Logo à esquerda, nav à direita: Início, Empilhadeiras, Construção Civil, Contato + botão "Área do Cliente" destacado
2. **Hero full-screen** (90vh):
   - Vídeo de fundo (mantido, mas com overlay gradiente preto)
   - Título display em Space Grotesk: "Produtividade sem compromissos."
   - Subtítulo curto + 2 CTAs (Ver equipamentos / Falar pelo WhatsApp)
   - Label "— Forklift Solutions" no topo
3. **Seção Produtos** com label "— CATÁLOGO / 01" + título "Nossos equipamentos":
   - Grid de 8 cards (4 cols desktop, 2 tablet, 1 mobile)
   - Cada card: imagem + nome + categoria + ícone seta hover
4. **Seção destaque** (atual "EMPILHADEIRA GLP"):
   - Layout side-by-side: vídeo + texto editorial
   - CTA pra página da GLP
5. **Reviews Elfsight** (mantido, container redesenhado)
6. **Footer** escuro com 3 colunas:
   - Coluna 1: Logo + descrição curta + ícones sociais
   - Coluna 2: Links rápidos (Empilhadeiras, Construção Civil, Contato, Área do Cliente)
   - Coluna 3: Contato (telefone, WhatsApp, endereço, horário)
   - Linha de baixo: copyright + créditos

### Índice de categoria (`/empilhadeiras`, `/construcao-civil`)

- Hero menor (50vh) com título + descrição da categoria
- Grid dos produtos daquela categoria (mesmo componente da home)

### Produto (`/empilhadeiras/[slug]`, `/construcao-civil/[slug]`)

- Hero: imagem do produto + título + descrição (lado a lado)
- Galeria de fotos (se houver, carrossel)
- Tabela de specs (se houver)
- Variantes em cards (ex: GLP 2.5T, GLP 3T 3.5T)
- CTA fixo: "Solicitar Orçamento" → abre WhatsApp pré-preenchido com nome do produto

### Contato (`/contato`)

- Hero curto
- Layout 2 colunas: form (nome, email, telefone, mensagem — mock, não envia) + dados (telefone, WhatsApp, endereço, mapa estático)

## Área do cliente (portal de manutenção)

### Login (`/login`)

- Tela centralizada, fundo escuro
- Logo no topo
- Card com form (email + senha) + botão "Entrar"
- Botão secundário "Logar como demo" (preenche e submete sozinho)
- Qualquer email/senha entra. Auth mock salva flag em localStorage e nome do cliente fake
- Sem registro, sem "esqueci senha" (mock)

### Portal (`/portal`)

**Layout:**
- Sidebar fixa à esquerda (240px): logo no topo + 1 item de nav ("Manutenções" — link para `/portal`, ativo por padrão) + área de perfil no rodapé (avatar + nome empresa + botão logout que limpa localStorage e volta para `/login`)
- Topbar fina: breadcrumb à esquerda, sino notificações (visual mock) e avatar à direita
- Conteúdo principal: dashboard único

**Conteúdo:**
1. Saudação: "Olá, **SN Logística LTDA**"
2. 3-4 cards de métricas (KPIs):
   - Equipamentos ativos
   - Manutenções no mês
   - Próxima agendada (data + equipamento)
   - Pendentes
3. Seção "Manutenções recentes" — lista de cards:
   - Cada card: data, equipamento, tipo (badge), técnico, status (badge colorido)
   - Hover: leve elevação + outline amarelo
   - Click → abre **Dialog** (modal shadcn) com detalhes da manutenção: descrição completa, peças trocadas (tabela), horímetro, próxima sugerida, custo formatado em BRL, botão "Baixar PDF" (mock: `alert('PDF mock — será implementado depois')`)

**Proteção de rota:** `app/(portal)/portal/layout.tsx` verifica auth-mock (lê flag do localStorage no client); se não autenticado, redireciona para `/login`. Como a verificação é via localStorage, a checagem precisa rodar em componente client (`'use client'`) usando `useEffect` + `router.replace('/login')`.

### Fora do escopo (preparado para evoluir)

A sidebar começa com 1 item, mas o layout suporta adicionar items futuros sem retrabalho. Estruturas de Equipamento e Cliente já tipadas — quando o cliente decidir o que mais entra no portal (frota detalhada, perfil editável, documentos), é só criar novas rotas dentro de `(portal)/portal/`.

## Integrações preservadas

- **Google Analytics** (`G-SZ721W5TLQ`): componente `<GAScript />` no `app/layout.tsx` (root). Não carrega em `/portal/*` para evitar tracking em área autenticada
- **Glassix WhatsApp Widget**: componente client-side `<WhatsAppWidget />` carregado apenas no layout `(public)` (não no portal nem no login)
- **Elfsight Reviews**: componente client-side `<ReviewsWidget />` usado apenas na home

Todos com `next/script` estratégia `afterInteractive` ou `lazyOnload` para não bloquear render.

## SEO e acessibilidade

- `metadata` por página usando Next 15 Metadata API (title, description, OG image)
- Schema.org JSON-LD para produtos (`Product` type) em páginas de detalhe
- `sitemap.ts` e `robots.ts` gerados automaticamente
- Imagens com `alt` descritivo (migrado de cada `<img>` atual)
- Foco visível em todos interativos
- Navegação por teclado funcional em sidebar e dialogs
- `prefers-reduced-motion` respeitado nas animações
- Lighthouse alvo: ≥ 90 em Performance, Accessibility, Best Practices, SEO

## Migração de assets

| Origem | Destino | Tratamento |
|---|---|---|
| `assets/*.jpeg`, `*.webp`, `*.png` | `public/images/` | Renomear para slugs claros (ex: `1.jpeg` → `empilhadeira-glp.jpeg`); converter para WebP via `next/image` em runtime |
| `assets/hero-video.mp4`, `glp.mp4`, `video.mp4` | `public/videos/` | Mantidos como MP4 |
| `assets/favicon.png` | `app/favicon.png` (auto-detectado pelo Next) | Mantido |
| `assets/logo.png` | `public/logo.png` | Mantido |
| `css/*.css`, `paginas/style.css`, `js/index.js` | — | Descartados (substituídos por Tailwind/componentes) |
| `paginas/**/*.html`, `index.html`, `paginas/**/`, `css/`, `js/`, `paginas/` | — | Removidos após migração validada |
| `CNAME` | — | Removido após domínio configurado na Vercel |
| `README.md` | atualizar com novas instruções de dev/build/deploy | |

## Deploy

- **Vercel** conectado ao repositório GitHub (branch `main` → produção; branches → preview)
- Domínio `fabianobratti.com` movido para Vercel (DNS apontando para Vercel após validar o app)
- Variáveis de ambiente: nenhuma necessária para mock. Quando vier auth real, adicionar `NEXTAUTH_SECRET`, `DATABASE_URL`, etc.
- `vercel.json` opcional (configs padrão Next.js funcionam)

## Critérios de sucesso

- [ ] Todas as páginas do site atual têm equivalente no novo (sem perda de conteúdo)
- [ ] Site público segue direção visual "Premium Industrial" aprovada
- [ ] Área do cliente acessível em `/login` → `/portal`, com mock funcional (entra com qualquer credencial)
- [ ] Lighthouse ≥ 90 em todas as métricas principais
- [ ] Build sem warnings de TypeScript
- [ ] Deploy em Vercel funcional com domínio `fabianobratti.com`
- [ ] Google Analytics rastreando público (não rastreando portal)
- [ ] WhatsApp widget aparece no público (não no portal)
- [ ] Reviews Elfsight aparece na home
- [ ] Todos os assets atuais migrados, arquivos antigos deletados

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Mudança de hosting (GH Pages → Vercel) interrompe domínio | Configurar Vercel + validar app em URL temporária antes de mover DNS |
| Cliente final estranha o redesign (Premium Industrial é bem diferente do atual) | Manter amarelo + preto reconhecíveis; entregar preview para aprovação antes de DNS |
| Dados mock do portal acabam parecendo "real" e confundindo | Banner ou texto "Modo demonstração" visível no portal |
| Vídeos pesados degradam Lighthouse | `preload="metadata"`, posters, considerar reduzir resolução/bitrate dos MP4s |
| Refator longo e perda de SEO durante migração | Migrar branch separada, testar URLs equivalentes, redirects 301 se URLs mudarem (não devem mudar muito) |

## Próximos passos

Plano de implementação detalhado será criado pela skill `writing-plans` após aprovação deste design.
