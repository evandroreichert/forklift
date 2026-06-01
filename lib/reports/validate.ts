import type { ReportEditable, ReportInterval } from './types';

export type ValidationError = { field: string; message: string };

export function validateForSubmit(
  report: Partial<ReportEditable>,
  intervals: Pick<ReportInterval, 'inicio' | 'fim'>[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!report.titulo?.trim()) errors.push({ field: 'titulo', message: 'Título obrigatório' });
  if (!report.cliente_nome?.trim())
    errors.push({ field: 'cliente_nome', message: 'Nome do cliente obrigatório' });
  if (!report.maquina_identificador?.trim())
    errors.push({
      field: 'maquina_identificador',
      message: 'Identificador da máquina obrigatório',
    });
  if (report.horimetro == null || report.horimetro < 0)
    errors.push({ field: 'horimetro', message: 'Horímetro inválido' });
  if (!report.is_preventiva && !report.is_corretiva)
    errors.push({
      field: 'tipo_atividade',
      message: 'Marque pelo menos um tipo (preventiva ou corretiva)',
    });
  if (report.maquina_parada == null)
    errors.push({ field: 'maquina_parada', message: 'Informe se a máquina ficou parada' });
  if (!report.sumario_defeitos?.trim())
    errors.push({ field: 'sumario_defeitos', message: 'Sumário dos defeitos obrigatório' });
  if (!report.responsavel_nome?.trim())
    errors.push({ field: 'responsavel_nome', message: 'Nome do responsável obrigatório' });
  if (!report.assinatura_path)
    errors.push({ field: 'assinatura', message: 'Assinatura do cliente obrigatória' });
  if (intervals.length === 0)
    errors.push({ field: 'intervalos', message: 'Adicione pelo menos um intervalo' });
  if (intervals.some((i) => !i.fim))
    errors.push({
      field: 'intervalos',
      message: 'Todos os intervalos precisam de horário de fim',
    });

  return errors;
}
