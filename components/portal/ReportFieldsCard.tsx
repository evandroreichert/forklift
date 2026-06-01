import type { ReportWithIntervals } from '@/lib/reports/types';

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-small text-ink-100/55">{label}</dt>
      <dd className="text-white">{value || '—'}</dd>
    </div>
  );
}

export function ReportFieldsCard({
  report,
  signatureUrl,
}: {
  report: ReportWithIntervals;
  signatureUrl: string | null;
}) {
  const tipos: string[] = [];
  if (report.is_preventiva) tipos.push('Preventiva');
  if (report.is_corretiva) tipos.push('Corretiva');

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Identificação</h2>
        <dl className="grid gap-3 sm:grid-cols-2 rounded-lg border border-white/10 bg-ink-900/40 p-4">
          <Field label="Título" value={report.titulo} />
          <Field label="Cliente" value={report.cliente_nome} />
          <Field label="Máquina" value={report.maquina_identificador} />
          <Field label="Horímetro" value={String(report.horimetro)} />
          <Field label="Tipo" value={tipos.join(' & ')} />
          <Field label="Máquina parada" value={report.maquina_parada ? 'Sim' : 'Não'} />
        </dl>
      </section>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Intervalos</h2>
        <div className="space-y-2">
          {report.intervals.length === 0 && (
            <p className="text-small text-ink-100/60">Nenhum intervalo registrado.</p>
          )}
          {report.intervals.map((iv) => (
            <div key={iv.id} className="rounded-lg border border-white/10 bg-ink-900/40 p-4">
              <p className="text-small font-semibold text-brand-yellow">
                DIA {String(iv.ordem).padStart(2, '0')}
              </p>
              <p className="text-small text-ink-100/80">Início: {fmt(iv.inicio)}</p>
              <p className="text-small text-ink-100/80">Fim: {fmt(iv.fim)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">
          Sumário dos defeitos
        </h2>
        <p className="rounded-lg border border-white/10 bg-ink-900/40 p-4 text-white whitespace-pre-wrap">
          {report.sumario_defeitos || '—'}
        </p>
      </section>

      {report.produtos && (
        <section>
          <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">
            Produtos / peças
          </h2>
          <p className="rounded-lg border border-white/10 bg-ink-900/40 p-4 text-white whitespace-pre-wrap">
            {report.produtos}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-label uppercase tracking-wider text-ink-100/55 mb-2">Responsável</h2>
        <div className="rounded-lg border border-white/10 bg-ink-900/40 p-4 space-y-3">
          <p className="text-white">{report.responsavel_nome ?? '—'}</p>
          {signatureUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signatureUrl}
              alt="Assinatura"
              className="w-full max-w-md rounded-md bg-white"
            />
          )}
        </div>
      </section>
    </div>
  );
}
