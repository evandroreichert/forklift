'use client';

import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { MANUTENCOES_DEMO } from '@/data/mock/manutencoes';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-paper-200 bg-paper-100 p-6">
      <p className="text-label uppercase text-ink-500">{label}</p>
      <p className="mt-3 font-display text-h2 text-ink-950">{value}</p>
      {hint && <p className="mt-2 text-small text-ink-500">{hint}</p>}
    </div>
  );
}

export function DashboardStats() {
  const equipamentosAtivos = EQUIPAMENTOS_DEMO.length;
  const agora = new Date();
  const mesAtual = agora.toISOString().slice(0, 7);
  const noMes = MANUTENCOES_DEMO.filter(
    (m) => m.data.startsWith(mesAtual) && m.status === 'concluida',
  ).length;
  const pendentes = MANUTENCOES_DEMO.filter((m) => m.status === 'em_andamento').length;
  const proximaAgendada = MANUTENCOES_DEMO
    .filter((m) => m.status === 'agendada' && m.data >= agora.toISOString().slice(0, 10))
    .sort((a, b) => a.data.localeCompare(b.data))[0];

  const proxEquip = proximaAgendada
    ? EQUIPAMENTOS_DEMO.find((e) => e.id === proximaAgendada.equipamentoId)
    : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Equipamentos ativos" value={String(equipamentosAtivos)} />
      <Stat label="Manutenções no mês" value={String(noMes)} hint="Concluídas" />
      <Stat
        label="Próxima agendada"
        value={proximaAgendada ? new Date(proximaAgendada.data).toLocaleDateString('pt-BR') : '—'}
        hint={proxEquip?.modelo}
      />
      <Stat label="Em andamento" value={String(pendentes)} />
    </div>
  );
}
