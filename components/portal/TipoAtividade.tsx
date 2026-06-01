'use client';

type Props = {
  preventiva: boolean;
  corretiva: boolean;
  onChange: (next: { preventiva: boolean; corretiva: boolean }) => void;
  disabled?: boolean;
};

export function TipoAtividade({ preventiva, corretiva, onChange, disabled }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="flex items-center gap-3 rounded-lg border border-white/15 bg-ink-900/40 px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          className="size-5 accent-brand-yellow"
          checked={preventiva}
          disabled={disabled}
          onChange={(e) => onChange({ preventiva: e.target.checked, corretiva })}
        />
        <span className="text-white">Preventiva</span>
      </label>
      <label className="flex items-center gap-3 rounded-lg border border-white/15 bg-ink-900/40 px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          className="size-5 accent-brand-yellow"
          checked={corretiva}
          disabled={disabled}
          onChange={(e) => onChange({ preventiva, corretiva: e.target.checked })}
        />
        <span className="text-white">Corretiva</span>
      </label>
    </div>
  );
}
