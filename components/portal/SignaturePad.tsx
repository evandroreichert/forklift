'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type Props = {
  initialUrl?: string | null;
  onConfirm: (pngDataUrl: string) => void | Promise<void>;
  disabled?: boolean;
};

export function SignaturePad({ initialUrl, onConfirm, disabled }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);
  const [confirmed, setConfirmed] = useState(!!initialUrl);
  const [saving, setSaving] = useState(false);

  if (confirmed && initialUrl) {
    return (
      <div className="space-y-3">
        <img
          src={initialUrl}
          alt="Assinatura do cliente"
          className="w-full rounded-lg border border-white/15 bg-white"
        />
        <button
          type="button"
          className="text-small text-ink-100/70 underline"
          disabled={disabled}
          onClick={() => setConfirmed(false)}
        >
          Coletar nova assinatura
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/15 bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="black"
          canvasProps={{
            className: 'w-full h-[200px] rounded-lg',
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-white/15 px-4 py-2 text-small text-white"
          disabled={disabled || saving}
          onClick={() => ref.current?.clear()}
        >
          Limpar
        </button>
        <button
          type="button"
          className="rounded-md bg-brand-yellow px-4 py-2 text-small font-semibold text-black disabled:opacity-50"
          disabled={disabled || saving}
          onClick={async () => {
            if (!ref.current || ref.current.isEmpty()) return;
            setSaving(true);
            const dataUrl = ref.current.toDataURL('image/png');
            try {
              await onConfirm(dataUrl);
              setConfirmed(true);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Salvando...' : 'Confirmar assinatura'}
        </button>
      </div>
    </div>
  );
}
