import * as React from 'react';

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-label uppercase tracking-wider text-ink-100/55">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-small text-ink-100/70">{label}</span>
      <input
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function FormTextarea({
  value,
  onChange,
  minHeight = 120,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  minHeight?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className={`w-full rounded-md border border-white/15 bg-ink-950 px-3 py-2 text-white`}
      style={{ minHeight }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
