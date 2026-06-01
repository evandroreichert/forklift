import { SITE_URL } from '@/lib/seo';
import { CIDADES } from '@/data/cidades';
import { PRODUTOS } from '@/data/produtos';

// llms.txt seguindo a proposta de https://llmstxt.org/ — facilita LLMs (ChatGPT,
// Claude, Perplexity etc) entenderem o site sem ter que crawlear tudo.
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export function GET() {
  const cidades = CIDADES.map((c) => `- [${c.nome}](${SITE_URL}/atendimento/${c.slug}): ${c.tempoAtendimentoEstimado}`).join('\n');
  const produtosEmpilhadeira = PRODUTOS.filter((p) => p.categoriaPai === 'empilhadeiras')
    .map((p) => `- [${p.nome}](${SITE_URL}/empilhadeiras/${p.slug}): ${p.titulo}`)
    .join('\n');
  const produtosConstrucao = PRODUTOS.filter((p) => p.categoriaPai === 'construcao-civil')
    .map((p) => `- [${p.nome}](${SITE_URL}/construcao-civil/${p.slug}): ${p.titulo}`)
    .join('\n');

  const content = `# Fabiano Bratti Empilhadeiras

> Venda, aluguel e manutenção de empilhadeiras industriais (GLP, diesel, elétricas) e equipamentos pesados para construção civil. Sede em Penha, Santa Catarina. Representante UN Forklift no litoral norte de SC. Atendimento técnico em até 1 hora nas cidades vizinhas, raio emergencial de 100 km da base.

CNPJ 50.982.211/0001-45 · FABIANO BRATTI E CIA LTDA
Sede: Penha, SC · Vale do Itajaí · Litoral Norte de Santa Catarina
Telefone/WhatsApp: +55 47 99192-6463

## Empilhadeiras
${produtosEmpilhadeira}
- [Catálogo completo](${SITE_URL}/empilhadeiras): linha UN Forklift de empilhadeiras industriais

## Construção civil
${produtosConstrucao}
- [Catálogo completo](${SITE_URL}/construcao-civil): carregadeiras, escavadeiras, retroescavadeiras, rolos e tratores

## Manutenção
- [Manutenção de empilhadeiras](${SITE_URL}/manutencao): preventiva, corretiva, emergencial e peças
- Raio emergencial: 100 km da base em Penha (SC); 90% dos casos resolvidos no mesmo dia quando há tempo hábil
- Atendimento geral (venda, locação, preventiva): até 300 km, avaliado caso a caso

## Cidades atendidas
${cidades}

## Portal do cliente
- [Acesso ao portal](${SITE_URL}/login): clientes acessam histórico de manutenções e baixam relatórios técnicos em PDF
- [Contato direto](${SITE_URL}/contato): formulário, WhatsApp, telefone, Instagram e Google Maps

## Detalhes
- [llms-full.txt](${SITE_URL}/llms-full.txt): conteúdo expandido pra ingestão por LLMs
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
