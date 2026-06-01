import * as React from 'react';

// Header padrão pra páginas top-level do portal: kicker (label uppercase) + h1 + ação opcional à direita.
export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {kicker && (
          <p className="text-label uppercase tracking-wider text-ink-100/55">{kicker}</p>
        )}
        <h1 className="mt-2 font-display text-h1 font-bold text-white">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-small text-ink-100/60">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
