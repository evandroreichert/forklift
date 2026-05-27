import Image from 'next/image';
import { buildWhatsAppUrl } from '@/lib/seo';
import type { Produto } from '@/lib/types';

export function ProductDetail({ produto }: { produto: Produto }) {
  const whatsappUrl = buildWhatsAppUrl(
    `Olá, gostaria de um orçamento para ${produto.nome}. Vim através do site.`,
  );

  return (
    <>
      <section className="border-b border-ink-100 bg-surface-alt py-20">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-white">
            <Image
              src={produto.imagemCapa}
              alt={produto.nome}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
          <div>
            <span className="label-tracked text-brand-yellow">— {produto.categoriaPai === 'empilhadeiras' ? 'Empilhadeira' : 'Construção Civil'}</span>
            <h1 className="mt-4 font-display text-h1 text-ink-950">{produto.nome}</h1>
            <p className="mt-3 text-body text-brand-yellow">{produto.titulo}</p>
            <p className="mt-6 text-body text-ink-500">{produto.descricao}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block border border-brand-yellow bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-transparent hover:text-brand-yellow"
            >
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </section>

      {produto.variantes && produto.variantes.length > 0 && (
        <section className="border-b border-ink-100 bg-white py-20">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow">— Variantes</span>
            <h2 className="mt-4 font-display text-h2 text-ink-950">Modelos disponíveis</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {produto.variantes.map((v) => (
                <div key={v.nome} className="border border-ink-100 p-6">
                  <h3 className="font-display text-h3 text-ink-950">{v.nome}</h3>
                  <p className="mt-2 font-mono text-small text-brand-yellow">{v.capacidade}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {produto.specs && produto.specs.length > 0 && (
        <section className="border-b border-ink-100 bg-surface-alt py-20">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow">— Especificações</span>
            <h2 className="mt-4 font-display text-h2 text-ink-950">Specs técnicas</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-4 sm:grid-cols-2">
              {produto.specs.map((s) => (
                <div key={s.label} className="flex justify-between border-b border-ink-100 py-3">
                  <dt className="text-small text-ink-500">{s.label}</dt>
                  <dd className="font-mono text-small text-ink-950">{s.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="container-wide rounded border border-ink-100 bg-surface-alt p-10 text-center">
          <h2 className="font-display text-h2 text-ink-950">Pronto para o próximo passo?</h2>
          <p className="mt-3 text-body text-ink-500">Solicite um orçamento sem compromisso.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-brand-yellow px-8 py-4 text-small font-semibold uppercase tracking-wider text-ink-950 transition-transform hover:scale-105"
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
