'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Save, Download } from 'lucide-react';
import { TipoAtividade } from '@/components/portal/TipoAtividade';
import { MaquinaParadaRadio } from '@/components/portal/MaquinaParadaRadio';
import { IntervalsList } from '@/components/portal/IntervalsList';
import { SignaturePad } from '@/components/portal/SignaturePad';
import type { Report, ReportInterval } from '@/lib/reports/types';
import {
  type AdminEditableFields,
  adminSaveAndFinalize,
  adminUpsertInterval,
  adminDeleteInterval,
  adminUploadSignature,
  adminDeleteReport,
} from '../actions';

type ClientCompany = { id: string; name: string };

type Props = {
  report: Report;
  initialIntervals: ReportInterval[];
  signatureUrl: string | null;
  companies: ClientCompany[];
};

const STATUS_LABEL = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
} as const;

const STATUS_CLASS = {
  draft: 'bg-ink-100/15 text-ink-100',
  pending_approval: 'bg-brand-yellow/15 text-brand-yellow',
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-orange-500/15 text-orange-300',
} as const;

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
        inputMode={type === 'number' ? 'decimal' : undefined}
        className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function AdminEditarForm({ report, initialIntervals, signatureUrl, companies }: Props) {
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  // Combina sumário + produtos numa única textarea pra reduzir atrito no admin.
  // Tudo é gravado em sumario_defeitos; produtos vai como null daqui pra frente.
  const initialObs = [report.sumario_defeitos, report.produtos]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join('\n\n');

  const [fields, setFields] = useState<AdminEditableFields>({
    titulo: report.titulo,
    cliente_nome: report.cliente_nome,
    client_company_id: report.client_company_id,
    maquina_identificador: report.maquina_identificador,
    horimetro: Number(report.horimetro),
    is_preventiva: report.is_preventiva,
    is_corretiva: report.is_corretiva,
    maquina_parada: report.maquina_parada,
    sumario_defeitos: initialObs,
    produtos: null,
    responsavel_nome: report.responsavel_nome,
    assinatura_path: report.assinatura_path,
    preco_servicos: null,
    preco_pecas: null,
    preco_total: null,
  });
  const [intervals, setIntervals] = useState<ReportInterval[]>(initialIntervals);
  const [error, setError] = useState<string | null>(null);

  async function handleUpsertInterval(item: {
    id?: string;
    ordem: number;
    inicio: string;
    fim: string | null;
  }) {
    const res = await adminUpsertInterval(report.id, item);
    if (res.ok && res.data) {
      setIntervals((prev) => {
        const filtered = prev.filter((i) => i.id !== res.data!.id);
        return [
          ...filtered,
          {
            id: res.data!.id,
            report_id: report.id,
            ordem: item.ordem,
            inicio: item.inicio,
            fim: item.fim,
            created_at: new Date().toISOString(),
          },
        ];
      });
    }
  }

  async function handleDeleteInterval(id: string) {
    const res = await adminDeleteInterval(id, report.id);
    if (res.ok) setIntervals((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSignature(dataUrl: string) {
    const res = await adminUploadSignature(report.id, dataUrl);
    if (res.ok && res.data) {
      setFields((f) => ({ ...f, assinatura_path: res.data!.path }));
    } else if (!res.ok) {
      setError(res.error);
    }
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      const res = await adminSaveAndFinalize(report.id, fields);
      if (res.ok) router.push('/portal/admin/relatorios');
      else setError(res.error);
    });
  }

  function handleDelete() {
    if (!confirm('Excluir este relatório? Não dá pra desfazer.')) return;
    setError(null);
    startDelete(async () => {
      const res = await adminDeleteReport(report.id);
      if (!res.ok) setError(res.error);
      // se ok, redirect já foi disparado server-side
    });
  }

  return (
    <div className="space-y-8 pb-32">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-label uppercase tracking-wider text-ink-100/55">Relatório</p>
          <h1 className="mt-2 font-display text-h2 font-bold text-white">
            {fields.titulo || '(sem título)'}
            {report.numero ? ` · #${report.numero}` : ''}
          </h1>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-small ${STATUS_CLASS[report.status]}`}>
            {STATUS_LABEL[report.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {report.status === 'approved' && (
            <a
              href={`/portal/relatorios/${report.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-small text-white hover:border-brand-yellow/40"
            >
              <Download className="size-4" />
              Baixar PDF
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="inline-flex items-center gap-2 rounded-md border border-red-500/50 px-3 py-2 text-small text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </header>

      <Section title="Identificação">
        <Input
          label="Título"
          value={fields.titulo ?? ''}
          onChange={(v) => setFields({ ...fields, titulo: v })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Cliente (texto livre como o mecânico digitou)"
            value={fields.cliente_nome ?? ''}
            onChange={(v) => setFields({ ...fields, cliente_nome: v })}
          />
          <label className="block">
            <span className="text-small text-ink-100/70">Cliente cadastrado (pra liberar visualização no portal)</span>
            <select
              className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
              value={fields.client_company_id ?? ''}
              onChange={(e) =>
                setFields({ ...fields, client_company_id: e.target.value || null })
              }
            >
              <option value="">— selecione —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
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
          value={fields.maquina_parada}
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

      <Section title="Serviço executado">
        <label className="block">
          <span className="text-small text-ink-100/70">
            Observações do serviço (descrição, peças/materiais utilizados e valores)
          </span>
          <textarea
            className="mt-1 w-full min-h-[260px] rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
            value={fields.sumario_defeitos ?? ''}
            onChange={(e) => setFields({ ...fields, sumario_defeitos: e.target.value })}
            placeholder="O que foi feito, peças usadas e valores cobrados"
          />
        </label>
      </Section>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-small text-red-200">
          {error}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-ink-950 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button
            type="button"
            className="flex-1 rounded-md border border-white/20 px-4 py-3 text-white"
            onClick={() => router.push('/portal/admin/relatorios')}
          >
            Voltar
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-brand-yellow px-4 py-3 font-semibold text-black hover:brightness-110 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || deleting}
          >
            <Save className="size-4" />
            {saving ? 'Salvando...' : report.status === 'approved' ? 'Salvar alterações' : 'Salvar e finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
