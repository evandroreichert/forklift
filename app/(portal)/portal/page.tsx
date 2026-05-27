'use client';

import { useState } from 'react';
import { DashboardStats } from '@/components/portal/DashboardStats';
import { MaintenanceCard } from '@/components/portal/MaintenanceCard';
import { MaintenanceDialog } from '@/components/portal/MaintenanceDialog';
import { CLIENTE_DEMO } from '@/data/mock/cliente';
import { getManutencoesRecentes } from '@/data/mock/manutencoes';
import type { Manutencao } from '@/lib/types';

export default function PortalPage() {
  const [selected, setSelected] = useState<Manutencao | null>(null);
  const [open, setOpen] = useState(false);
  const manutencoes = getManutencoesRecentes();

  function handleOpen(m: Manutencao) {
    setSelected(m);
    setOpen(true);
  }

  return (
    <div className="space-y-12">
      <div>
        <p className="text-label uppercase tracking-wider text-ink-100/55">Bem-vindo</p>
        <h1 className="mt-2 font-display text-h1 font-bold text-white">
          Olá, <span className="text-brand-yellow">{CLIENTE_DEMO.nomeEmpresa}</span>
        </h1>
        <p className="mt-2 text-body text-ink-100/65">
          Acompanhe relatórios técnicos da sua frota.
        </p>
      </div>

      <DashboardStats />

      <div>
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
          <h2 className="font-display text-h2 font-bold text-white">Manutenções recentes</h2>
          <p className="text-small text-ink-100/60">{manutencoes.length} no total</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {manutencoes.map((m) => (
            <MaintenanceCard key={m.id} manutencao={m} onClick={() => handleOpen(m)} />
          ))}
        </div>
      </div>

      <MaintenanceDialog manutencao={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
