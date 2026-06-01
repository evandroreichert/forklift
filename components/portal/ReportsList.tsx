import Link from 'next/link';
import { Download, ClipboardList } from 'lucide-react';
import type { Report } from '@/lib/reports/types';

const STATUS_LABEL: Record<Report['status'], string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const STATUS_CLASS: Record<Report['status'], string> = {
  draft: 'bg-ink-100/15 text-ink-100',
  pending_approval: 'bg-brand-yellow/15 text-brand-yellow',
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-orange-500/15 text-orange-300',
};

export function ReportsList({
  reports,
  basePath,
  emptyMessage,
}: {
  reports: Report[];
  basePath: string;
  emptyMessage: string;
}) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-ink-900/40 p-10 text-center">
        <ClipboardList className="mx-auto size-10 text-ink-100/30" />
        <p className="mt-4 text-small text-ink-100/70">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li
          key={r.id}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-ink-900/40 p-4 hover:border-brand-yellow/40"
        >
          <Link
            href={`${basePath}/${r.id}`}
            className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 min-w-0"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{r.titulo || '(sem título)'}</p>
              <p className="truncate text-small text-ink-100/70">
                {r.cliente_nome || '(cliente vazio)'} · Máquina {r.maquina_identificador || '—'}
              </p>
            </div>
            <span
              className={`shrink-0 self-start whitespace-nowrap rounded-full px-3 py-1 text-small sm:self-auto ${STATUS_CLASS[r.status]}`}
            >
              {STATUS_LABEL[r.status]}
              {r.numero ? ` · #${r.numero}` : ''}
            </span>
          </Link>
          {r.status === 'approved' && (
            <a
              href={`/portal/relatorios/${r.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-white/15 text-ink-100/70 transition-colors hover:border-brand-yellow/40 hover:text-brand-yellow"
              aria-label="Baixar PDF"
              title="Baixar PDF"
            >
              <Download className="size-5" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
