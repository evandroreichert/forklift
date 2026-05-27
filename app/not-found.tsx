import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-50 px-6">
      <div className="text-center">
        <p className="font-mono text-small text-brand-yellow">404</p>
        <h1 className="mt-4 font-display text-h1 text-ink-950">Página não encontrada</h1>
        <p className="mt-4 max-w-md text-body text-ink-500">
          A página que você procura não existe ou foi movida. Volte para o início ou explore o catálogo.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950"
          >
            Ir para a home
          </Link>
          <Link
            href="/empilhadeiras"
            className="border border-paper-300 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:border-brand-yellow hover:text-brand-yellow"
          >
            Ver empilhadeiras
          </Link>
        </div>
      </div>
    </main>
  );
}
