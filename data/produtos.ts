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
