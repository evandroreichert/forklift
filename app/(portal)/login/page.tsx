'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/public/Logo';
import { login } from '@/lib/auth-mock';

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
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-10 border border-ink-700 bg-ink-900 p-8">
          <h1 className="font-display text-h2 text-ink-50">Área do Cliente</h1>
          <p className="mt-2 text-small text-ink-300">
            Acompanhe relatórios de manutenção da sua frota de empilhadeiras.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email" className="text-ink-50">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 bg-ink-950 border-ink-700 text-ink-50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="senha" className="text-ink-50">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-2 bg-ink-950 border-ink-700 text-ink-50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 disabled:opacity-50"
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <button
            onClick={handleDemo}
            disabled={submitting}
            className="mt-3 w-full border border-ink-700 px-6 py-3 text-small font-medium uppercase tracking-wider text-ink-300 hover:border-brand-yellow hover:text-brand-yellow disabled:opacity-50"
          >
            Entrar como demonstração
          </button>

          <div className="mt-6 border-t border-ink-700 pt-4 text-center text-small text-ink-300">
            <Link href="/" className="hover:text-brand-yellow">← Voltar ao site</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-small text-ink-300">
          Modo demonstração — qualquer e-mail e senha entram. Os dados exibidos são fictícios.
        </p>
      </div>
    </main>
  );
}
