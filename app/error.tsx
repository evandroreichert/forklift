'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-50 px-6">
      <div className="text-center">
        <p className="font-mono text-small text-brand-yellow">500</p>
        <h1 className="mt-4 font-display text-h1 text-ink-950">Algo deu errado</h1>
        <p className="mt-4 max-w-md text-body text-ink-500">
          Ocorreu um erro inesperado. Tente recarregar a página ou volte para o início.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="border border-paper-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:border-brand-yellow hover:text-brand-yellow"
          >
            Ir para a home
          </Link>
        </div>
      </div>
    </main>
  );
}
