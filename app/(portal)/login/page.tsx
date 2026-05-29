'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/public/Logo';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { loginAction, type LoginState } from './actions';

const INITIAL: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const searchParams = useSearchParams();
  const inactiveError = searchParams.get('error') === 'inactive'
    ? 'Sua conta foi desativada. Contate o admin.'
    : null;
  const displayError = state.error ?? inactiveError;

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-6 py-12 text-white">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,227,75,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      <div className="absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-brand-yellow/10 blur-3xl" aria-hidden />
      <div className="absolute -right-32 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-brand-yellow/5 blur-3xl" aria-hidden />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-small text-ink-100/70 transition-colors hover:text-brand-yellow">
          <ArrowLeft className="size-4" />
          Voltar ao site
        </Link>

        <Logo className="brightness-0 invert" />

        <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-ink-900/60 backdrop-blur-sm">
          <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent px-8 py-6">
            <p className="inline-flex items-center gap-2 text-label uppercase tracking-[0.18em] text-brand-yellow">
              <ShieldCheck className="size-3.5" />
              Acesso restrito
            </p>
            <h1 className="mt-3 font-display text-h2 font-bold text-white">Portal FB Empilhadeiras</h1>
            <p className="mt-2 text-small text-ink-100/65">
              Acesso para mecânicos, clientes e administradores.
            </p>
          </div>

          <form action={formAction} className="space-y-5 px-8 py-7">
            <div>
              <Label htmlFor="email" className="text-ink-100">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 border-white/15 bg-ink-950/50 text-white placeholder:text-ink-300"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-ink-100">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-2 border-white/15 bg-ink-950/50 text-white placeholder:text-ink-300"
                placeholder="••••••••"
              />
            </div>

            {displayError && (
              <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-small text-red-200">
                {displayError}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 transition-colors hover:bg-white disabled:opacity-50"
            >
              {pending ? 'Entrando…' : 'Entrar no portal'}
            </button>

            <p className="text-center text-[12px] text-ink-100/55">
              Esqueceu a senha? Contate o administrador para resetar.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
