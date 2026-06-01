import type { Database } from '@/lib/database.types';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];
export type ReportInterval = Database['public']['Tables']['report_intervals']['Row'];
export type ReportStatus = Database['public']['Enums']['report_status'];

export type ReportWithIntervals = Report & { intervals: ReportInterval[] };

export type ReportEditable = Pick<
  Report,
  | 'titulo'
  | 'cliente_nome'
  | 'maquina_identificador'
  | 'horimetro'
  | 'is_preventiva'
  | 'is_corretiva'
  | 'maquina_parada'
  | 'sumario_defeitos'
  | 'produtos'
  | 'responsavel_nome'
  | 'assinatura_path'
>;
