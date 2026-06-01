'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

type Props = {
  reportId: string;
  maquinaIdentificador: string | null;
  className?: string;
};

const defaultClass =
  'inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-small text-white hover:border-brand-yellow/40 disabled:cursor-not-allowed disabled:opacity-50';

export function ShareReportButton({ reportId, maquinaIdentificador, className }: Props) {
  const [loading, setLoading] = useState(false);

  const text = `Segue relatório de manutenção da máquina ${maquinaIdentificador || '—'} — FB Empilhadeiras`;

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/portal/relatorios/${reportId}/pdf`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], `relatorio-${reportId}.pdf`, {
        type: 'application/pdf',
      });

      const shareData: ShareData = {
        files: [file],
        title: 'Relatório FB Empilhadeiras',
        text,
      };

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        typeof navigator.share === 'function' &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // outros erros do share: cai pro fallback abaixo
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `relatorio-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      const waText = encodeURIComponent(`${text} (PDF baixado, anexe na conversa)`);
      window.open(`https://wa.me/?text=${waText}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Falha ao compartilhar relatório:', err);
      alert('Não consegui preparar o PDF pra compartilhar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className={className ?? defaultClass}
      aria-label="Compartilhar relatório no WhatsApp"
    >
      <Share2 className="size-4" />
      {loading ? 'Preparando…' : 'Compartilhar'}
    </button>
  );
}
