import type { Metadata } from 'next';
import { ContactForm } from '@/components/public/ContactForm';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildLocalBusinessSchema,
  buildMetadata,
  GOOGLE_BUSINESS_URL,
  INSTAGRAM_URL,
  PHONE,
  WHATSAPP_URL,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contato — Fabiano Bratti Empilhadeiras',
  description:
    'Entre em contato com a Fabiano Bratti Empilhadeiras. Telefone, WhatsApp, Instagram e Google Maps. Atendimento no Vale do Itajaí.',
  path: '/contato',
});

export default function ContatoPage() {
  return (
    <>
      <JsonLd data={buildLocalBusinessSchema()} />
      <section className="border-b border-ink-700 bg-ink-900 py-20">
        <div className="container-wide">
          <span className="label-tracked text-brand-yellow">— Contato</span>
          <h1 className="mt-4 font-display text-h1 text-ink-50">Fale com a gente</h1>
          <p className="mt-6 max-w-2xl text-body text-ink-300">
            Solicite um orçamento, tire dúvidas técnicas ou agende uma visita. Atendemos toda a
            região do Vale do Itajaí.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-24">
        <div className="container-wide grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-h2 text-ink-50">Envie uma mensagem</h2>
            <p className="mt-3 text-body text-ink-300">Responderemos em até 24h em dias úteis.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-display text-h2 text-ink-50">Canais diretos</h2>
              <div className="mt-6 space-y-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">WhatsApp</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">{PHONE}</p>
                </a>
                <a
                  href={`tel:${PHONE.replace(/\D/g, '')}`}
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">Telefone</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">{PHONE}</p>
                </a>
                <a
                  href={GOOGLE_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">Google Maps & Avaliações</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">Ver no Google →</p>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-ink-700 p-5 hover:border-brand-yellow"
                >
                  <span className="label-tracked text-ink-300">Instagram</span>
                  <p className="mt-1 font-display text-h3 text-ink-50">@fabianobratti.empilhadeiras</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
