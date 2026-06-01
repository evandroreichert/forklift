'use client';

import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

type Props = {
  initialUrl?: string | null;
  onConfirm: (pngDataUrl: string) => void | Promise<void>;
  disabled?: boolean;
};

export function SignaturePad({ initialUrl, onConfirm, disabled }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);
  // displayUrl pode ser: initialUrl (carregado do server), ou data URL local recém capturado.
  // Mantemos separado pra mostrar feedback imediato após "Confirmar" mesmo antes do
  // upload propagar de volta.
  const [displayUrl, setDisplayUrl] = useState<string | null>(initialUrl ?? null);
  const [saving, setSaving] = useState(false);

  if (displayUrl) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-lg border border-emerald-500/40 bg-white">
          <img
            src={displayUrl}
            alt="Assinatura do cliente"
            className="w-full rounded-lg"
          />
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white">
            <Check className="size-3" />
            Registrada
          </span>
        </div>
        <button
          type="button"
          className="text-small text-ink-100/70 underline"
          disabled={disabled}
          onClick={() => setDisplayUrl(null)}
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
              setDisplayUrl(dataUrl);
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
