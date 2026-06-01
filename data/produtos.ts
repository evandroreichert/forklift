import type { Produto } from '@/lib/types';

export const PRODUTOS: Produto[] = [
  {
    slug: 'glp',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira GLP',
    titulo: 'Potência e robustez para desafios',
    descricao:
      'Meio-termo entre diesel e elétrica: a linha GLP da UN Forklift entrega desempenho comparável ao diesel com operação mais econômica e menor impacto ambiental. Modelo N-Series 2.5T–3.5T atende armazéns e indústria leve; modelo 4.5T expande capacidade pra cargas mais pesadas. Boa pra operações mistas indoor/outdoor, com baixo custo de manutenção e abastecimento simples por cilindro.',
    imagemCapa: '/images/un-br-glp.jpg',
    imagensGaleria: ['/images/un-br-glp.jpg', '/images/un-br-glp-4t-5t.jpg'],
    videoUrl: '/videos/glp.mp4',
    variantes: [
      { nome: 'GLP 2.5T', capacidade: '2.500 kg' },
      { nome: 'GLP 3T - 3.5T', capacidade: '3.000 - 3.500 kg' },
      { nome: 'GLP 4T - 5T', capacidade: '4.000 - 5.000 kg' },
    ],
  },
  {
    slug: 'diesel',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira Diesel',
    titulo: 'Força e autonomia para operações intensas',
    descricao:
      'A linha diesel UN Forklift cobre múltiplas faixas de capacidade pra operações industriais robustas. F-Series e N-Series 2.5T–3.5T pra movimentação geral, modelos pesados N-Series 7T–10T pra cargas extremas e variante Todo-Terreno (2.5T–3.5T) com tração 2WD ou 4WD pra terrenos irregulares. Projetadas pra ambientes externos exigentes, onde potência constante e durabilidade em uso contínuo são essenciais.',
    imagemCapa: '/images/un-br-diesel-fseries.jpg',
    imagensGaleria: [
      '/images/un-br-diesel-fseries.jpg',
      '/images/un-br-diesel-nseries.jpg',
      '/images/un-br-diesel-todo-terreno.jpg',
      '/images/un-br-diesel-7t.jpg',
    ],
    variantes: [
      { nome: 'F-Series 2.5T - 3.5T', capacidade: '2.500 - 3.500 kg' },
      { nome: 'N-Series 2.5T - 3.5T', capacidade: '2.500 - 3.500 kg' },
      { nome: 'N-Series 7T - 10T', capacidade: '7.000 - 10.000 kg' },
      { nome: 'Todo-Terreno 2.5T - 3.5T', capacidade: '2.500 - 3.500 kg' },
    ],
  },
  {
    slug: 'eletricas',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira Elétrica',
    titulo: 'Silenciosa, limpa e eficiente',
    descricao:
      'Alternativa sustentável e silenciosa em várias especificações. F-Series e N-Series 2.5T–3.5T pra armazéns e operações industriais. Modelo compacto FE-Series de 3 rodas (1.5T–2.0T) pra corredores estreitos. Linha pesada N-Series 7T–10T pra operações de maior porte. Modelos 4T–5T com bateria de lítio-íon entregam autonomia estendida e baixa manutenção comparado ao chumbo-ácido. Zero emissões, baixo ruído e excelente custo operacional.',
    imagemCapa: '/images/un-br-eletrica-fseries.jpg',
    imagensGaleria: [
      '/images/un-br-eletrica-fseries.jpg',
      '/images/un-br-eletrica-nseries.jpg',
      '/images/un-br-eletrica-4t-5t.jpg',
      '/images/un-br-eletrica-3rodas.jpg',
      '/images/un-br-eletrica-retratil.jpg',
    ],
    variantes: [
      { nome: '3 rodas FE-Series', capacidade: '1.500 - 2.000 kg' },
      { nome: 'F-Series 2.5T - 3.5T', capacidade: '2.500 - 3.500 kg' },
      { nome: 'N-Series 4T - 5T lítio', capacidade: '4.000 - 5.000 kg' },
      { nome: 'N-Series 7T - 10T', capacidade: '7.000 - 10.000 kg' },
    ],
  },
  {
    slug: 'carregadeiras',
    categoriaPai: 'construcao-civil',
    nome: 'Carregadeiras',
    titulo: 'Produtividade em movimentação de materiais',
    descricao:
      'Carregadeiras para obras de construção civil, mineração e movimentação de granéis. Robustas, ágeis e com excelente capacidade de carga.',
    imagemCapa: '/images/un-carregadeira-sl130.png',
    imagensGaleria: ['/images/un-carregadeira-sl130.png', '/images/carregadeira.jpeg'],
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
    imagemCapa: '/images/retroescavadeira.webp',
    imagensGaleria: ['/images/retroescavadeira.webp', '/images/retroescavadeira-1.jpg', '/images/retroescavadeira-2.jpg'],
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
