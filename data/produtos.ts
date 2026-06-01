import type { Produto } from '@/lib/types';

export const PRODUTOS: Produto[] = [
  {
    slug: 'glp',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira GLP',
    titulo: 'Potência e robustez para desafios',
    descricao:
      'Empilhadeira GLP N-Series com capacidade de 2.500 a 3.500 kg, atendendo armazéns, indústria leve e operações mistas (indoor e outdoor). Equilibra a potência do diesel com operação mais econômica e menor impacto ambiental. Abastecimento simples por cilindro, baixo custo de manutenção, motor a gás com transmissão automática e cabine ergonômica para o operador.',
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
      'Empilhadeira diesel F-Series com capacidade de 2.500 a 3.500 kg, projetada pra operações industriais e logísticas em ambientes externos. Motor diesel com torque robusto, transmissão automática e estrutura reforçada pra uso contínuo. Ideal pra carga e descarga em pátios, armazéns e operações onde autonomia e potência constante são essenciais. Veja outras configurações (N-Series, modelos pesados 7T–10T e Off-Road) nas variantes abaixo.',
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
      'Empilhadeira elétrica F-Series com capacidade de 2.500 a 3.500 kg, ideal pra armazéns, indústria leve e operações com requisitos ambientais (frigorífico, alimentos, farma). Motor elétrico silencioso, zero emissão e baixo custo operacional. Bateria de chumbo-ácido ou lítio conforme demanda. Veja outras configurações (3 rodas FE-Series, N-Series lítio 4T-5T e modelos pesados 7T-10T) nas variantes abaixo.',
    imagemCapa: '/images/un-br-eletrica-fseries.jpg',
    imagensGaleria: [
      '/images/un-br-eletrica-fseries.jpg',
      '/images/un-br-eletrica-nseries.jpg',
      '/images/un-br-eletrica-4t-5t.jpg',
      '/images/un-br-eletrica-3rodas.jpg',
    ],
    variantes: [
      { nome: '3 rodas FE-Series', capacidade: '1.500 - 2.000 kg' },
      { nome: 'F-Series 2.5T - 3.5T', capacidade: '2.500 - 3.500 kg' },
      { nome: 'N-Series 4T - 5T lítio', capacidade: '4.000 - 5.000 kg' },
      { nome: 'N-Series 7T - 10T', capacidade: '7.000 - 10.000 kg' },
    ],
  },
  {
    slug: 'retratil-lithium',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira Retrátil Lítio',
    titulo: 'Reach truck pra corredores estreitos',
    descricao:
      'Empilhadeira retrátil (reach truck) elétrica com bateria de lítio, ideal pra armazéns verticais e operações intensivas em corredores estreitos. O mastro retrátil avança e recua, permitindo trabalhar em ruas mais apertadas que uma contrabalançada tradicional, sem perder capacidade nem altura de elevação. Bateria de lítio entrega carga rápida (sem necessidade de troca de bateria) e operação contínua em turnos de alta demanda.',
    imagemCapa: '/images/un-br-eletrica-retratil.jpg',
    imagensGaleria: ['/images/un-br-eletrica-retratil.jpg'],
    variantes: [
      { nome: 'Retrátil 1.6T', capacidade: '1.600 kg' },
      { nome: 'Retrátil 2.0T', capacidade: '2.000 kg' },
    ],
  },
  {
    slug: 'off-road',
    categoriaPai: 'empilhadeiras',
    nome: 'Empilhadeira Off-Road (Todo-Terreno)',
    titulo: 'Tração 2WD/4WD para obras e terrenos difíceis',
    descricao:
      'Empilhadeira a diesel projetada pra terrenos irregulares: canteiros de obra, áreas externas, pisos de terra, lama e pedras. Disponível em 2WD (tração simples) e 4WD (tração nas 4 rodas) para máxima aderência. Pneus de borracha reforçada com banda larga, vão livre alto e robustez mecânica pra suportar o uso pesado fora do asfalto. Capacidades de 2.5T a 3.5T.',
    imagemCapa: '/images/un-br-diesel-todo-terreno.jpg',
    imagensGaleria: ['/images/un-br-diesel-todo-terreno.jpg'],
    variantes: [
      { nome: 'Off-Road 2.5T - 2WD', capacidade: '2.500 kg' },
      { nome: 'Off-Road 2.5T - 4WD', capacidade: '2.500 kg' },
      { nome: 'Off-Road 3.5T - 2WD', capacidade: '3.500 kg' },
      { nome: 'Off-Road 3.5T - 4WD', capacidade: '3.500 kg' },
    ],
  },
  {
    slug: 'paleteira-eletrica',
    categoriaPai: 'empilhadeiras',
    nome: 'Paleteira Elétrica Lítio',
    titulo: 'Movimentação de palets sem esforço',
    descricao:
      'Paleteira (transpaleteira) elétrica com bateria de lítio para movimentação de palets em armazéns, supermercados e indústrias. Modelos PTE15 (1.5T) e PTE20 (2.0T). Bateria de lítio com carga rápida e sem efeito memória — operação contínua em jornadas longas. Compacta, fácil de operar e ideal pra substituir a paleteira manual em operações de alta rotatividade.',
    imagemCapa: '/images/un-br-paleteira-lithium.jpg',
    imagensGaleria: ['/images/un-br-paleteira-lithium.jpg'],
    variantes: [
      { nome: 'PTE15 (lítio)', capacidade: '1.500 kg' },
      { nome: 'PTE20 (lítio)', capacidade: '2.000 kg' },
    ],
  },
  {
    slug: 'patolada',
    categoriaPai: 'empilhadeiras',
    nome: 'Patolada Elétrica',
    titulo: 'Empilhadeira pedestrian de elevação alta',
    descricao:
      'Patolada elétrica (stacker / empilhador pedestrian) para movimentação e empilhamento de palets a alturas elevadas em armazéns. Operação em pé ou caminhando, ocupa pouco espaço e atende operações que não justificam uma empilhadeira contrabalançada completa. Disponível em versões chumbo-ácido (PS16 e PW15) e em versão com bateria de lítio (1,6T a 2,0T), com carga rápida e sem efeito memória.',
    imagemCapa: '/images/un-br-patolada-ps16.jpg',
    imagensGaleria: ['/images/un-br-patolada-ps16.jpg', '/images/un-br-patolada-pw15.jpg'],
    variantes: [
      { nome: 'PS16 (operador em plataforma)', capacidade: '1.600 kg · até 5,5 m' },
      { nome: 'PW15 (operador em plataforma)', capacidade: '1.500 kg · até 5,5 m' },
      { nome: 'Operador andando 1.5T', capacidade: '1.500 kg' },
      { nome: 'Patolada Lítio 1.6T - 2.0T', capacidade: '1.600 - 2.000 kg' },
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
