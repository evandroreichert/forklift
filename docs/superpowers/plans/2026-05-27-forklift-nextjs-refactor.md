# Forklift Next.js Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the static HTML/CSS forklift catalog site to a modern Next.js 15 application with App Router, add a mock maintenance portal client area, implement comprehensive local SEO targeting Itajaí-region cities, and deploy to Vercel.

**Architecture:** Single Next.js 15 app using App Router with two route groups: `(public)` for the catalog/SEO landings and `(portal)` for the mock client area. Catalog data lives in typed TypeScript files (`data/produtos.ts`, `data/cidades.ts`). SEO infrastructure centralized in `lib/seo.ts` with helpers for metadata and JSON-LD. Mock auth uses `localStorage` + React Context.

**Tech Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui · Inter + Space Grotesk + JetBrains Mono (next/font) · Vercel.

**Spec:** `docs/superpowers/specs/2026-05-27-forklift-nextjs-refactor-design.md`

---

## Pre-flight

Existing files in repo: `index.html`, `paginas/`, `css/`, `js/`, `assets/`, `CNAME`, `README.md`. **Do not delete them until Task 30.** The new Next.js project will be initialized in the same directory and coexist until cleanup.

Work happens directly on `main` per user preference (existing flow: small commits to main, e.g. `0cfc2c8`, `bc91228`).

---

## Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`

- [ ] **Step 1: Run `create-next-app` in current directory**

