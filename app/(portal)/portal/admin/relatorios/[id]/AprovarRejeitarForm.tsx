'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { approveReport, rejectReport } from '../actions';

type ClientCompany = { id: string; name: string };

type Props = {
  reportId: string;
  companies: ClientCompany[];
};

function parseMoney(v: string): number {
  return Number(v.replace(/\./g, '').replace(',', '.')) || 0;
}

export function AprovarRejeitarForm({ reportId, companies }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [clientCompanyId, setClientCompanyId] = useState('');
  const [precoServicos, setPrecoServicos] = useState('0,00');
  const [precoPecas, setPrecoPecas] = useState('0,00');
  const [precoTotal, setPrecoTotal] = useState('0,00');

  const [motivo, setMotivo] = useState('');

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveReport({
        reportId,
        clientCompanyId,
        precoServicos: parseMoney(precoServicos),
        precoPecas: parseMoney(precoPecas),
        precoTotal: parseMoney(precoTotal),
      });
      if (res.ok) router.push('/portal/admin/relatorios');
      else setError(res.error);
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectReport(reportId, motivo);
      if (res.ok) router.push('/portal/admin/relatorios');
      else setError(res.error);
    });
  }

  if (mode === 'idle') {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setMode('approve')}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-3 text-small font-semibold text-black hover:brightness-110"
        >
          <CheckCircle2 className="size-4" />
          Aprovar
        </button>
        <button
          type="button"
          onClick={() => setMode('reject')}
          className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-small font-semibold text-black hover:brightness-110"
        >
          <XCircle className="size-4" />
          Rejeitar
        </button>
      </div>
    );
  }

  if (mode === 'approve') {
    return (
      <div className="space-y-4 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-5">
        <h3 className="font-display text-h3 font-bold text-white">Aprovar relatório</h3>

        <label className="block">
          <span className="text-small text-ink-100/70">Empresa-cliente</span>
          <select
            className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
            value={clientCompanyId}
            onChange={(e) => setClientCompanyId(e.target.value)}
          >
            <option value="">— selecione —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyInput label="Preço serviços (R$)" value={precoServicos} onChange={setPrecoServicos} />
          <MoneyInput label="Preço peças (R$)" value={precoPecas} onChange={setPrecoPecas} />
          <MoneyInput label="Preço total (R$)" value={precoTotal} onChange={setPrecoTotal} />
        </div>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-small text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-white/20 px-4 py-2 text-small text-white"
            onClick={() => setMode('idle')}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-md bg-emerald-500 px-5 py-2 text-small font-semibold text-black hover:brightness-110 disabled:opacity-50"
            onClick={handleApprove}
            disabled={pending}
          >
            {pending ? 'Aprovando...' : 'Confirmar aprovação'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-orange-500/40 bg-orange-500/5 p-5">
      <h3 className="font-display text-h3 font-bold text-white">Rejeitar relatório</h3>

      <label className="block">
        <span className="text-small text-ink-100/70">
          Motivo (será enviado ao mecânico por email)
        </span>
        <textarea
          className="mt-1 w-full min-h-[120px] rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: Faltou descrever a peça substituída no eixo."
        />
      </label>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-small text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-white/20 px-4 py-2 text-small text-white"
          onClick={() => setMode('idle')}
          disabled={pending}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="rounded-md bg-orange-500 px-5 py-2 text-small font-semibold text-black hover:brightness-110 disabled:opacity-50"
          onClick={handleReject}
          disabled={pending || !motivo.trim()}
        >
          {pending ? 'Rejeitando...' : 'Confirmar rejeição'}
        </button>
      </div>
    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-small text-ink-100/70">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
