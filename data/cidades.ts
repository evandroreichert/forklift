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
