'use client';

import { useEffect, useState } from 'react';

type Props = {
  /** Valor atual em ISO (UTC). Null = vazio. */
  value: string | null;
  /** Chamado quando ambos os campos formam uma data válida (ou quando limpa). */
  onChange: (iso: string | null) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function isoToParts(iso: string | null): { data: string; hora: string } {
  if (!iso) return { data: '', hora: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { data: '', hora: '' };
  return {
    data: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function partsToIso(data: string, hora: string): string | null {
  const dMatch = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const hMatch = hora.match(/^(\d{2}):(\d{2})$/);
  if (!dMatch || !hMatch) return null;
  const dia = Number(dMatch[1]);
  const mes = Number(dMatch[2]);
  const ano = Number(dMatch[3]);
  const h = Number(hMatch[1]);
  const m = Number(hMatch[2]);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || h > 23 || m > 59) return null;
  const local = new Date(ano, mes - 1, dia, h, m);
  if (isNaN(local.getTime())) return null;
  // Rejeita data inválida do tipo 31/02 (Date faz overflow pra mar/01)
  if (local.getDate() !== dia || local.getMonth() !== mes - 1) return null;
  return local.toISOString();
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join('/');
}

function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

export function DateTimeBRInput({ value, onChange, disabled, ariaLabel }: Props) {
  const init = isoToParts(value);
  const [data, setData] = useState(init.data);
  const [hora, setHora] = useState(init.hora);

  // Re-sincroniza quando o valor externo muda (ex: load do server, ou item recém-criado)
  useEffect(() => {
    const next = isoToParts(value);
    setData(next.data);
    setHora(next.hora);
  }, [value]);

  function commit(nextData: string, nextHora: string) {
    if (!nextData && !nextHora) {
      onChange(null);
      return;
    }
    const iso = partsToIso(nextData, nextHora);
    if (iso) onChange(iso);
  }

  // Validação visual: input completo (atingiu maxLength) mas não bate com o regex.
  // Vermelho avisa o usuário que algo está errado antes dele tentar salvar.
  const dataCompleta = data.length === 10;
  const horaCompleta = hora.length === 5;
  const dataInvalida = dataCompleta && !partsToIso(data, '00:00');
  const horaInvalida =
    horaCompleta && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora);

  const baseClasses = 'rounded-md border bg-ink-950 px-3 py-2 text-white tracking-wider';
  const dataClasses = `flex-1 ${baseClasses} ${dataInvalida ? 'border-red-500/60' : 'border-white/15'}`;
  const horaClasses = `w-24 ${baseClasses} ${horaInvalida ? 'border-red-500/60' : 'border-white/15'}`;

  return (
    <div className="space-y-1" aria-label={ariaLabel}>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className={dataClasses}
          disabled={disabled}
          value={data}
          onChange={(e) => {
            const masked = maskDate(e.target.value);
            setData(masked);
            commit(masked, hora);
          }}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="HH:MM"
          maxLength={5}
          className={horaClasses}
          disabled={disabled}
          value={hora}
          onChange={(e) => {
            const masked = maskTime(e.target.value);
            setHora(masked);
            commit(data, masked);
          }}
        />
      </div>
      {(dataInvalida || horaInvalida) && (
        <p className="text-xs text-red-400">
          {dataInvalida && 'Data inválida. '}
          {horaInvalida && 'Hora inválida (use 00:00 a 23:59).'}
        </p>
      )}
    </div>
  );
}
