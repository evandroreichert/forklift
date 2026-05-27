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

      <section className="border-b border-ink-100 bg-surface-alt py-20">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Serviço</span>
          <h1 className="mt-4 max-w-3xl font-display text-h1 text-ink-950">
            Manutenção especializada de empilhadeiras no Vale do Itajaí
          </h1>
          <p className="mt-6 max-w-2xl text-body text-ink-500">
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
              className="border border-ink-200 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:border-brand-yellow hover:text-brand-yellow"
            >
              Já é cliente? Acessar portal
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-white py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Tipos de manutenção</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">Atendemos toda demanda</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {TIPOS_SERVICO.map((s) => (
              <div key={s.titulo} className="border border-ink-100 p-8">
                <h3 className="font-display text-h3 text-brand-yellow">{s.titulo}</h3>
                <p className="mt-3 text-body text-ink-500">{s.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-surface-alt py-24">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Cobertura</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">Cidades onde atendemos</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-500">
            Atendimento técnico para manutenção de empilhadeiras em toda região do Vale do Itajaí e
            litoral norte de Santa Catarina.
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {CIDADES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/atendimento/${c.slug}`}
                  className="block border border-ink-100 px-5 py-4 transition-colors hover:border-brand-yellow"
                >
                  <span className="font-display text-h3 text-ink-950">{c.nome}</span>
                  <span className="ml-2 font-mono text-small text-ink-500">{c.uf}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-white py-24">
        <div className="container-wide grid gap-12 md:grid-cols-2">
          <div>
            <span className="label-tracked text-brand-yellow">— Diferenciais</span>
            <h2 className="mt-4 font-display text-h2 text-ink-950">Por que escolher</h2>
          </div>
          <ul className="space-y-4 text-body text-ink-950">
            {DIFERENCIAIS.map((d) => (
              <li key={d} className="flex gap-3 border-b border-ink-100 pb-4">
                <span className="text-brand-yellow">●</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface-alt py-24">
        <div className="container-wide max-w-3xl">
          <span className="label-tracked text-brand-yellow">— Dúvidas frequentes</span>
          <h2 className="mt-4 font-display text-h2 text-ink-950">Perguntas comuns</h2>
          <Accordion className="mt-10">
            {FAQ_MANUTENCAO.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-ink-100">
                <AccordionTrigger className="text-left text-ink-950 hover:text-brand-yellow">
                  {item.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-ink-500">{item.resposta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
