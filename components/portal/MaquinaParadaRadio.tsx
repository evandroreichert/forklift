'use client';

type Props = {
  value: boolean | null;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export function MaquinaParadaRadio({ value, onChange, disabled }: Props) {
  const options: { label: string; val: boolean }[] = [
    { label: 'Sim', val: true },
    { label: 'Não', val: false },
  ];

  const naoRespondido = value === null;

  return (
    <div className="space-y-2">
      <div
        className={`grid gap-2 sm:grid-cols-2 ${naoRespondido ? 'rounded-lg ring-1 ring-orange-500/40' : ''}`}
      >
        {options.map(({ label, val }) => (
          <label
            key={label}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
              value === val
                ? 'border-brand-yellow/60 bg-brand-yellow/5'
                : 'border-white/15 bg-ink-900/40 hover:border-white/30'
            }`}
          >
            <input
              type="radio"
              name="maquina_parada"
              className="size-5 accent-brand-yellow"
              checked={value === val}
              disabled={disabled}
              onChange={() => onChange(val)}
            />
            <span className="text-white">{label}</span>
          </label>
        ))}
      </div>
      {naoRespondido && (
        <p className="text-xs text-orange-300/80">Selecione uma opção (obrigatório).</p>
      )}
    </div>
  );
}