Run from project root:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*" --no-turbopack --use-npm
```

When prompted "Would you like to customize the default import alias?", accept `@/*`. If asked about existing files, answer **yes** to proceed (it will not overwrite `index.html`, `paginas/`, `css/`, `js/`, `assets/`, `CNAME`, `README.md`, `.gitignore`, `docs/`).

- [ ] **Step 2: Verify install succeeded**

Run: `npm run build`
Expected: Build completes with default page; no TypeScript errors.

- [ ] **Step 3: Set TypeScript strict mode**

Open `tsconfig.json` and ensure:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "paginas", "css", "js"]
}
```

- [ ] **Step 4: Replace default `app/page.tsx` and `app/layout.tsx` with placeholders**

Replace `app/page.tsx`:
```tsx
export default function Home() {
  return <main className="p-8">Forklift site — under construction</main>;
}
```

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fabiano Bratti Empilhadeiras',
  description: 'Empilhadeiras e equipamentos para construção civil — Vale do Itajaí',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Verify dev server runs**

Run: `npm run dev`
Expected: Server starts on `http://localhost:3000`, page shows "Forklift site — under construction". Ctrl+C to stop.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json next-env.d.ts postcss.config.mjs tailwind.config.ts eslint.config.mjs app/ public/
git commit -m "chore: inicializa projeto Next.js 15 com TypeScript estrito"
```

---

## Task 2: Configure Tailwind tokens and global styles

**Files:**
- Modify: `tailwind.config.ts`, `app/globals.css`

- [ ] **Step 1: Write `tailwind.config.ts`**

Replace `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        brand: {
          yellow: '#FFE34B',
          'yellow-dim': '#D4BC32',
        },
        ink: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          300: '#888888',
          500: '#555555',
          700: '#1F1F1F',
          900: '#111111',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['72px', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
        h1: ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        h2: ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h3: ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        body: ['16px', { lineHeight: '1.6' }],
        small: ['13px', { lineHeight: '1.5' }],
        label: ['12px', { lineHeight: '1', letterSpacing: '0.15em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Write `app/globals.css`**

Replace `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-ink-950 text-ink-50 font-sans antialiased;
  }
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-brand-yellow;
  }
  ::selection {
    @apply bg-brand-yellow text-ink-950;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer utilities {
  .container-tight {
    @apply mx-auto max-w-6xl px-6;
  }
  .container-wide {
    @apply mx-auto max-w-7xl px-6;
  }
  .label-tracked {
    @apply text-label uppercase font-medium text-ink-300;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds, no Tailwind errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: define tokens de design (cores, tipografia, escala)"
```

---

## Task 3: Install fonts and update root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write root layout with next/font**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fabianobratti.com'),
  title: {
    default: 'Fabiano Bratti Empilhadeiras — Vale do Itajaí',
    template: '%s | Fabiano Bratti Empilhadeiras',
  },
  description:
    'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: adiciona fontes Inter, Space Grotesk e JetBrains Mono"
```

---

## Task 4: Install and configure shadcn/ui

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/*`

- [ ] **Step 1: Initialize shadcn/ui**

Run: `npx shadcn@latest init`

Choose:
- Style: **Default**
- Base color: **Neutral** (we override with custom tokens)
- CSS variables: **Yes**

Accept defaults for other prompts. This creates `components.json` and `lib/utils.ts`.

- [ ] **Step 2: Override `lib/utils.ts`**

Replace `lib/utils.ts`:
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
```

- [ ] **Step 3: Add required shadcn components**

Run:
```bash
npx shadcn@latest add button card dialog badge avatar dropdown-menu input label table accordion sheet
```

Accept all prompts.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. `components/ui/` populated.

- [ ] **Step 5: Commit**

```bash
git add components.json lib/utils.ts components/ui/ package.json package-lock.json
git commit -m "feat: configura shadcn/ui e formatadores BRL/data"
```

---

## Task 5: Define core types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write `lib/types.ts`**

Create `lib/types.ts`:
```ts
export type CategoriaPai = 'empilhadeiras' | 'construcao-civil';

export interface ProdutoSpec {
  label: string;
  valor: string;
}

export interface ProdutoVariante {
  nome: string;
  capacidade: string;
}

export interface Produto {
  slug: string;
  categoriaPai: CategoriaPai;
  nome: string;
  titulo: string;
  descricao: string;
  imagemCapa: string;
  imagensGaleria: string[];
  videoUrl?: string;
  specs?: ProdutoSpec[];
  variantes?: ProdutoVariante[];
}

export interface Cidade {
  slug: string;
  nome: string;
  nomeCompleto: string;
  uf: string;
  descricaoEconomica: string;
  tempoAtendimentoEstimado: string;
}

export interface FAQItem {
  pergunta: string;
  resposta: string;
}

export interface Cliente {
  id: string;
  nomeEmpresa: string;
  emailContato: string;
  cnpj: string;
}

export interface Equipamento {
  id: string;
  clienteId: string;
  modelo: string;
  serie: string;
  horimetro: number;
  imagem?: string;
}

export type StatusManutencao = 'concluida' | 'em_andamento' | 'agendada';
export type TipoManutencao = 'preventiva' | 'corretiva';

export interface PecaTrocada {
  nome: string;
  quantidade: number;
}

export interface Manutencao {
  id: string;
  equipamentoId: string;
  data: string;
  tipo: TipoManutencao;
  tecnico: string;
  descricao: string;
  status: StatusManutencao;
  horimetroNaData?: number;
  pecasTrocadas?: PecaTrocada[];
  proximaSugerida?: string;
  custo?: number;
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: define tipos de Produto, Cidade, Cliente, Equipamento, Manutencao"
```

---

## Task 6: Create product catalog data

**Files:**
- Create: `data/produtos.ts`

- [ ] **Step 1: Write `data/produtos.ts`**

Create `data/produtos.ts`:
```ts
import type { Produto } from '@/lib/types';

export const PRODUTOS: Produto[] = [
  {
    slug: 'glp',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira GLP',
    titulo: 'Potência e robustez para desafios',
    descricao:
      'Desempenho é a chave. A Empilhadeira GLP da UN Forklift é a resposta quando a demanda é alta. Enfrentando tarefas complexas e difíceis, este equipamento está pronto para superar obstáculos e elevar sua produtividade.',
    imagemCapa: '/images/empilhadeira-glp.jpeg',
    imagensGaleria: ['/images/empilhadeira-glp.jpeg'],
    videoUrl: '/videos/glp.mp4',
    variantes: [
      { nome: 'GLP 2.5T', capacidade: '2.500 kg' },
      { nome: 'GLP 3T - 3.5T', capacidade: '3.000 - 3.500 kg' },
    ],
  },
  {
    slug: 'diesel',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira Diesel',
    titulo: 'Força e autonomia para operações intensas',
    descricao:
      'Empilhadeiras Diesel da UN Forklift entregam alta capacidade de carga, torque robusto e autonomia para operações contínuas em ambientes externos e de uso pesado.',
    imagemCapa: '/images/empilhadeira-diesel.jpeg',
    imagensGaleria: ['/images/empilhadeira-diesel.jpeg', '/images/empilhadeira-diesel-2.webp'],
  },
  {
    slug: 'eletricas',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira Elétrica',
    titulo: 'Silenciosa, limpa e eficiente',
    descricao:
      'Linha elétrica com baterias de lítio para operações internas. Zero emissões, baixo nível de ruído e excelente custo operacional. Ideal para armazéns e indústrias.',
    imagemCapa: '/images/empilhadeira-eletrica.jpeg',
    imagensGaleria: ['/images/empilhadeira-eletrica.jpeg', '/images/empilhadeira-eletrica-2.webp'],
  },
  {
    slug: 'carregadeiras',
    categoriaPai: 'construcao-civil',
    nome: 'Carregadeiras',
    titulo: 'Produtividade em movimentação de materiais',
    descricao:
      'Carregadeiras para obras de construção civil, mineração e movimentação de granéis. Robustas, ágeis e com excelente capacidade de carga.',
    imagemCapa: '/images/carregadeira.jpeg',
    imagensGaleria: ['/images/carregadeira.jpeg'],
  },
  {
    slug: 'escavadeiras',
    categoriaPai: 'construcao-civil',
    nome: 'Escavadeiras Hidráulicas',
    titulo: 'Potência hidráulica para escavações exigentes',
    descricao:
      'Escavadeiras hidráulicas para terraplanagem, mineração e construção pesada. Alcance, força e precisão para os trabalhos mais desafiadores.',
    imagemCapa: '/images/escavadeira.jpeg',
    imagensGaleria: ['/images/escavadeira.jpeg'],
  },
  {
    slug: 'retroescavadeiras',
    categoriaPai: 'construcao-civil',
    nome: 'Retroescavadeiras',
    titulo: 'Versatilidade para todo tipo de obra',
    descricao:
      'Retroescavadeiras combinam carregadeira frontal e escavadeira traseira em um único equipamento. Solução econômica e versátil para obras urbanas e rurais.',
    imagemCapa: '/images/retroescavadeira.jpeg',
    imagensGaleria: ['/images/retroescavadeira.jpeg'],
  },
  {
    slug: 'rolo-compactador',
    categoriaPai: 'construcao-civil',
    nome: 'Rolo Compactador',
    titulo: 'Compactação eficiente para pavimentação',
    descricao:
      'Rolos compactadores para asfalto, solo e bases. Modelos vibratórios com diferentes pesos para diferentes necessidades de compactação.',
    imagemCapa: '/images/rolo-compactador.jpeg',
    imagensGaleria: ['/images/rolo-compactador.jpeg'],
  },
  {
    slug: 'trator-esteira',
    categoriaPai: 'construcao-civil',
    nome: 'Trator de Esteira',
    titulo: 'Força bruta para terrenos exigentes',
    descricao:
      'Tratores de esteira (bulldozers) para terraplanagem pesada, empurramento de grandes volumes e operação em terrenos irregulares.',
    imagemCapa: '/images/trator-esteira.jpeg',
    imagensGaleria: ['/images/trator-esteira.jpeg'],
  },
];

export function getProdutoBySlug(slug: string): Produto | undefined {
  return PRODUTOS.find((p) => p.slug === slug);
}

export function getProdutosByCategoria(categoria: 'empilhadeiras' | 'construcao-civil'): Produto[] {
  return PRODUTOS.filter((p) => p.categoriaPai === categoria);
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add data/produtos.ts
git commit -m "feat: cria catálogo de produtos tipado"
```

---

## Task 7: Create cities and FAQ data

**Files:**
- Create: `data/cidades.ts`, `data/faq.ts`

- [ ] **Step 1: Write `data/cidades.ts`**

Create `data/cidades.ts`:
```ts
import type { Cidade } from '@/lib/types';

export const CIDADES: Cidade[] = [
  {
    slug: 'itajai',
    nome: 'Itajaí',
    nomeCompleto: 'Itajaí',
    uf: 'SC',
    descricaoEconomica:
      'Sede de um dos maiores portos do Brasil, Itajaí concentra operações logísticas, indústrias de pesca, transporte e distribuição. Empilhadeiras e equipamentos de movimentação são essenciais para a operação portuária, armazéns alfandegados e centros de distribuição da cidade.',
    tempoAtendimentoEstimado: 'até 2 horas',
  },
  {
    slug: 'balneario-camboriu',
    nome: 'Balneário Camboriú',
    nomeCompleto: 'Balneário Camboriú',
    uf: 'SC',
    descricaoEconomica:
      'Polo turístico e comercial com forte demanda hoteleira, gastronomia e construção civil de alto padrão. Obras de torres, hotéis e empreendimentos comerciais demandam equipamentos pesados e empilhadeiras para movimentação de cargas e materiais.',
    tempoAtendimentoEstimado: 'até 2 horas',
  },
  {
    slug: 'camboriu',
    nome: 'Camboriú',
    nomeCompleto: 'Camboriú',
    uf: 'SC',
    descricaoEconomica:
      'Cidade vizinha de Balneário Camboriú com forte expansão industrial e logística. Distritos industriais, atacadistas e operações de transporte dependem de empilhadeiras para movimentação eficiente de produtos.',
    tempoAtendimentoEstimado: 'até 2 horas',
  },
  {
    slug: 'navegantes',
    nome: 'Navegantes',
    nomeCompleto: 'Navegantes',
    uf: 'SC',
    descricaoEconomica:
      'Lar de aeroporto regional e porto privado, Navegantes é hub de logística aérea e marítima. Operações de cargo, armazéns aeroportuários e estaleiros utilizam empilhadeiras de diversos portes diariamente.',
    tempoAtendimentoEstimado: 'até 2 horas',
  },
  {
    slug: 'penha',
    nome: 'Penha',
    nomeCompleto: 'Penha',
    uf: 'SC',
    descricaoEconomica:
      'Cidade litorânea com economia ligada ao turismo (Beto Carrero World) e pesca. Hotelaria, parques e indústria pesqueira utilizam empilhadeiras para movimentação de cargas e operações de manutenção sazonal.',
    tempoAtendimentoEstimado: 'até 3 horas',
  },
  {
    slug: 'balneario-picarras',
    nome: 'Balneário Piçarras',
    nomeCompleto: 'Balneário Piçarras',
    uf: 'SC',
    descricaoEconomica:
      'Município litorâneo em crescimento com forte demanda da construção civil, comércio local e operações sazonais. Empilhadeiras suportam obras, estoques de varejo e atividades industriais leves.',
    tempoAtendimentoEstimado: 'até 3 horas',
  },
  {
    slug: 'itapema',
    nome: 'Itapema',
    nomeCompleto: 'Itapema',
    uf: 'SC',
    descricaoEconomica:
      'Cidade em forte expansão imobiliária com obras de torres residenciais de alto padrão e demanda crescente por movimentação de materiais. Construtoras e comércio local utilizam empilhadeiras para diversas operações.',
    tempoAtendimentoEstimado: 'até 2 horas',
  },
  {
    slug: 'bombinhas',
    nome: 'Bombinhas',
    nomeCompleto: 'Bombinhas',
    uf: 'SC',
    descricaoEconomica:
      'Destino turístico com economia ligada a pousadas, restaurantes e pesca. Atendemos hotelaria, comércio e operações de manutenção com empilhadeiras compactas e equipamentos para construção civil leve.',
    tempoAtendimentoEstimado: 'até 3 horas',
  },
  {
    slug: 'porto-belo',
    nome: 'Porto Belo',
    nomeCompleto: 'Porto Belo',
    uf: 'SC',
    descricaoEconomica:
      'Cidade litorânea com terminal portuário e turismo de cruzeiros. Operações portuárias, hotelaria e construção civil utilizam empilhadeiras e equipamentos pesados de forma intensa em temporada.',
    tempoAtendimentoEstimado: 'até 3 horas',
  },
];

export function getCidadeBySlug(slug: string): Cidade | undefined {
  return CIDADES.find((c) => c.slug === slug);
}
```

- [ ] **Step 2: Write `data/faq.ts`**

Create `data/faq.ts`:
```ts
import type { FAQItem } from '@/lib/types';

export const FAQ_MANUTENCAO: FAQItem[] = [
  {
    pergunta: 'Quais marcas de empilhadeira vocês fazem manutenção?',
    resposta:
      'Atendemos as principais marcas do mercado, incluindo Toyota, Hyster, Yale, Still, Linde, Hyundai, UN Forklift e outras. Entre em contato pelo WhatsApp informando o modelo do seu equipamento para confirmar.',
  },
  {
    pergunta: 'Vocês fazem manutenção preventiva e corretiva?',
    resposta:
      'Sim. Oferecemos manutenção preventiva (planos periódicos com revisões agendadas), manutenção corretiva (reparo de falhas e quebras) e atendimento emergencial em casos de parada inesperada.',
  },
  {
    pergunta: 'Qual o tempo médio de atendimento?',
    resposta:
      'Em Itajaí, Navegantes, Balneário Camboriú e Camboriú o atendimento é em até 2 horas. Em Penha, Piçarras, Bombinhas e Porto Belo, em até 3 horas. Casos emergenciais têm prioridade.',
  },
  {
    pergunta: 'Vocês usam peças originais?',
    resposta:
      'Sim. Trabalhamos com peças originais ou homologadas pelo fabricante. Em casos específicos, podemos sugerir peças paralelas certificadas, sempre com aprovação do cliente.',
  },
  {
    pergunta: 'Como solicitar uma manutenção?',
    resposta:
      'A forma mais rápida é pelo WhatsApp. Clientes já cadastrados também podem acompanhar o histórico de manutenções da frota pela área do cliente neste site.',
  },
  {
    pergunta: 'Vocês atendem fora da região de Itajaí?',
    resposta:
      'Nosso atendimento principal é o litoral norte de Santa Catarina. Para outras regiões, entre em contato para avaliarmos a viabilidade.',
  },
];
```

- [ ] **Step 3: Verify type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add data/cidades.ts data/faq.ts
git commit -m "feat: cria dados de cidades atendidas e FAQ de manutenção"
```

---

## Task 8: Create mock portal data

**Files:**
- Create: `data/mock/cliente.ts`, `data/mock/equipamentos.ts`, `data/mock/manutencoes.ts`

- [ ] **Step 1: Write `data/mock/cliente.ts`**

Create `data/mock/cliente.ts`:
```ts
import type { Cliente } from '@/lib/types';

export const CLIENTE_DEMO: Cliente = {
  id: 'cli-001',
  nomeEmpresa: 'SN Logística LTDA',
  emailContato: 'operacoes@snlogistica.com.br',
  cnpj: '12.345.678/0001-90',
};
```

- [ ] **Step 2: Write `data/mock/equipamentos.ts`**

Create `data/mock/equipamentos.ts`:
```ts
import type { Equipamento } from '@/lib/types';

export const EQUIPAMENTOS_DEMO: Equipamento[] = [
  { id: 'eq-01', clienteId: 'cli-001', modelo: 'Empilhadeira GLP 2.5T', serie: 'GLP-2024-0142', horimetro: 1820 },
  { id: 'eq-02', clienteId: 'cli-001', modelo: 'Empilhadeira GLP 3T', serie: 'GLP-2024-0078', horimetro: 3450 },
  { id: 'eq-03', clienteId: 'cli-001', modelo: 'Empilhadeira Diesel 5T', serie: 'DSL-2023-0211', horimetro: 5210 },
  { id: 'eq-04', clienteId: 'cli-001', modelo: 'Empilhadeira Elétrica Lítio 2T', serie: 'ELE-2024-0033', horimetro: 980 },
  { id: 'eq-05', clienteId: 'cli-001', modelo: 'Empilhadeira Diesel 7T', serie: 'DSL-2022-0188', horimetro: 7320 },
];
```

- [ ] **Step 3: Write `data/mock/manutencoes.ts`**

Create `data/mock/manutencoes.ts`:
```ts
import type { Manutencao } from '@/lib/types';

export const MANUTENCOES_DEMO: Manutencao[] = [
  {
    id: 'mnt-001',
    equipamentoId: 'eq-01',
    data: '2026-05-18',
    tipo: 'preventiva',
    tecnico: 'Carlos Mendes',
    descricao: 'Revisão de 250h: troca de óleo do motor, filtros de ar e combustível, verificação de pressão hidráulica e calibragem de garfos.',
    status: 'concluida',
    horimetroNaData: 1820,
    pecasTrocadas: [
      { nome: 'Filtro de óleo', quantidade: 1 },
      { nome: 'Filtro de ar', quantidade: 1 },
      { nome: 'Filtro de combustível', quantidade: 1 },
      { nome: 'Óleo lubrificante 15W40 (4L)', quantidade: 1 },
    ],
    proximaSugerida: '2026-08-18',
    custo: 980.5,
  },
  {
    id: 'mnt-002',
    equipamentoId: 'eq-02',
    data: '2026-05-12',
    tipo: 'corretiva',
    tecnico: 'Roberto Silva',
    descricao: 'Substituição de mangueira hidráulica do sistema de elevação após relato de vazamento. Teste de pressão e ajuste de válvula.',
    status: 'concluida',
    horimetroNaData: 3422,
    pecasTrocadas: [
      { nome: 'Mangueira hidráulica 1/2" (1,2m)', quantidade: 1 },
      { nome: 'Conector cônico 90°', quantidade: 2 },
      { nome: 'Óleo hidráulico ISO 68 (5L)', quantidade: 1 },
    ],
    custo: 1450,
  },
  {
    id: 'mnt-003',
    equipamentoId: 'eq-03',
    data: '2026-05-05',
    tipo: 'preventiva',
    tecnico: 'Carlos Mendes',
    descricao: 'Revisão de 500h: troca de óleo do motor, óleo hidráulico, filtros, inspeção de freios e correntes de elevação.',
    status: 'concluida',
    horimetroNaData: 5200,
    pecasTrocadas: [
      { nome: 'Óleo do motor (8L)', quantidade: 1 },
      { nome: 'Óleo hidráulico (12L)', quantidade: 1 },
      { nome: 'Kit de filtros (ar, óleo, combustível)', quantidade: 1 },
    ],
    proximaSugerida: '2026-08-05',
    custo: 1680,
  },
  {
    id: 'mnt-004',
    equipamentoId: 'eq-04',
    data: '2026-04-28',
    tipo: 'preventiva',
    tecnico: 'Marcos Pereira',
    descricao: 'Verificação de bateria de lítio, balanceamento de células, teste de capacidade e inspeção do sistema de carga.',
    status: 'concluida',
    horimetroNaData: 950,
    pecasTrocadas: [],
    proximaSugerida: '2026-07-28',
    custo: 420,
  },
  {
    id: 'mnt-005',
    equipamentoId: 'eq-05',
    data: '2026-04-20',
    tipo: 'corretiva',
    tecnico: 'Roberto Silva',
    descricao: 'Reparo do sistema de partida — substituição do motor de arranque após falhas intermitentes.',
    status: 'concluida',
    horimetroNaData: 7290,
    pecasTrocadas: [
      { nome: 'Motor de arranque 12V', quantidade: 1 },
    ],
    custo: 2150,
  },
  {
    id: 'mnt-006',
    equipamentoId: 'eq-01',
    data: '2026-05-26',
    tipo: 'corretiva',
    tecnico: 'Carlos Mendes',
    descricao: 'Diagnóstico de ruído anormal na transmissão. Equipamento em análise — aguardando peça.',
    status: 'em_andamento',
    horimetroNaData: 1845,
  },
  {
    id: 'mnt-007',
    equipamentoId: 'eq-02',
    data: '2026-06-12',
    tipo: 'preventiva',
    tecnico: 'A definir',
    descricao: 'Revisão programada de 3.500h. Troca completa de fluidos e filtros.',
    status: 'agendada',
  },
  {
    id: 'mnt-008',
    equipamentoId: 'eq-03',
    data: '2026-06-05',
    tipo: 'preventiva',
    tecnico: 'A definir',
    descricao: 'Inspeção trimestral programada.',
    status: 'agendada',
  },
  {
    id: 'mnt-009',
    equipamentoId: 'eq-04',
    data: '2026-04-15',
    tipo: 'preventiva',
    tecnico: 'Marcos Pereira',
    descricao: 'Inspeção rotineira mensal de equipamento elétrico.',
    status: 'concluida',
    horimetroNaData: 880,
    custo: 280,
  },
  {
    id: 'mnt-010',
    equipamentoId: 'eq-05',
    data: '2026-03-22',
    tipo: 'preventiva',
    tecnico: 'Roberto Silva',
    descricao: 'Revisão semestral de 7.000h: lubrificação geral, troca de óleos e inspeção de chassi.',
    status: 'concluida',
    horimetroNaData: 7150,
    pecasTrocadas: [
      { nome: 'Óleo de motor (10L)', quantidade: 1 },
      { nome: 'Óleo de transmissão (6L)', quantidade: 1 },
    ],
    proximaSugerida: '2026-09-22',
    custo: 1320,
  },
];

export function getManutencoesByEquipamento(equipamentoId: string): Manutencao[] {
  return MANUTENCOES_DEMO.filter((m) => m.equipamentoId === equipamentoId);
}

export function getManutencoesRecentes(): Manutencao[] {
  return [...MANUTENCOES_DEMO].sort((a, b) => b.data.localeCompare(a.data));
}
```

- [ ] **Step 4: Verify type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add data/mock/
git commit -m "feat: dados mock do portal (cliente, equipamentos, manutenções)"
```

---

## Task 9: Migrate assets to public/

**Files:**
- Move: `assets/*` → `public/images/`, `public/videos/`

- [ ] **Step 1: Create target directories**

Run:
```bash
mkdir -p public/images public/videos
```

- [ ] **Step 2: List current assets**

Run: `ls assets/`
Expected: list of files (`1.jpeg`, `2.jpeg`, ..., `hero-video.mp4`, `glp.mp4`, `logo.png`, `favicon.png`, etc.)

- [ ] **Step 3: Copy and rename images to semantic slugs**

Run (use copy not move, so the old site still works until cleanup):
```bash
cp "assets/1.jpeg" "public/images/empilhadeira-glp.jpeg"
cp "assets/2.jpeg" "public/images/empilhadeira-diesel.jpeg"
cp "assets/3.jpeg" "public/images/empilhadeira-todo-terreno.jpeg"
cp "assets/4.jpeg" "public/images/empilhadeira-eletrica.jpeg"
cp "assets/5.jpeg" "public/images/carregadeira.jpeg"
cp "assets/6.jpeg" "public/images/escavadeira.jpeg"
cp "assets/7.jpeg" "public/images/trator-esteira.jpeg"
cp "assets/8.jpeg" "public/images/rolo-compactador.jpeg"
cp "assets/diesel4.webp" "public/images/empilhadeira-diesel-2.webp" 2>/dev/null || true
cp "assets/eletrica4.webp" "public/images/empilhadeira-eletrica-2.webp" 2>/dev/null || true
cp "assets/diesel.png" "public/images/empilhadeira-diesel-hero.png" 2>/dev/null || true
cp "assets/retroescavadeira.jpeg" "public/images/retroescavadeira.jpeg" 2>/dev/null || true
cp "assets/logo.png" "public/logo.png"
cp "assets/favicon.png" "app/favicon.png"
cp "assets/placeholder.png" "public/images/placeholder.png" 2>/dev/null || true
cp "assets/placeholder2.png" "public/images/placeholder2.png" 2>/dev/null || true
```

If a source file doesn't exist (e.g., `retroescavadeira.jpeg`), the command above tolerates it. After running, check with: `ls public/images/` — if `retroescavadeira.jpeg` is missing, use `empilhadeira-diesel.jpeg` as a temporary placeholder (rename in produtos.ts later).

- [ ] **Step 4: Copy videos**

Run:
```bash
cp "assets/hero-video.mp4" "public/videos/hero.mp4"
cp "assets/glp.mp4" "public/videos/glp.mp4"
cp "assets/video.mp4" "public/videos/video.mp4" 2>/dev/null || true
```

- [ ] **Step 5: If `retroescavadeira.jpeg` is missing in `public/images/`, fix produtos.ts**

Check: `ls public/images/retroescavadeira.jpeg`

If file does NOT exist, edit `data/produtos.ts` and change the `retroescavadeiras` entry's `imagemCapa` to `/images/empilhadeira-diesel.jpeg` (temporary placeholder until client provides real image). Add inline comment `// TODO: substituir por foto real de retroescavadeira` only if you change it.

- [ ] **Step 6: Configure next.config.ts for image optimization**

Replace `next.config.ts`:
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add public/ app/favicon.png next.config.ts data/produtos.ts
git commit -m "feat: migra imagens e vídeos para public/ com nomes semânticos"
```

---

## Task 10: Create SEO helpers

**Files:**
- Create: `lib/seo.ts`

- [ ] **Step 1: Write `lib/seo.ts`**

Create `lib/seo.ts`:
```ts
import type { Metadata } from 'next';

export const SITE_URL = 'https://fabianobratti.com';
export const SITE_NAME = 'Fabiano Bratti Empilhadeiras';
export const DEFAULT_DESCRIPTION =
  'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';
export const GOOGLE_BUSINESS_URL = 'https://share.google/qlJlxWgMJJtevQxeo';
export const INSTAGRAM_URL = 'https://www.instagram.com/fabianobratti.empilhadeiras/';
export const WHATSAPP_NUMBER = '5547991926463';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20vim%20atrav%C3%A9s%20do%20seu%20site`;
export const PHONE = '+55 47 99192-6463';
export const ADDRESS = {
  streetAddress: 'Itajaí, SC',
  addressLocality: 'Itajaí',
  addressRegion: 'SC',
  postalCode: '88301-000',
  addressCountry: 'BR',
};
export const GEO = { latitude: -26.9077, longitude: -48.6614 };

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    telephone: PHONE,
    address: {
      '@type': 'PostalAddress',
      ...ADDRESS,
    },
    sameAs: [GOOGLE_BUSINESS_URL, INSTAGRAM_URL],
  };
}

export function buildLocalBusinessSchema(cidadeNome?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': SITE_URL,
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    telephone: PHONE,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      ...ADDRESS,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    areaServed: cidadeNome
      ? { '@type': 'City', name: cidadeNome }
      : [
          'Itajaí',
          'Balneário Camboriú',
          'Camboriú',
          'Navegantes',
          'Penha',
          'Balneário Piçarras',
          'Itapema',
          'Bombinhas',
          'Porto Belo',
        ].map((n) => ({ '@type': 'City', name: n })),
    sameAs: [GOOGLE_BUSINESS_URL, INSTAGRAM_URL],
  };
}

export function buildProductSchema(produto: {
  nome: string;
  descricao: string;
  imagemCapa: string;
  slug: string;
  categoriaPai: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    description: produto.descricao,
    image: `${SITE_URL}${produto.imagemCapa}`,
    brand: { '@type': 'Brand', name: 'UN Forklift' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL',
      seller: { '@type': 'Organization', name: SITE_NAME },
      url: `${SITE_URL}/${produto.categoriaPai}/${produto.slug}`,
    },
  };
}

export function buildServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Manutenção de Empilhadeiras',
    provider: { '@type': 'LocalBusiness', name: SITE_NAME, url: SITE_URL },
    areaServed: 'Vale do Itajaí, Santa Catarina',
    description:
      'Manutenção preventiva, corretiva e atendimento emergencial para empilhadeiras de todas as marcas e modelos.',
  };
}

export function buildFaqSchema(items: { pergunta: string; resposta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  };
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/seo.ts
git commit -m "feat: helpers de metadata e JSON-LD (Organization, LocalBusiness, Product, Service, FAQ)"
```

---

## Task 11: Create mock auth

**Files:**
- Create: `lib/auth-mock.ts`

- [ ] **Step 1: Write `lib/auth-mock.ts`**

Create `lib/auth-mock.ts`:
```ts
'use client';

import { CLIENTE_DEMO } from '@/data/mock/cliente';
import type { Cliente } from '@/lib/types';

const STORAGE_KEY = 'forklift-mock-auth';

export function login(_email: string, _senha: string): Cliente {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, '1');
  }
  return CLIENTE_DEMO;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

export function getCurrentCliente(): Cliente | null {
  if (!isAuthenticated()) return null;
  return CLIENTE_DEMO;
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/auth-mock.ts
git commit -m "feat: auth mock via localStorage (demo)"
```

---

## Task 12: Create JsonLd, GAScript, and tracking widgets

**Files:**
- Create: `components/seo/JsonLd.tsx`, `components/shared/GAScript.tsx`, `components/shared/WhatsAppWidget.tsx`, `components/shared/ReviewsWidget.tsx`

- [ ] **Step 1: Write `components/seo/JsonLd.tsx`**

Create `components/seo/JsonLd.tsx`:
```tsx
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
```

- [ ] **Step 2: Write `components/shared/GAScript.tsx`**

Create `components/shared/GAScript.tsx`:
```tsx
import Script from 'next/script';

const GA_ID = 'G-SZ721W5TLQ';

export function GAScript() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
```

- [ ] **Step 3: Write `components/shared/WhatsAppWidget.tsx`**

Create `components/shared/WhatsAppWidget.tsx`:
```tsx
'use client';

import Script from 'next/script';

export function WhatsAppWidget() {
  return (
    <Script id="glassix-whatsapp" strategy="lazyOnload">
      {`
        var glassixWidgetOptions = { "numbers": [{ "number": "554791926463", "name": "Fabiano Bratti", "subtitle": "" }], "left": false, "ltr": true, "popupText": "", "title": "Olá!", "subTitle": "Clique abaixo para iniciar uma conversa" };
        !function (t) { var e = function () { window.requirejs && !window.whatsAppWidgetClient && (requirejs.config({ paths: { GlassixWhatsAppWidgetClient: "https://cdn.glassix.com/clients/whatsapp.widget.1.2.min.js" } }), require(["GlassixWhatsAppWidgetClient"], function (t) { window.whatsAppWidgetClient = new t(window.glassixWidgetOptions), whatsAppWidgetClient.attach() })), window.GlassixWhatsAppWidgetClient && "function" == typeof window.GlassixWhatsAppWidgetClient ? (window.whatsAppWidgetClient = new GlassixWhatsAppWidgetClient(t), whatsAppWidgetClient.attach()) : i() }, i = function () { a.onload = e, a.src = "https://cdn.glassix.net/clients/whatsapp.widget.1.2.min.js", s && s.parentElement && s.parentElement.removeChild(s), n.parentNode.insertBefore(a, n) }, n = document.getElementsByTagName("script")[0], s = document.createElement("script"); s.async = !0, s.type = "text/javascript", s.crossorigin = "anonymous", s.id = "glassix-whatsapp-widget-script"; var a = s.cloneNode(); s.onload = e, s.src = "https://cdn.glassix.com/clients/whatsapp.widget.1.2.min.js", !document.getElementById(s.id) && document.body && (n.parentNode.insertBefore(s, n), s.onerror = i) }(glassixWidgetOptions);
      `}
    </Script>
  );
}
```

- [ ] **Step 4: Write `components/shared/ReviewsWidget.tsx`**

Create `components/shared/ReviewsWidget.tsx`:
```tsx
'use client';

import Script from 'next/script';

export function ReviewsWidget() {
  return (
    <>
      <div className="elfsight-app-8590a78e-bc30-45e2-954b-269111b57ac4" data-elfsight-app-lazy />
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="lazyOnload"
        data-use-service-core
      />
    </>
  );
}
```

- [ ] **Step 5: Add GA to root layout (public only — gated later)**

Modify `app/layout.tsx`. Add `import { GAScript } from '@/components/shared/GAScript';` near top, and in the JSX before `</body>` add `<GAScript />`. Final file:

```tsx
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { GAScript } from '@/components/shared/GAScript';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://fabianobratti.com'),
  title: {
    default: 'Fabiano Bratti Empilhadeiras — Vale do Itajaí',
    template: '%s | Fabiano Bratti Empilhadeiras',
  },
  description:
    'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
        <GAScript />
      </body>
    </html>
  );
}
```

(Note: GA at root tracks portal too. We'll move it into the public layout in a later task to scope it.)

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/seo/ components/shared/ app/layout.tsx
git commit -m "feat: componentes JsonLd, GAScript, WhatsAppWidget, ReviewsWidget"
```

---

## Task 13: Build public Header and Logo

**Files:**
- Create: `components/public/Logo.tsx`, `components/public/Header.tsx`

- [ ] **Step 1: Write `components/public/Logo.tsx`**

Create `components/public/Logo.tsx`:
```tsx
import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label="Fabiano Bratti Empilhadeiras — página inicial">
      <Image
        src="/logo.png"
        alt="Fabiano Bratti Empilhadeiras"
        width={180}
        height={48}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}
```

- [ ] **Step 2: Write `components/public/Header.tsx`**

Create `components/public/Header.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Início' },
  { href: '/empilhadeiras', label: 'Empilhadeiras' },
  { href: '/construcao-civil', label: 'Construção Civil' },
  { href: '/manutencao', label: 'Manutenção' },
  { href: '/contato', label: 'Contato' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/50 bg-ink-950/80 backdrop-blur-md">
      <div className="container-wide flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-small font-medium text-ink-50 transition-colors hover:text-brand-yellow"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 border border-brand-yellow px-4 py-2 text-small font-medium text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-ink-950"
          >
            Área do Cliente
          </Link>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden" aria-label="Abrir menu">
            <Menu className="size-6 text-ink-50" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-ink-950 border-ink-700">
            <nav className="mt-8 flex flex-col gap-2" aria-label="Navegação móvel">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-body font-medium text-ink-50 transition-colors hover:text-brand-yellow"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-4 border border-brand-yellow px-4 py-3 text-center text-body font-medium text-brand-yellow"
              >
                Área do Cliente
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Install lucide-react if missing**

Run: `npm list lucide-react`. If "(empty)" or not found, run: `npm install lucide-react`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/public/Logo.tsx components/public/Header.tsx package.json package-lock.json
git commit -m "feat: header público sticky com nav desktop e drawer mobile"
```

---

## Task 14: Build Footer

**Files:**
- Create: `components/public/Footer.tsx`

- [ ] **Step 1: Write `components/public/Footer.tsx`**

Create `components/public/Footer.tsx`:
```tsx
import Link from 'next/link';
import { Logo } from './Logo';
import { WHATSAPP_URL, INSTAGRAM_URL, GOOGLE_BUSINESS_URL, PHONE } from '@/lib/seo';
import { CIDADES } from '@/data/cidades';
import { Instagram } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-ink-700 bg-ink-900 text-ink-50">
      <div className="container-wide py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-small text-ink-300">
              Venda, aluguel e manutenção de empilhadeiras e equipamentos pesados no Vale do Itajaí.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-brand-yellow text-ink-950 transition-transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-brand-yellow text-ink-950 transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-label uppercase text-ink-300">Navegação</h3>
            <ul className="mt-4 space-y-2 text-small">
              <li><Link href="/empilhadeiras" className="hover:text-brand-yellow">Empilhadeiras</Link></li>
              <li><Link href="/construcao-civil" className="hover:text-brand-yellow">Construção Civil</Link></li>
              <li><Link href="/manutencao" className="hover:text-brand-yellow">Manutenção</Link></li>
              <li><Link href="/contato" className="hover:text-brand-yellow">Contato</Link></li>
              <li><Link href="/login" className="hover:text-brand-yellow">Área do Cliente</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-label uppercase text-ink-300">Cidades atendidas</h3>
            <ul className="mt-4 grid grid-cols-2 gap-1 text-small">
              {CIDADES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/atendimento/${c.slug}`} className="hover:text-brand-yellow">
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 text-small">
              <p className="text-ink-300">Telefone</p>
              <a href={`tel:${PHONE.replace(/\D/g, '')}`} className="block hover:text-brand-yellow">{PHONE}</a>
              <a
                href={GOOGLE_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-ink-300 hover:text-brand-yellow"
              >
                Ver no Google →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-ink-700 pt-6 text-center text-small text-ink-300">
          © {new Date().getFullYear()} Fabiano Bratti Empilhadeiras. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/public/Footer.tsx
git commit -m "feat: footer com cidades atendidas, redes sociais e link GBP"
```

---

## Task 15: Create public route group layout

**Files:**
- Create: `app/(public)/layout.tsx`
- Modify: `app/layout.tsx` (remove GAScript — moves into public layout)

- [ ] **Step 1: Write `app/(public)/layout.tsx`**

Create `app/(public)/layout.tsx`:
```tsx
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { WhatsAppWidget } from '@/components/shared/WhatsAppWidget';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/seo';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppWidget />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/layout.tsx"
git commit -m "feat: layout do site público (header + footer + whatsapp + org schema)"
```

---

## Task 16: Build Home page

**Files:**
- Create: `app/(public)/page.tsx`, `components/public/Hero.tsx`, `components/public/ProductCard.tsx`, `components/public/ProductGrid.tsx`
- Move: existing `app/page.tsx` content into `(public)`

- [ ] **Step 1: Delete `app/page.tsx` (the placeholder)**

Run: `rm app/page.tsx`

(The home now lives at `app/(public)/page.tsx`.)

- [ ] **Step 2: Write `components/public/Hero.tsx`**

Create `components/public/Hero.tsx`:
```tsx
import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/seo';

export function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-ink-950">
      <video
        className="absolute inset-0 size-full object-cover opacity-50"
        src="/videos/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/empilhadeira-glp.jpeg"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/60 to-ink-950" />
      <div className="container-wide relative flex h-full flex-col justify-center">
        <span className="label-tracked text-brand-yellow">— Forklift Solutions</span>
        <h1 className="mt-6 max-w-3xl font-display text-display font-light text-ink-50">
          Produtividade <span className="font-bold">sem compromissos.</span>
        </h1>
        <p className="mt-6 max-w-xl text-body text-ink-300">
          Empilhadeiras e equipamentos pesados para operações que não podem parar. Venda, aluguel e
          manutenção especializada no Vale do Itajaí.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#produtos"
            className="border border-brand-yellow bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-transparent hover:text-brand-yellow"
          >
            Ver equipamentos
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:border-brand-yellow hover:text-brand-yellow"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `components/public/ProductCard.tsx`**

Create `components/public/ProductCard.tsx`:
```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Produto } from '@/lib/types';

export function ProductCard({ produto }: { produto: Produto }) {
  const href = `/${produto.categoriaPai}/${produto.slug}`;
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
        <Image
          src={produto.imagemCapa}
          alt={produto.nome}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-display text-h3 text-ink-50 transition-colors group-hover:text-brand-yellow">
          {produto.nome}
        </h3>
        <span className="text-label text-ink-300 transition-colors group-hover:text-brand-yellow">→</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Write `components/public/ProductGrid.tsx`**

Create `components/public/ProductGrid.tsx`:
```tsx
import { ProductCard } from './ProductCard';
import type { Produto } from '@/lib/types';

export function ProductGrid({ produtos }: { produtos: Produto[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {produtos.map((p) => <ProductCard key={p.slug} produto={p} />)}
    </div>
  );
}
```

- [ ] **Step 5: Write `app/(public)/page.tsx`**

Create `app/(public)/page.tsx`:
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/public/Hero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { ReviewsWidget } from '@/components/shared/ReviewsWidget';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUTOS } from '@/data/produtos';
import { buildLocalBusinessSchema, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Empilhadeiras e Equipamentos Pesados — Vale do Itajaí',
  description:
    'Venda, aluguel e manutenção de empilhadeiras GLP, diesel e elétricas, além de equipamentos para construção civil. Atendemos Itajaí, Balneário Camboriú, Navegantes e região.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildLocalBusinessSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://fabianobratti.com',
            name: 'Fabiano Bratti Empilhadeiras',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://fabianobratti.com/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />
      <Hero />

      <section id="produtos" className="border-t border-ink-700 bg-ink-950 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Catálogo / 01</span>
          <h2 className="mt-4 font-display text-h1 text-ink-50">Nossos equipamentos</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-300">
            Variedade de modelos e configurações para empilhadeiras industriais e equipamentos para
            construção civil.
          </p>
          <div className="mt-16">
            <ProductGrid produtos={PRODUTOS} />
          </div>
        </div>
      </section>

      <section className="border-t border-ink-700 bg-ink-900 py-24">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="label-tracked text-brand-yellow">— Destaque / 02</span>
            <h2 className="mt-4 font-display text-h1 text-ink-50">
              Empilhadeira GLP: potência e robustez
            </h2>
            <p className="mt-6 text-body text-ink-300">
              Desempenho é a chave. A Empilhadeira GLP da UN Forklift é a resposta quando a demanda é
              alta — pronta para superar tarefas complexas e elevar sua produtividade.
            </p>
            <Link
              href="/empilhadeiras/glp"
              className="mt-8 inline-block border border-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-ink-950"
            >
              Conhecer modelo
            </Link>
          </div>
          <video
            className="aspect-video w-full border border-ink-700"
            src="/videos/glp.mp4"
            controls
            poster="/images/empilhadeira-glp.jpeg"
          />
        </div>
      </section>

      <section className="border-t border-ink-700 bg-ink-950 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Clientes / 03</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">O que dizem sobre nós</h2>
          <div className="mt-12">
            <ReviewsWidget />
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Verify build and run dev**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev` and open `http://localhost:3000`.
Expected: Hero appears with video, products grid shows 8 items, footer at bottom. Click around. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add app/ components/public/
git commit -m "feat: home com hero, grid de produtos e seção de destaque"
```

---

## Task 17: Empilhadeiras category index page

**Files:**
- Create: `app/(public)/empilhadeiras/page.tsx`, `components/public/CategoryHero.tsx`

- [ ] **Step 1: Write `components/public/CategoryHero.tsx`**

Create `components/public/CategoryHero.tsx`:
```tsx
export function CategoryHero({
  label,
  titulo,
  descricao,
}: {
  label: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <section className="border-b border-ink-700 bg-ink-900 py-20">
      <div className="container-wide">
        <span className="label-tracked text-brand-yellow">— {label}</span>
        <h1 className="mt-4 max-w-3xl font-display text-h1 text-ink-50">{titulo}</h1>
        <p className="mt-6 max-w-2xl text-body text-ink-300">{descricao}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `app/(public)/empilhadeiras/page.tsx`**

Create `app/(public)/empilhadeiras/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { CategoryHero } from '@/components/public/CategoryHero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { getProdutosByCategoria } from '@/data/produtos';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Empilhadeiras GLP, Diesel e Elétricas — Venda e Aluguel em Itajaí',
  description:
    'Empilhadeiras industriais GLP, diesel e elétricas (lítio) para indústria, logística e armazéns no Vale do Itajaí. Venda, aluguel e manutenção.',
  path: '/empilhadeiras',
});

export default function EmpilhadeirasPage() {
  const produtos = getProdutosByCategoria('empilhadeiras');
  return (
    <>
      <CategoryHero
        label="Categoria"
        titulo="Empilhadeiras industriais"
        descricao="GLP, diesel ou elétrica com bateria de lítio. Modelos para diferentes capacidades, ambientes internos e externos, com suporte e manutenção em toda a região do Vale do Itajaí."
      />
      <section className="bg-ink-950 py-24">
        <div className="container-wide">
          <ProductGrid produtos={produtos} />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds and `/empilhadeiras` is pre-rendered.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. Visit `http://localhost:3000/empilhadeiras`. Expected: page renders with 3 products. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/empilhadeiras/" components/public/CategoryHero.tsx
git commit -m "feat: página índice de empilhadeiras"
```

---

## Task 18: Construção civil category index page

**Files:**
- Create: `app/(public)/construcao-civil/page.tsx`

- [ ] **Step 1: Write `app/(public)/construcao-civil/page.tsx`**

Create `app/(public)/construcao-civil/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { CategoryHero } from '@/components/public/CategoryHero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { getProdutosByCategoria } from '@/data/produtos';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Equipamentos para Construção Civil — Vale do Itajaí',
  description:
    'Carregadeiras, escavadeiras hidráulicas, retroescavadeiras, rolos compactadores e tratores de esteira para obras e construção civil. Vendas e aluguel na região de Itajaí.',
  path: '/construcao-civil',
});

export default function ConstrucaoCivilPage() {
  const produtos = getProdutosByCategoria('construcao-civil');
  return (
    <>
      <CategoryHero
        label="Categoria"
        titulo="Equipamentos para construção civil"
        descricao="Linha completa de equipamentos pesados para obras, terraplanagem e pavimentação. Atendemos obras residenciais, comerciais e de infraestrutura em toda a região."
      />
      <section className="bg-ink-950 py-24">
        <div className="container-wide">
          <ProductGrid produtos={produtos} />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, `/construcao-civil` pre-rendered.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/construcao-civil/"
git commit -m "feat: página índice de construção civil"
```

---

## Task 19: Product detail dynamic page

**Files:**
- Create: `app/(public)/empilhadeiras/[slug]/page.tsx`, `app/(public)/construcao-civil/[slug]/page.tsx`, `components/public/ProductDetail.tsx`

- [ ] **Step 1: Write `components/public/ProductDetail.tsx`**

Create `components/public/ProductDetail.tsx`:
```tsx
import Image from 'next/image';
import { buildWhatsAppUrl } from '@/lib/seo';
import type { Produto } from '@/lib/types';

export function ProductDetail({ produto }: { produto: Produto }) {
  const whatsappUrl = buildWhatsAppUrl(
    `Olá, gostaria de um orçamento para ${produto.nome}. Vim através do site.`,
  );

  return (
    <>
      <section className="border-b border-ink-700 bg-ink-900 py-20">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-ink-950">
            <Image
              src={produto.imagemCapa}
              alt={produto.nome}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
          <div>
            <span className="label-tracked text-brand-yellow">— {produto.categoriaPai === 'empilhadeiras' ? 'Empilhadeira' : 'Construção Civil'}</span>
            <h1 className="mt-4 font-display text-h1 text-ink-50">{produto.nome}</h1>
            <p className="mt-3 text-body text-brand-yellow">{produto.titulo}</p>
            <p className="mt-6 text-body text-ink-300">{produto.descricao}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block border border-brand-yellow bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-transparent hover:text-brand-yellow"
            >
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </section>

      {produto.variantes && produto.variantes.length > 0 && (
        <section className="border-b border-ink-700 bg-ink-950 py-20">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow">— Variantes</span>
            <h2 className="mt-4 font-display text-h2 text-ink-50">Modelos disponíveis</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {produto.variantes.map((v) => (
                <div key={v.nome} className="border border-ink-700 p-6">
                  <h3 className="font-display text-h3 text-ink-50">{v.nome}</h3>
                  <p className="mt-2 font-mono text-small text-brand-yellow">{v.capacidade}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {produto.specs && produto.specs.length > 0 && (
        <section className="border-b border-ink-700 bg-ink-900 py-20">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow">— Especificações</span>
            <h2 className="mt-4 font-display text-h2 text-ink-50">Specs técnicas</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-4 sm:grid-cols-2">
              {produto.specs.map((s) => (
                <div key={s.label} className="flex justify-between border-b border-ink-700 py-3">
                  <dt className="text-small text-ink-300">{s.label}</dt>
                  <dd className="font-mono text-small text-ink-50">{s.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="bg-ink-950 py-20">
        <div className="container-wide rounded border border-ink-700 bg-ink-900 p-10 text-center">
          <h2 className="font-display text-h2 text-ink-50">Pronto para o próximo passo?</h2>
          <p className="mt-3 text-body text-ink-300">Solicite um orçamento sem compromisso.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-brand-yellow px-8 py-4 text-small font-semibold uppercase tracking-wider text-ink-950 transition-transform hover:scale-105"
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Write `app/(public)/empilhadeiras/[slug]/page.tsx`**

Create `app/(public)/empilhadeiras/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/public/ProductDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUTOS, getProdutoBySlug } from '@/data/produtos';
import { buildMetadata, buildProductSchema } from '@/lib/seo';

export async function generateStaticParams() {
  return PRODUTOS.filter((p) => p.categoriaPai === 'empilhadeiras').map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'empilhadeiras') {
    return { title: 'Não encontrado' };
  }
  return buildMetadata({
    title: `${produto.nome} — Venda e Manutenção em Itajaí`,
    description: produto.descricao.slice(0, 155),
    path: `/empilhadeiras/${produto.slug}`,
    image: produto.imagemCapa,
  });
}

export default async function EmpilhadeiraDetailPage({ params }: Props) {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'empilhadeiras') notFound();
  return (
    <>
      <JsonLd data={buildProductSchema(produto)} />
      <ProductDetail produto={produto} />
    </>
  );
}
```

- [ ] **Step 3: Write `app/(public)/construcao-civil/[slug]/page.tsx`**

Create `app/(public)/construcao-civil/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/public/ProductDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUTOS, getProdutoBySlug } from '@/data/produtos';
import { buildMetadata, buildProductSchema } from '@/lib/seo';

export async function generateStaticParams() {
  return PRODUTOS.filter((p) => p.categoriaPai === 'construcao-civil').map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'construcao-civil') {
    return { title: 'Não encontrado' };
  }
  return buildMetadata({
    title: `${produto.nome} — Construção Civil no Vale do Itajaí`,
    description: produto.descricao.slice(0, 155),
    path: `/construcao-civil/${produto.slug}`,
    image: produto.imagemCapa,
  });
}

export default async function ConstrucaoDetailPage({ params }: Props) {
  const { slug } = await params;
  const produto = getProdutoBySlug(slug);
  if (!produto || produto.categoriaPai !== 'construcao-civil') notFound();
  return (
    <>
      <JsonLd data={buildProductSchema(produto)} />
      <ProductDetail produto={produto} />
    </>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds, all product pages pre-rendered (you should see 8 product routes in the output).

- [ ] **Step 5: Commit**

```bash
git add components/public/ProductDetail.tsx "app/(public)/empilhadeiras/[slug]" "app/(public)/construcao-civil/[slug]"
git commit -m "feat: páginas de detalhe de produto (empilhadeiras e construção civil)"
```

---

## Task 20: Manutenção service page

**Files:**
- Create: `app/(public)/manutencao/page.tsx`

- [ ] **Step 1: Write `app/(public)/manutencao/page.tsx`**

Create `app/(public)/manutencao/page.tsx`:
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { CIDADES } from '@/data/cidades';
import { FAQ_MANUTENCAO } from '@/data/faq';
import { buildFaqSchema, buildMetadata, buildServiceSchema, buildWhatsAppUrl } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Manutenção de Empilhadeiras — Vale do Itajaí',
  description:
    'Manutenção preventiva, corretiva e atendimento emergencial para empilhadeiras de todas as marcas no Vale do Itajaí. Itajaí, Navegantes, Balneário Camboriú e região.',
  path: '/manutencao',
});

const TIPOS_SERVICO = [
  {
    titulo: 'Manutenção preventiva',
    descricao:
      'Planos periódicos com revisões agendadas conforme horímetro. Evita paradas inesperadas e prolonga vida útil do equipamento.',
  },
  {
    titulo: 'Manutenção corretiva',
    descricao:
      'Reparo de falhas e quebras com diagnóstico técnico, troca de peças originais ou homologadas e teste de operação.',
  },
  {
    titulo: 'Atendimento emergencial',
    descricao:
      'Suporte em casos de parada inesperada. Atendimento prioritário em Itajaí, Navegantes, Balneário Camboriú e Camboriú.',
  },
  {
    titulo: 'Peças e suprimentos',
    descricao:
      'Fornecimento de peças originais e de reposição para diversas marcas. Garantia de procedência e compatibilidade.',
  },
];

const DIFERENCIAIS = [
  'Técnicos certificados com experiência em diversas marcas',
  'Atendimento rápido em toda região do Vale do Itajaí',
  'Peças originais e homologadas pelo fabricante',
  'Histórico de manutenções disponível em portal exclusivo',
  'Relatórios técnicos detalhados após cada serviço',
];

export default function ManutencaoPage() {
  const whatsappUrl = buildWhatsAppUrl(
    'Olá, gostaria de informações sobre manutenção de empilhadeiras. Vim através do site.',
  );

  return (
    <>
      <JsonLd data={[buildServiceSchema(), buildFaqSchema(FAQ_MANUTENCAO)]} />

      <section className="border-b border-ink-700 bg-ink-900 py-20">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Serviço</span>
          <h1 className="mt-4 max-w-3xl font-display text-h1 text-ink-50">
            Manutenção especializada de empilhadeiras no Vale do Itajaí
          </h1>
          <p className="mt-6 max-w-2xl text-body text-ink-300">
            Equipe técnica certificada para manutenção preventiva, corretiva e atendimento
            emergencial. Atendemos empilhadeiras de todas as marcas — GLP, diesel e elétricas — em
            toda a região litorânea de Santa Catarina.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:scale-105 transition-transform"
            >
              Solicitar manutenção
            </a>
            <Link
              href="/login"
              className="border border-ink-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-50 hover:border-brand-yellow hover:text-brand-yellow"
            >
              Já é cliente? Acessar portal
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-700 bg-ink-950 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Tipos de manutenção</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">Atendemos toda demanda</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {TIPOS_SERVICO.map((s) => (
              <div key={s.titulo} className="border border-ink-700 p-8">
                <h3 className="font-display text-h3 text-brand-yellow">{s.titulo}</h3>
                <p className="mt-3 text-body text-ink-300">{s.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-700 bg-ink-900 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Cobertura</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">Cidades onde atendemos</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-300">
            Atendimento técnico para manutenção de empilhadeiras em toda região do Vale do Itajaí e
            litoral norte de Santa Catarina.
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {CIDADES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/atendimento/${c.slug}`}
                  className="block border border-ink-700 px-5 py-4 transition-colors hover:border-brand-yellow"
                >
                  <span className="font-display text-h3 text-ink-50">{c.nome}</span>
                  <span className="ml-2 font-mono text-small text-ink-300">{c.uf}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-ink-700 bg-ink-950 py-24">
        <div className="container-wide grid gap-12 md:grid-cols-2">
          <div>
            <span className="label-tracked text-brand-yellow">— Diferenciais</span>
            <h2 className="mt-4 font-display text-h2 text-ink-50">Por que escolher</h2>
          </div>
          <ul className="space-y-4 text-body text-ink-50">
            {DIFERENCIAIS.map((d) => (
              <li key={d} className="flex gap-3 border-b border-ink-700 pb-4">
                <span className="text-brand-yellow">●</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink-900 py-24">
        <div className="container-wide max-w-3xl">
          <span className="label-tracked text-brand-yellow">— Dúvidas frequentes</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">Perguntas comuns</h2>
          <Accordion type="single" collapsible className="mt-10">
            {FAQ_MANUTENCAO.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-ink-700">
                <AccordionTrigger className="text-left text-ink-50 hover:text-brand-yellow">
                  {item.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-ink-300">{item.resposta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, `/manutencao` pre-rendered.

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Visit `http://localhost:3000/manutencao`. Verify FAQ accordion works, links to cidades exist. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/manutencao/"
git commit -m "feat: página /manutencao com FAQ, cidades e schema Service+FAQ"
```

---

## Task 21: Atendimento por cidade (landing pages locais)

**Files:**
- Create: `app/(public)/atendimento/[cidade]/page.tsx`

- [ ] **Step 1: Write `app/(public)/atendimento/[cidade]/page.tsx`**

Create `app/(public)/atendimento/[cidade]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductGrid } from '@/components/public/ProductGrid';
import { CIDADES, getCidadeBySlug } from '@/data/cidades';
import { PRODUTOS } from '@/data/produtos';
import { buildLocalBusinessSchema, buildMetadata, buildWhatsAppUrl } from '@/lib/seo';

export async function generateStaticParams() {
  return CIDADES.map((c) => ({ cidade: c.slug }));
}

interface Props {
  params: Promise<{ cidade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params;
  const c = getCidadeBySlug(cidade);
  if (!c) return { title: 'Não encontrado' };
  return buildMetadata({
    title: `Empilhadeiras e Manutenção em ${c.nome} — ${c.uf}`,
    description: `Venda, aluguel e manutenção de empilhadeiras em ${c.nome}/${c.uf}. Atendimento técnico ${c.tempoAtendimentoEstimado}. Fabiano Bratti Empilhadeiras.`,
    path: `/atendimento/${c.slug}`,
  });
}

export default async function AtendimentoCidadePage({ params }: Props) {
  const { cidade } = await params;
  const c = getCidadeBySlug(cidade);
  if (!c) notFound();

  const whatsappUrl = buildWhatsAppUrl(
    `Olá, sou de ${c.nome}. Gostaria de informações sobre empilhadeiras / manutenção. Vim através do site.`,
  );

  return (
    <>
      <JsonLd data={buildLocalBusinessSchema(c.nomeCompleto)} />

      <section className="border-b border-ink-700 bg-ink-900 py-20">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Atendimento Local</span>
          <h1 className="mt-4 max-w-3xl font-display text-h1 text-ink-50">
            Empilhadeiras e manutenção em {c.nome}
          </h1>
          <p className="mt-6 max-w-3xl text-body text-ink-300">{c.descricaoEconomica}</p>
          <p className="mt-6 max-w-3xl text-body text-ink-300">
            Atendemos {c.nome} com venda, aluguel e manutenção de empilhadeiras GLP, diesel e
            elétricas, além de equipamentos para construção civil. Tempo médio de atendimento
            técnico: <span className="text-brand-yellow">{c.tempoAtendimentoEstimado}</span>.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:scale-105 transition-transform"
          >
            Falar com atendimento em {c.nome}
          </a>
        </div>
      </section>

      <section className="border-b border-ink-700 bg-ink-950 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Equipamentos para {c.nome}</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">
            Linha completa de equipamentos
          </h2>
          <p className="mt-3 max-w-2xl text-body text-ink-300">
            Empilhadeiras industriais e equipamentos pesados disponíveis para venda e aluguel em {c.nome}.
          </p>
          <div className="mt-12">
            <ProductGrid produtos={PRODUTOS} />
          </div>
        </div>
      </section>

      <section className="border-b border-ink-700 bg-ink-900 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Manutenção em {c.nome}</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">
            Manutenção técnica especializada
          </h2>
          <p className="mt-6 max-w-2xl text-body text-ink-300">
            Manutenção preventiva, corretiva e atendimento emergencial em {c.nome}. Técnicos
            certificados, peças originais e relatório técnico após cada serviço.
          </p>
          <Link
            href="/manutencao"
            className="mt-8 inline-block border border-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-brand-yellow hover:bg-brand-yellow hover:text-ink-950"
          >
            Conhecer serviço de manutenção
          </Link>
        </div>
      </section>

      <section className="bg-ink-950 py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Outras cidades</span>
          <h2 className="mt-4 font-display text-h2 text-ink-50">Também atendemos</h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {CIDADES.filter((other) => other.slug !== c.slug).map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/atendimento/${other.slug}`}
                  className="block border border-ink-700 px-4 py-2 text-small text-ink-50 hover:border-brand-yellow hover:text-brand-yellow"
                >
                  {other.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, 9 city pages pre-rendered (one per city).

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Visit `http://localhost:3000/atendimento/itajai` and `/atendimento/navegantes`. Verify city-specific content renders. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/atendimento/"
git commit -m "feat: landings SEO por cidade com LocalBusiness schema"
```

---

## Task 22: Contato page

**Files:**
- Create: `app/(public)/contato/page.tsx`, `components/public/ContactForm.tsx`

- [ ] **Step 1: Write `components/public/ContactForm.tsx`**

Create `components/public/ContactForm.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-brand-yellow bg-ink-900 p-8">
        <h3 className="font-display text-h3 text-brand-yellow">Mensagem enviada</h3>
        <p className="mt-3 text-body text-ink-300">
          Entraremos em contato em breve. Para urgência, fale pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="nome" className="text-ink-50">Nome</Label>
        <Input id="nome" required className="mt-2 bg-ink-900 border-ink-700 text-ink-50" />
      </div>
      <div>
        <Label htmlFor="email" className="text-ink-50">E-mail</Label>
        <Input id="email" type="email" required className="mt-2 bg-ink-900 border-ink-700 text-ink-50" />
      </div>
      <div>
        <Label htmlFor="telefone" className="text-ink-50">Telefone</Label>
        <Input id="telefone" required className="mt-2 bg-ink-900 border-ink-700 text-ink-50" />
      </div>
      <div>
        <Label htmlFor="mensagem" className="text-ink-50">Mensagem</Label>
        <textarea
          id="mensagem"
          rows={4}
          required
          className="mt-2 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-body text-ink-50 focus-visible:outline-2 focus-visible:outline-brand-yellow"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:scale-[1.01] transition-transform"
      >
        Enviar mensagem
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Write `app/(public)/contato/page.tsx`**

Create `app/(public)/contato/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { ContactForm } from '@/components/public/ContactForm';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildLocalBusinessSchema,
  buildMetadata,
  GOOGLE_BUSINESS_URL,
  INSTAGRAM_URL,
  PHONE,
  WHATSAPP_URL,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contato — Fabiano Bratti Empilhadeiras',
  description:
    'Entre em contato com a Fabiano Bratti Empilhadeiras. Telefone, WhatsApp, Instagram e Google Maps. Atendimento no Vale do Itajaí.',
  path: '/contato',
});

export default function ContatoPage() {
  return (
    <>
      <JsonLd data={buildLocalBusinessSchema()} />
      <section className="border-b border-ink-700 bg-ink-900 py-20">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Contato</span>
          <h1 className="mt-4 font-display text-h1 text-ink-50">Fale com a gente</h1>
          <p className="mt-6 max-w-2xl text-body text-ink-300">
            Solicite um orçamento, tire dúvidas técnicas ou agende uma visita. Atendemos toda a
            região do Vale do Itajaí.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-24">
        <div className="container-wide grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-h2 text-ink-50">Envie uma mensagem</h2>
            <p className="mt-3 text-body text-ink-300">Responderemos em até 24h em dias úteis.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-display text-h2 text-ink-50">Canais diretos</h2>
              <div className="mt-6 space-y-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">WhatsApp</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">{PHONE}</p>
                </a>
                <a
                  href={`tel:${PHONE.replace(/\D/g, '')}`}
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">Telefone</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">{PHONE}</p>
                </a>
                <a
                  href={GOOGLE_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">Google Maps & Avaliações</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">Ver no Google →</p>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">Instagram</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">@fabianobratti.empilhadeiras</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds, `/contato` pre-rendered.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/contato/" components/public/ContactForm.tsx
git commit -m "feat: página de contato com form mock e canais diretos"
```

---

## Task 23: Login page

**Files:**
- Create: `app/(portal)/login/page.tsx`

- [ ] **Step 1: Write `app/(portal)/login/page.tsx`**

Create `app/(portal)/login/page.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/public/Logo';
import { login } from '@/lib/auth-mock';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    login(email, senha);
    router.push('/portal');
  }

  function handleDemo() {
    setSubmitting(true);
    login('demo@fabianobratti.com', 'demo');
    router.push('/portal');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-10 border border-ink-700 bg-ink-900 p-8">
          <h1 className="font-display text-h2 text-ink-50">Área do Cliente</h1>
          <p className="mt-2 text-small text-ink-300">
            Acompanhe relatórios de manutenção da sua frota de empilhadeiras.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email" className="text-ink-50">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 bg-ink-950 border-ink-700 text-ink-50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="senha" className="text-ink-50">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-2 bg-ink-950 border-ink-700 text-ink-50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 disabled:opacity-50"
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <button
            onClick={handleDemo}
            disabled={submitting}
            className="mt-3 w-full border border-ink-700 px-6 py-3 text-small font-medium uppercase tracking-wider text-ink-300 hover:border-brand-yellow hover:text-brand-yellow disabled:opacity-50"
          >
            Entrar como demonstração
          </button>

          <div className="mt-6 border-t border-ink-700 pt-4 text-center text-small text-ink-300">
            <Link href="/" className="hover:text-brand-yellow">← Voltar ao site</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-small text-ink-300">
          Modo demonstração — qualquer e-mail e senha entram. Os dados exibidos são fictícios.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add metadata for noindex of login**

Add at the top of the same file (before the `'use client'`... wait — `'use client'` files cannot export `metadata`. Instead, create `app/(portal)/login/layout.tsx`):

Create `app/(portal)/login/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Área do Cliente — Entrar',
  description: 'Acesso de clientes Fabiano Bratti Empilhadeiras.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds, `/login` pre-rendered.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. Visit `http://localhost:3000/login`. Submit any email/senha → should redirect to `/portal` (404 for now, fixed in Task 24). Stop dev.

- [ ] **Step 5: Commit**

```bash
git add "app/(portal)/login/"
git commit -m "feat: página de login mock com botão demo"
```

---

## Task 24: Portal layout with sidebar and auth check

**Files:**
- Create: `app/(portal)/portal/layout.tsx`, `components/portal/Sidebar.tsx`, `components/portal/Topbar.tsx`, `components/portal/AuthGate.tsx`

- [ ] **Step 1: Write `components/portal/AuthGate.tsx`**

Create `components/portal/AuthGate.tsx`:
```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth-mock';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-300">
        <span className="text-small">Carregando…</span>
      </div>
    );
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: Write `components/portal/Sidebar.tsx`**

Create `components/portal/Sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/public/Logo';
import { CLIENTE_DEMO } from '@/data/mock/cliente';
import { logout } from '@/lib/auth-mock';
import { Wrench, LogOut } from 'lucide-react';

const NAV = [{ href: '/portal', label: 'Manutenções', icon: Wrench }];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-700 bg-ink-900 md:flex">
      <div className="border-b border-ink-700 p-6">
        <Logo />
      </div>

      <nav className="flex-1 p-4" aria-label="Navegação do portal">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-2 text-small font-medium ${
                    active
                      ? 'bg-ink-700 text-brand-yellow'
                      : 'text-ink-50 hover:bg-ink-700/50'
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-700 p-4">
        <p className="text-label text-ink-300">Cliente</p>
        <p className="mt-1 truncate text-small font-medium text-ink-50">
          {CLIENTE_DEMO.nomeEmpresa}
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-2 rounded border border-ink-700 px-3 py-2 text-small text-ink-300 hover:border-brand-yellow hover:text-brand-yellow"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Write `components/portal/Topbar.tsx`**

Create `components/portal/Topbar.tsx`:
```tsx
import { Bell } from 'lucide-react';
import { CLIENTE_DEMO } from '@/data/mock/cliente';

export function Topbar() {
  const iniciais = CLIENTE_DEMO.nomeEmpresa
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <header className="flex h-14 items-center justify-between border-b border-ink-700 bg-ink-900 px-6">
      <span className="text-label uppercase text-ink-300">Modo demonstração</span>
      <div className="flex items-center gap-4">
        <button
          className="text-ink-300 hover:text-brand-yellow"
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

- [ ] **Step 4: Write `app/(portal)/portal/layout.tsx`**

Create `app/(portal)/portal/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { AuthGate } from '@/components/portal/AuthGate';
import { Sidebar } from '@/components/portal/Sidebar';
import { Topbar } from '@/components/portal/Topbar';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Portal do Cliente',
  description: 'Área restrita para clientes Fabiano Bratti Empilhadeiras.',
  path: '/portal',
  noIndex: true,
});

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-ink-950">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add "app/(portal)/portal/layout.tsx" components/portal/
git commit -m "feat: layout do portal com sidebar, topbar e auth gate"
```

---

## Task 25: Portal dashboard (manutenções)

**Files:**
- Create: `app/(portal)/portal/page.tsx`, `components/portal/MaintenanceCard.tsx`, `components/portal/MaintenanceDialog.tsx`, `components/portal/DashboardStats.tsx`

- [ ] **Step 1: Write `components/portal/DashboardStats.tsx`**

Create `components/portal/DashboardStats.tsx`:
```tsx
'use client';

import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { MANUTENCOES_DEMO } from '@/data/mock/manutencoes';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-6">
      <p className="text-label uppercase text-ink-300">{label}</p>
      <p className="mt-3 font-display text-h2 text-ink-50">{value}</p>
      {hint && <p className="mt-2 text-small text-ink-300">{hint}</p>}
    </div>
  );
}

export function DashboardStats() {
  const equipamentosAtivos = EQUIPAMENTOS_DEMO.length;
  const agora = new Date();
  const mesAtual = agora.toISOString().slice(0, 7);
  const noMes = MANUTENCOES_DEMO.filter(
    (m) => m.data.startsWith(mesAtual) && m.status === 'concluida',
  ).length;
  const pendentes = MANUTENCOES_DEMO.filter((m) => m.status === 'em_andamento').length;
  const proximaAgendada = MANUTENCOES_DEMO
    .filter((m) => m.status === 'agendada' && m.data >= agora.toISOString().slice(0, 10))
    .sort((a, b) => a.data.localeCompare(b.data))[0];

  const proxEquip = proximaAgendada
    ? EQUIPAMENTOS_DEMO.find((e) => e.id === proximaAgendada.equipamentoId)
    : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Equipamentos ativos" value={String(equipamentosAtivos)} />
      <Stat label="Manutenções no mês" value={String(noMes)} hint="Concluídas" />
      <Stat
        label="Próxima agendada"
        value={proximaAgendada ? new Date(proximaAgendada.data).toLocaleDateString('pt-BR') : '—'}
        hint={proxEquip?.modelo}
      />
      <Stat label="Em andamento" value={String(pendentes)} />
    </div>
  );
}
```

- [ ] **Step 2: Write `components/portal/MaintenanceCard.tsx`**

Create `components/portal/MaintenanceCard.tsx`:
```tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { formatDate } from '@/lib/utils';
import type { Manutencao } from '@/lib/types';

const statusLabel = {
  concluida: { label: 'Concluída', className: 'bg-green-500/10 text-green-400 border-green-500/30' },
  em_andamento: { label: 'Em andamento', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  agendada: { label: 'Agendada', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
} as const;

const tipoLabel = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
} as const;

export function MaintenanceCard({
  manutencao,
  onClick,
}: {
  manutencao: Manutencao;
  onClick: () => void;
}) {
  const eq = EQUIPAMENTOS_DEMO.find((e) => e.id === manutencao.equipamentoId);
  const status = statusLabel[manutencao.status];

  return (
    <button
      onClick={onClick}
      className="block w-full border border-ink-700 bg-ink-900 p-6 text-left transition-colors hover:border-brand-yellow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label uppercase text-ink-300">{formatDate(manutencao.data)}</p>
          <h3 className="mt-2 truncate font-display text-h3 text-ink-50">
            {eq?.modelo ?? 'Equipamento'}
          </h3>
          <p className="mt-1 font-mono text-small text-ink-300">{eq?.serie}</p>
        </div>
        <Badge className={`shrink-0 border ${status.className}`}>{status.label}</Badge>
      </div>
      <div className="mt-4 flex items-center gap-3 text-small">
        <span className="text-ink-300">Tipo:</span>
        <span className="text-ink-50">{tipoLabel[manutencao.tipo]}</span>
        <span className="text-ink-700">|</span>
        <span className="text-ink-300">Técnico:</span>
        <span className="text-ink-50">{manutencao.tecnico}</span>
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Write `components/portal/MaintenanceDialog.tsx`**

Create `components/portal/MaintenanceDialog.tsx`:
```tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { formatBRL, formatDate } from '@/lib/utils';
import type { Manutencao } from '@/lib/types';

export function MaintenanceDialog({
  manutencao,
  open,
  onOpenChange,
}: {
  manutencao: Manutencao | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!manutencao) return null;
  const eq = EQUIPAMENTOS_DEMO.find((e) => e.id === manutencao.equipamentoId);

  function handleDownloadPdf() {
    alert('PDF mock — esta funcionalidade será implementada na próxima fase.');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-ink-700 bg-ink-900 text-ink-50">
        <DialogHeader>
          <DialogTitle className="font-display text-h2 text-ink-50">
            {eq?.modelo}
          </DialogTitle>
          <DialogDescription className="font-mono text-small text-ink-300">
            Série {eq?.serie} • Manutenção em {formatDate(manutencao.data)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <p className="text-label uppercase text-ink-300">Descrição</p>
            <p className="mt-2 text-body text-ink-50">{manutencao.descricao}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-label uppercase text-ink-300">Tipo</p>
              <p className="mt-1 text-small text-ink-50 capitalize">{manutencao.tipo}</p>
            </div>
            <div>
              <p className="text-label uppercase text-ink-300">Técnico</p>
              <p className="mt-1 text-small text-ink-50">{manutencao.tecnico}</p>
            </div>
            {manutencao.horimetroNaData != null && (
              <div>
                <p className="text-label uppercase text-ink-300">Horímetro</p>
                <p className="mt-1 font-mono text-small text-ink-50">{manutencao.horimetroNaData} h</p>
              </div>
            )}
            {manutencao.custo != null && (
              <div>
                <p className="text-label uppercase text-ink-300">Custo</p>
                <p className="mt-1 font-mono text-small text-ink-50">{formatBRL(manutencao.custo)}</p>
              </div>
            )}
          </div>

          {manutencao.pecasTrocadas && manutencao.pecasTrocadas.length > 0 && (
            <div>
              <p className="text-label uppercase text-ink-300">Peças trocadas</p>
              <ul className="mt-2 divide-y divide-ink-700 border border-ink-700">
                {manutencao.pecasTrocadas.map((p, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-small">
                    <span className="text-ink-50">{p.nome}</span>
                    <span className="font-mono text-ink-300">×{p.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {manutencao.proximaSugerida && (
            <div className="border border-brand-yellow/30 bg-brand-yellow/5 p-4">
              <p className="text-label uppercase text-brand-yellow">Próxima manutenção sugerida</p>
              <p className="mt-1 text-small text-ink-50">{formatDate(manutencao.proximaSugerida)}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-ink-700 pt-4">
            <button
              onClick={handleDownloadPdf}
              className="border border-brand-yellow px-5 py-2 text-small font-semibold uppercase tracking-wider text-brand-yellow hover:bg-brand-yellow hover:text-ink-950"
            >
              Baixar PDF
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Write `app/(portal)/portal/page.tsx`**

Create `app/(portal)/portal/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { DashboardStats } from '@/components/portal/DashboardStats';
import { MaintenanceCard } from '@/components/portal/MaintenanceCard';
import { MaintenanceDialog } from '@/components/portal/MaintenanceDialog';
import { CLIENTE_DEMO } from '@/data/mock/cliente';
import { getManutencoesRecentes } from '@/data/mock/manutencoes';
import type { Manutencao } from '@/lib/types';

export default function PortalPage() {
  const [selected, setSelected] = useState<Manutencao | null>(null);
  const [open, setOpen] = useState(false);
  const manutencoes = getManutencoesRecentes();

  function handleOpen(m: Manutencao) {
    setSelected(m);
    setOpen(true);
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-label uppercase text-ink-300">Bem-vindo</p>
        <h1 className="mt-2 font-display text-h1 text-ink-50">
          Olá, <span className="text-brand-yellow">{CLIENTE_DEMO.nomeEmpresa}</span>
        </h1>
      </div>

      <DashboardStats />

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-h2 text-ink-50">Manutenções recentes</h2>
          <p className="text-small text-ink-300">{manutencoes.length} no total</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {manutencoes.map((m) => (
            <MaintenanceCard key={m.id} manutencao={m} onClick={() => handleOpen(m)} />
          ))}
        </div>
      </div>

      <MaintenanceDialog manutencao={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Visual check**

Run: `npm run dev`. Visit `http://localhost:3000/login`, click "Entrar como demonstração" → should land on `/portal`. Click a maintenance card → modal opens with full details. Click "Baixar PDF" → alert. Click "Sair" → returns to login. Stop dev.

- [ ] **Step 7: Commit**

```bash
git add "app/(portal)/portal/page.tsx" components/portal/
git commit -m "feat: dashboard do portal com KPIs e cards de manutenção + modal"
```

---

## Task 26: Sitemap, robots, 404 and error pages

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/error.tsx`

- [ ] **Step 1: Write `app/sitemap.ts`**

Create `app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';
import { PRODUTOS } from '@/data/produtos';
import { CIDADES } from '@/data/cidades';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = ['', '/empilhadeiras', '/construcao-civil', '/manutencao', '/contato'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  );

  const produtos = PRODUTOS.map((p) => ({
    url: `${SITE_URL}/${p.categoriaPai}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const cidades = CIDADES.map((c) => ({
    url: `${SITE_URL}/atendimento/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...statics, ...produtos, ...cidades];
}
```

- [ ] **Step 2: Write `app/robots.ts`**

Create `app/robots.ts`:
```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/portal', '/login'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Write `app/not-found.tsx`**

Create `app/not-found.tsx`:
```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="text-center">
        <p className="font-mono text-small text-brand-yellow">404</p>
        <h1 className="mt-4 font-display text-h1 text-ink-50">Página não encontrada</h1>
        <p className="mt-4 max-w-md text-body text-ink-300">
          A página que você procura não existe ou foi movida. Volte para o início ou explore o catálogo.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950"
          >
            Ir para a home
          </Link>
          <Link
            href="/empilhadeiras"
            className="border border-ink-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-50 hover:border-brand-yellow hover:text-brand-yellow"
          >
            Ver empilhadeiras
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Write `app/error.tsx`**

Create `app/error.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="text-center">
        <p className="font-mono text-small text-brand-yellow">500</p>
        <h1 className="mt-4 font-display text-h1 text-ink-50">Algo deu errado</h1>
        <p className="mt-4 max-w-md text-body text-ink-300">
          Ocorreu um erro inesperado. Tente recarregar a página ou volte para o início.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="border border-ink-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-50 hover:border-brand-yellow hover:text-brand-yellow"
          >
            Ir para a home
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds. Check output — sitemap.xml and robots.txt should be generated routes.

- [ ] **Step 6: Verify sitemap content**

Run: `npm run dev`. Visit `http://localhost:3000/sitemap.xml` and `http://localhost:3000/robots.txt`. Expected: valid XML with all routes / valid robots txt. Stop dev.

- [ ] **Step 7: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/not-found.tsx app/error.tsx
git commit -m "feat: sitemap, robots, 404 e página de erro customizadas"
```

---

## Task 27: Scope GA to public only

The current setup has GAScript in `app/layout.tsx` which loads for all routes including `/portal` and `/login`. Per spec, GA should not track the portal.

**Files:**
- Modify: `app/layout.tsx`, `app/(public)/layout.tsx`

- [ ] **Step 1: Remove GAScript from root layout**

Edit `app/layout.tsx`. Remove the `<GAScript />` element and the corresponding import. Final state:

```tsx
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://fabianobratti.com'),
  title: {
    default: 'Fabiano Bratti Empilhadeiras — Vale do Itajaí',
    template: '%s | Fabiano Bratti Empilhadeiras',
  },
  description:
    'Venda, aluguel e manutenção de empilhadeiras no Vale do Itajaí. Empilhadeiras GLP, diesel, elétricas e equipamentos para construção civil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Add GAScript to the public layout**

Edit `app/(public)/layout.tsx`. Final state:

```tsx
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { WhatsAppWidget } from '@/components/shared/WhatsAppWidget';
import { GAScript } from '@/components/shared/GAScript';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/seo';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppWidget />
      <GAScript />
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx "app/(public)/layout.tsx"
git commit -m "fix: GA e WhatsApp só carregam no site público (não no portal)"
```

---

## Task 28: Delete old static site files

Now that the Next.js app is complete and pre-renders all routes, remove the old HTML/CSS/JS files.

**Files:**
- Delete: `index.html`, `paginas/`, `css/`, `js/`, `CNAME`, `assets/`

- [ ] **Step 1: Confirm Next.js routes are working**

Run: `npm run build`. Verify the output lists all expected routes:
- `/` (home)
- `/empilhadeiras` + `/empilhadeiras/glp`, `/diesel`, `/eletricas`
- `/construcao-civil` + 5 sub-routes
- `/manutencao`
- `/atendimento/itajai` + 8 others
- `/contato`
- `/login`
- `/portal`
- `/sitemap.xml`, `/robots.txt`

If any route is missing, fix before proceeding.

- [ ] **Step 2: Delete old files**

Run:
```bash
rm -f index.html CNAME
rm -rf paginas css js assets
```

(We keep `CNAME` deletion because Vercel handles the custom domain via dashboard. If you want to keep it as a safety net for the GitHub Pages fallback, skip the `CNAME` removal.)

- [ ] **Step 3: Update `tsconfig.json` to remove old folder excludes**

Edit `tsconfig.json` `exclude` array — remove `"paginas"`, `"css"`, `"js"` since folders no longer exist. Final exclude:
```json
"exclude": ["node_modules"]
```

- [ ] **Step 4: Verify build still works**

Run: `npm run build`
Expected: All routes still pre-render.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove site estático antigo (HTML/CSS/JS legados)"
```

---

## Task 29: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

Replace `README.md`:
```markdown
# Fabiano Bratti Empilhadeiras

Site institucional e portal de manutenção da Fabiano Bratti Empilhadeiras — venda, aluguel e manutenção de empilhadeiras e equipamentos para construção civil no Vale do Itajaí.

**Produção:** https://fabianobratti.com

## Stack

- Next.js 15 (App Router)
- TypeScript estrito
- Tailwind CSS
- shadcn/ui (Radix + Tailwind)
- Hospedagem: Vercel

## Desenvolvimento

```bash
npm install
npm run dev          # servidor de desenvolvimento em http://localhost:3000
npm run build        # build de produção
npm run start        # roda o build de produção localmente
npm run lint         # checagem de lint
```

## Estrutura

```
app/                       rotas (App Router)
├── (public)/              site público (catálogo, SEO)
└── (portal)/              área do cliente (mock)
components/
├── ui/                    shadcn/ui primitives
├── public/                componentes do site público
├── portal/                componentes do portal
├── shared/                widgets (GA, WhatsApp, Reviews)
└── seo/                   JsonLd
data/
├── produtos.ts            catálogo
├── cidades.ts             cidades atendidas
├── faq.ts                 perguntas frequentes
└── mock/                  dados mock do portal
lib/
├── seo.ts                 metadata + JSON-LD helpers
├── auth-mock.ts           auth mock via localStorage
├── types.ts               tipos compartilhados
└── utils.ts               formatadores
public/                    assets estáticos (imagens, vídeos, logo)
docs/superpowers/          specs e plans
```

## Portal do Cliente (mock)

- URL: `/login` → `/portal`
- Modo demonstração: qualquer e-mail e senha funcionam
- Botão "Entrar como demonstração" faz login automático
- Dados exibidos são fictícios (mock em `data/mock/`)

## SEO

- Landings por cidade em `/atendimento/[cidade]`
- Página de serviço em `/manutencao`
- Schema.org JSON-LD: Organization, LocalBusiness, Product, Service, FAQPage
- Sitemap e robots gerados automaticamente (`/sitemap.xml`, `/robots.txt`)
- Google Analytics: `G-SZ721W5TLQ` (apenas site público)

## Deploy

Deploy automático na Vercel a cada push em `main`. Pull requests geram preview deploys.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: atualiza README para Next.js"
```

---

## Task 30: Verify final state and deploy preparation

**Files:**
- Create: `vercel.json` (optional, only if needed)

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: 0 warnings / 0 errors. Fix any issues by reading the error and editing the offending file.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Build succeeds. Output should show ~25 routes pre-rendered (home, 2 category indexes, 8 products, 1 manutencao, 9 cidades, contato, login, portal, sitemap, robots, 404).

- [ ] **Step 4: Smoke-test the production build locally**

Run: `npm run start`
Visit and check each page renders:
- `/`
- `/empilhadeiras` and `/empilhadeiras/glp`
- `/construcao-civil` and `/construcao-civil/escavadeiras`
- `/manutencao`
- `/atendimento/itajai`
- `/contato`
- `/login` → submit demo → `/portal`
- `/sitemap.xml`
- `/robots.txt`

Stop with Ctrl+C.

- [ ] **Step 5: (Optional) Lighthouse check**

If Lighthouse is available in your environment, run on home page. Expected: Performance, Best Practices, SEO ≥ 90; Accessibility ≥ 95.

- [ ] **Step 6: Commit any final fixes**

```bash
git status
```

If files were touched during fixes:
```bash
git add -A
git commit -m "fix: ajustes finais pós-verificação"
```

- [ ] **Step 7: Push and deploy**

Push to GitHub:
```bash
git push origin main
```

Connect repository to Vercel (manual step in Vercel dashboard if not already done):
- Import GitHub repo at https://vercel.com/new
- Framework preset: Next.js (auto-detected)
- Environment variables: none required for mock
- Click Deploy
- After preview deploys correctly, add custom domain `fabianobratti.com` in Vercel settings → Domains
- Update DNS at registrar to point to Vercel (A `76.76.21.21` or CNAME to `cname.vercel-dns.com`)

- [ ] **Step 8: Post-deploy checks (manual)**

After DNS propagation:
- Test `https://fabianobratti.com` — site loads
- Test `/sitemap.xml` accessible
- Submit sitemap to Google Search Console at https://search.google.com/search-console
- Verify GA4 receiving events
- Verify Schema markup at https://search.google.com/test/rich-results

---

## Self-review summary

Spec coverage cross-check:

| Spec requirement | Implemented in |
|---|---|
| Next.js 15 + TypeScript + Tailwind + shadcn/ui | Tasks 1-4 |
| Route groups `(public)` and `(portal)` | Tasks 15, 23, 24 |
| Tipos: Produto, Cidade, Cliente, Equipamento, Manutencao | Task 5 |
| `data/produtos.ts` | Task 6 |
| `data/cidades.ts`, `data/faq.ts` | Task 7 |
| Mock portal data | Task 8 |
| Asset migration to `public/` | Task 9 |
| `lib/seo.ts` helpers | Task 10 |
| `lib/auth-mock.ts` | Task 11 |
| GAScript, WhatsAppWidget, ReviewsWidget, JsonLd | Tasks 12, 27 |
| Header, Footer, Logo | Tasks 13, 14 |
| Home with Hero, ProductGrid, destaque, Reviews | Task 16 |
| `/empilhadeiras` index | Task 17 |
| `/construcao-civil` index | Task 18 |
| Product detail dynamic pages with Product schema | Task 19 |
| `/manutencao` with FAQ, Service+FAQ schema | Task 20 |
| `/atendimento/[cidade]` with LocalBusiness schema | Task 21 |
| `/contato` with form | Task 22 |
| `/login` mock | Task 23 |
| Portal layout with sidebar, auth gate | Task 24 |
| Portal dashboard with maintenance cards + dialog | Task 25 |
| Sitemap, robots, 404, error | Task 26 |
| GA scoped to public | Task 27 |
| Delete old static files | Task 28 |
| Updated README | Task 29 |
| Vercel deploy + post-deploy checklist | Task 30 |
| Lighthouse ≥ 90 | Task 30 step 5 |
| `noUncheckedIndexedAccess` strict TS | Task 1 step 3 |
| `prefers-reduced-motion` respected | Task 2 step 2 (globals.css) |
| Mock data flexibility for future fields | Task 8 (typed but extensible) |
| Google Business Profile link in footer/contact | Tasks 14, 22 |

All spec requirements have a corresponding task.

Type consistency check: all references to types (`Produto`, `Cidade`, `Manutencao`, `Cliente`, `Equipamento`) match their definitions in Task 5. Function signatures (`getProdutoBySlug`, `getCidadeBySlug`, `getManutencoesRecentes`, `buildMetadata`, `buildLocalBusinessSchema`, `buildProductSchema`, `buildFaqSchema`, `buildServiceSchema`, `buildWhatsAppUrl`, `login`, `logout`, `isAuthenticated`) match between definition and consumer tasks.

Placeholder scan: no TODO/TBD/"add validation"/etc. in steps. All code blocks are complete.
