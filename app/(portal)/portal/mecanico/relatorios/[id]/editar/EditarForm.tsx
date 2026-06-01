'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TipoAtividade } from '@/components/portal/TipoAtividade';
import { MaquinaParadaRadio } from '@/components/portal/MaquinaParadaRadio';
import { IntervalsList } from '@/components/portal/IntervalsList';
import { SignaturePad } from '@/components/portal/SignaturePad';
import { AutoSaveStatus, type AutoSaveState } from '@/components/portal/AutoSaveStatus';
import { RejectedBanner } from '@/components/portal/RejectedBanner';
import type { Report, ReportEditable, ReportInterval } from '@/lib/reports/types';
import {
  updateDraft,
  upsertInterval,
  deleteInterval,
  uploadSignatureAction,
  submitReport,
} from '../../actions';

type Props = {
  report: Report;
  initialIntervals: ReportInterval[];
  signatureUrl: string | null;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-label uppercase tracking-wider text-ink-100/55">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-small text-ink-100/70">{label}</span>
      <input
        type={type}
        className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="w-full min-h-[120px] rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function EditarForm({ report, initialIntervals, signatureUrl }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [fields, setFields] = useState<Partial<ReportEditable>>({
    titulo: report.titulo,
    cliente_nome: report.cliente_nome,
    maquina_identificador: report.maquina_identificador,
    horimetro: Number(report.horimetro),
    is_preventiva: report.is_preventiva,
    is_corretiva: report.is_corretiva,
    maquina_parada: report.maquina_parada,
    sumario_defeitos: report.sumario_defeitos,
    produtos: report.produtos ?? '',
    responsavel_nome: report.responsavel_nome ?? '',
    assinatura_path: report.assinatura_path,
  });
  const [intervals, setIntervals] = useState<ReportInterval[]>(initialIntervals);
  const [autoSave, setAutoSave] = useState<AutoSaveState>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstRunRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setAutoSave('saving');
    timerRef.current = setTimeout(async () => {
      const res = await updateDraft(report.id, fields);
      if (res.ok) {
        setAutoSave('saved');
        setLastSaved(new Date());
      } else {
        setAutoSave('error');
      }
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fields, report.id]);

  async function handleUpsertInterval(item: {
    id?: string;
    ordem: number;
    inicio: string;
    fim: string | null;
  }) {
    const res = await upsertInterval(report.id, item);
    if (res.ok && res.data) {
      const created: ReportInterval = {
        id: res.data.id,
        report_id: report.id,
        ordem: item.ordem,
        inicio: item.inicio,
        fim: item.fim,
        created_at: new Date().toISOString(),
      };
      setIntervals((prev) => {
        const filtered = prev.filter((i) => i.id !== created.id);
        return [...filtered, created];
      });
    }
  }

  async function handleDeleteInterval(id: string) {
    const res = await deleteInterval(id, report.id);
    if (res.ok) setIntervals((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSignature(dataUrl: string) {
    const res = await uploadSignatureAction(report.id, dataUrl);
    if (res.ok && res.data) {
      setFields((f) => ({ ...f, assinatura_path: res.data!.path }));
    } else if (!res.ok) {
      setError(res.error);
    }
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await submitReport(report.id);
      if (res.ok) router.push('/portal/mecanico/relatorios');
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-8 pb-32">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-white">Editar relatório</h1>
        <AutoSaveStatus state={autoSave} lastSavedAt={lastSaved} />
      </header>

      {report.status === 'rejected' && report.rejected_reason && (
        <RejectedBanner reason={report.rejected_reason} />
      )}

      <Section title="Identificação">
        <Input
          label="Título"
          value={fields.titulo ?? ''}
          onChange={(v) => setFields({ ...fields, titulo: v })}
        />
        <Input
          label="Cliente"
          value={fields.cliente_nome ?? ''}
          onChange={(v) => setFields({ ...fields, cliente_nome: v })}
        />
        <Input
          label="Identificador da máquina"
          value={fields.maquina_identificador ?? ''}
          onChange={(v) => setFields({ ...fields, maquina_identificador: v })}
        />
        <Input
          label="Horímetro"
          type="number"
          value={String(fields.horimetro ?? 0)}
          onChange={(v) => setFields({ ...fields, horimetro: Number(v) })}
        />
      </Section>

      <Section title="Tipo de atividade">
        <TipoAtividade
          preventiva={!!fields.is_preventiva}
          corretiva={!!fields.is_corretiva}
          onChange={({ preventiva, corretiva }) =>
            setFields({ ...fields, is_preventiva: preventiva, is_corretiva: corretiva })
          }
        />
      </Section>

      <Section title="Máquina parada">
        <MaquinaParadaRadio
          value={fields.maquina_parada ?? null}
          onChange={(v) => setFields({ ...fields, maquina_parada: v })}
        />
      </Section>

      <Section title="Intervalos (início e fim)">
        <IntervalsList
          intervals={intervals}
          onUpsert={handleUpsertInterval}
          onDelete={handleDeleteInterval}
        />
      </Section>

      <Section title="Sumário dos defeitos executados">
        <Textarea
          value={fields.sumario_defeitos ?? ''}
          onChange={(v) => setFields({ ...fields, sumario_defeitos: v })}
        />
      </Section>

      <Section title="Produtos / peças utilizadas">
        <Textarea
          value={fields.produtos ?? ''}
          onChange={(v) => setFields({ ...fields, produtos: v })}
        />
      </Section>

      <Section title="Responsável (cliente)">
        <Input
          label="Nome do responsável"
          value={fields.responsavel_nome ?? ''}
          onChange={(v) => setFields({ ...fields, responsavel_nome: v })}
        />
        <div className="mt-4">
          <span className="text-small text-ink-100/70">Assinatura</span>
          <SignaturePad initialUrl={signatureUrl} onConfirm={handleSignature} />
          {fields.assinatura_path && !signatureUrl && (
            <p className="mt-2 text-small text-emerald-400">Assinatura registrada</p>
          )}
        </div>
      </Section>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-small text-red-200">
          {error}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-ink-950 p-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button
            type="button"
            className="flex-1 rounded-md border border-white/20 px-4 py-3 text-white"
            onClick={() => router.push('/portal/mecanico/relatorios')}
          >
            Salvar e sair
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-brand-yellow px-4 py-3 font-semibold text-black disabled:opacity-50"
            onClick={handleSubmit}
            disabled={pending}
          >
            {pending ? 'Enviando...' : 'Enviar pra aprovação'}
          </button>
        </div>
      </div>
    </div>
  );
}
