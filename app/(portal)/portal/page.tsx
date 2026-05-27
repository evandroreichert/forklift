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
    <div className="space-y-10">
      <div>
        <p className="text-label uppercase text-ink-300">Bem-vindo</p>
        <h1 className="mt-2 font-display text-h1 text-ink-50">
          Olá, <span className="text-brand-yellow">{CLIENTE_DEMO.nomeEmpresa}</span>
        </h1>
      </div>

      <DashboardStats />

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-h2 text-ink-50">Manutenções recentes</h2>
          <p className="text-small text-ink-300">{manutencoes.length} no total</p>
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
