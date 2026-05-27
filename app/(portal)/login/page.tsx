'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/public/Logo';
import { login } from '@/lib/auth-mock';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    login(email, senha);
    router.push('/portal');
  }

  function handleDemo() {
    setSubmitting(true);
    login('demo@fabianobratti.com', 'demo');
    router.push('/portal');
  }

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
            <h1 className="mt-3 font-display text-h2 font-bold text-white">Área do Cliente</h1>
            <p className="mt-2 text-small text-ink-100/65">
              Acompanhe relatórios de manutenção da sua frota de empilhadeiras.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-7">
            <div>
              <Label htmlFor="email" className="text-ink-100">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 border-white/15 bg-ink-950/50 text-white placeholder:text-ink-300"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="senha" className="text-ink-100">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-2 border-white/15 bg-ink-950/50 text-white placeholder:text-ink-300"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-yellow px-6 py-3 text-small font-bold uppercase tracking-wider text-ink-950 transition-colors hover:bg-white disabled:opacity-50"
            >
              {submitting ? 'Entrando…' : 'Entrar no portal'}
            </button>
          </form>

          <div className="border-t border-white/10 px-8 py-5">
            <button
              onClick={handleDemo}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-white/15 bg-white/[0.03] px-6 py-3 text-small font-medium uppercase tracking-wider text-white/80 transition-colors hover:border-brand-yellow hover:text-brand-yellow disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              Entrar como demonstração
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-ink-100/45">
          Modo demonstração — qualquer e-mail e senha entram. Os dados exibidos são fictícios.
        </p>
      </div>
    </main>
  );
}
