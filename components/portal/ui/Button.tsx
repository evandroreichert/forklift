import * as React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-yellow text-ink-950 hover:brightness-110 disabled:opacity-50',
  secondary:
    'border border-white/20 text-white hover:border-brand-yellow/40 disabled:opacity-50',
  danger:
    'border border-red-500/50 text-red-300 hover:bg-red-500/10 disabled:opacity-50',
  ghost:
    'text-ink-100/80 hover:bg-white/5 hover:text-white disabled:opacity-50',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-2 text-small',
  md: 'px-4 py-2.5 text-small',
};

type Props = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { children: React.ReactNode };

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  leftIcon,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: Props) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      {children}
    </button>
  );
}
