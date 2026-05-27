'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-brand-yellow bg-ink-900 p-8">
        <h3 className="font-display text-h3 text-brand-yellow">Mensagem enviada</h3>
        <p className="mt-3 text-body text-ink-300">
          Entraremos em contato em breve. Para urgência, fale pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="nome" className="text-ink-50">Nome</Label>
        <Input id="nome" required className="mt-2 bg-ink-900 border-ink-700 text-ink-50" />
      </div>
      <div>
        <Label htmlFor="email" className="text-ink-50">E-mail</Label>
        <Input id="email" type="email" required className="mt-2 bg-ink-900 border-ink-700 text-ink-50" />
      </div>
      <div>
        <Label htmlFor="telefone" className="text-ink-50">Telefone</Label>
        <Input id="telefone" required className="mt-2 bg-ink-900 border-ink-700 text-ink-50" />
      </div>
      <div>
        <Label htmlFor="mensagem" className="text-ink-50">Mensagem</Label>
        <textarea
          id="mensagem"
          rows={4}
          required
          className="mt-2 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-body text-ink-50 focus-visible:outline-2 focus-visible:outline-brand-yellow"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 hover:scale-[1.01] transition-transform"
      >
        Enviar mensagem
      </button>
    </form>
  );
}
