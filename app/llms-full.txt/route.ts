import { SITE_URL, COMPANY_CNPJ, COMPANY_LEGAL_NAME, SITE_NAME, PHONE } from '@/lib/seo';
import { CIDADES } from '@/data/cidades';
import { PRODUTOS } from '@/data/produtos';
import { FAQ_MANUTENCAO } from '@/data/faq';

// Versão expandida do llms.txt — conteúdo completo das páginas pra LLMs
// ingerirem sem precisar fazer N fetches. Atualiza a cada 24h via revalidate.
export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const produtosSection = PRODUTOS.map((p) => {
    const variantes = p.variantes?.length
      ? `\n\n**Variantes:**\n${p.variantes.map((v) => `- ${v.nome}: ${v.capacidade}`).join('\n')}`
      : '';
    return `### ${p.nome}

**URL:** ${SITE_URL}/${p.categoriaPai}/${p.slug}

${p.descricao}${variantes}`;
  }).join('\n\n---\n\n');

  const cidadesSection = CIDADES.map(
    (c) => `### ${c.nome} (${c.uf})

**URL:** ${SITE_URL}/atendimento/${c.slug}
**Tempo de atendimento:** ${c.tempoAtendimentoEstimado}

${c.descricaoEconomica}`,
  ).join('\n\n---\n\n');

  const faqSection = FAQ_MANUTENCAO.map(
    (item) => `### ${item.pergunta}

${item.resposta}`,
  ).join('\n\n');

  const content = `# ${SITE_NAME} — Conteúdo completo

> ${COMPANY_LEGAL_NAME} · CNPJ ${COMPANY_CNPJ} · Sede em Penha, Santa Catarina

Empresa especializada em venda, aluguel e manutenção de empilhadeiras industriais e equipamentos pesados para construção civil. Representante UN Forklift no Vale do Itajaí e litoral norte de Santa Catarina. Atendimento técnico em até 1 hora nas cidades vizinhas; raio emergencial de 100 km da base; atendimento geral avaliado caso a caso até 300 km de Penha.

**Contato:**
- Telefone/WhatsApp: ${PHONE}
- Site: ${SITE_URL}
- Sede: Penha, SC · CEP 88385-000

---

## Equipamentos disponíveis

${produtosSection}

---

## Manutenção técnica

A Fabiano Bratti Empilhadeiras oferece quatro modalidades de serviço técnico:

### Manutenção preventiva
Planos periódicos com revisões agendadas conforme horímetro do equipamento. Evita paradas inesperadas e prolonga vida útil. Cliente recebe relatório técnico após cada serviço pelo portal exclusivo.

### Manutenção corretiva
Reparo de falhas e quebras com diagnóstico técnico, troca de peças originais ou homologadas, e teste de operação antes da entrega.

### Atendimento emergencial
Para clientes com equipamentos fora de operação ou máquina que quebrou repentinamente. Atendemos em até 100 km da base em Penha, com 90% dos casos resolvidos no mesmo dia quando há tempo hábil para a solução.

### Peças e suprimentos
Fornecimento de peças originais e de reposição para diversas marcas (Toyota, Hyster, Yale, Still, Linde, Hyundai, UN Forklift, entre outras). Garantia de procedência e compatibilidade.

---

## Cidades atendidas no litoral norte de SC e Vale do Itajaí

${cidadesSection}

---

## Perguntas frequentes

${faqSection}

---

## Portal do cliente

Clientes ativos têm acesso a um portal exclusivo onde podem:
- Visualizar histórico de manutenções de todos os equipamentos
- Baixar relatórios técnicos em PDF com dados completos do serviço (técnico responsável, horímetro, peças trocadas, assinatura do responsável)
- Acompanhar status de chamados em andamento

Acesso: ${SITE_URL}/login

---

Última atualização: ${new Date().toISOString().slice(0, 10)}
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
