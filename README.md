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
