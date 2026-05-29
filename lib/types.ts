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

// Portal — domain types (Fatia 1)
import type { Database } from '@/lib/database.types';

export type UserRole = Database['public']['Enums']['user_role'];
export type FuelType = Database['public']['Enums']['fuel_type'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ClientCompany = Database['public']['Tables']['client_companies']['Row'];
export type Machine = Database['public']['Tables']['machines']['Row'];
