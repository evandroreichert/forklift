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

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map(({ label, val }) => (
        <label
          key={label}
          className="flex items-center gap-3 rounded-lg border border-white/15 bg-ink-900/40 px-4 py-3 cursor-pointer"
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
  );
}
