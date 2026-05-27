'use client';

import { EQUIPAMENTOS_DEMO } from '@/data/mock/equipamentos';
import { MANUTENCOES_DEMO } from '@/data/mock/manutencoes';
import { Truck, CheckCircle2, CalendarClock, Activity } from 'lucide-react';

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md bg-brand-yellow/10 text-brand-yellow">
          <Icon className="size-4" />
        </div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">{label}</p>
      </div>
      <p className="mt-4 font-display text-h2 font-bold text-white">{value}</p>
      {hint && <p className="mt-1.5 text-small text-ink-100/60">{hint}</p>}
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
      <Stat label="Equipamentos ativos" value={String(equipamentosAtivos)} icon={Truck} />
      <Stat label="Manutenções no mês" value={String(noMes)} hint="Concluídas" icon={CheckCircle2} />
      <Stat
        label="Próxima agendada"
        value={proximaAgendada ? new Date(proximaAgendada.data).toLocaleDateString('pt-BR') : '—'}
        hint={proxEquip?.modelo}
        icon={CalendarClock}
      />
      <Stat label="Em andamento" value={String(pendentes)} icon={Activity} />
    </div>
  );
}
