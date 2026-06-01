import { AlertTriangle } from 'lucide-react';

export function RejectedBanner({ reason }: { reason: string }) {
  return (
    <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-200">
        <AlertTriangle className="size-4" />
        <span className="font-semibold">Relatório rejeitado pelo admin</span>
      </div>
      <p className="text-small text-orange-100/90 whitespace-pre-wrap">{reason}</p>
    </div>
  );
}
