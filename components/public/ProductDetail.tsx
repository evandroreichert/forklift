import Image from 'next/image';
import { Download } from 'lucide-react';
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
          <div className="relative aspect-[4/3] overflow-hidden bg-white p-6">
            <Image
              src={produto.imagemCapa}
              alt={produto.nome}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-contain"
            />
          </div>
          <div>
            <span className="label-tracked text-brand-yellow-dim">{produto.categoriaPai === 'empilhadeiras' ? 'Empilhadeira' : 'Construção Civil'}</span>
            <h1 className="mt-4 font-display text-h1 text-ink-950">{produto.nome}</h1>
            <p className="mt-3 text-body text-brand-yellow-dim">{produto.titulo}</p>
            <p className="mt-6 text-body text-ink-500">{produto.descricao}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-brand-yellow bg-brand-yellow px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-transparent hover:text-brand-yellow-dim"
              >
                Solicitar Orçamento
              </a>
              {produto.pdfCatalogo && (
                <a
                  href={produto.pdfCatalogo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-ink-200 px-6 py-3 text-small font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:border-ink-950"
                >
                  <Download className="size-4" />
                  Baixar Catálogo
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {produto.imagensGaleria && produto.imagensGaleria.length > 1 && (
        <section className="border-b border-ink-100 bg-white py-14 md:py-20">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow-dim">Galeria</span>
            <h2 className="mt-4 font-display text-h2 text-ink-950">Variações do modelo</h2>
            <div className="mt-10 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {produto.imagensGaleria.map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded border border-ink-100 bg-white p-3"
                >
                  <Image
                    src={src}
                    alt={`${produto.nome} — imagem ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {produto.variantes && produto.variantes.length > 0 && (
        <section className="border-b border-ink-100 bg-surface-alt py-14 md:py-20" data-section="variantes">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow-dim">Variantes</span>
            <h2 className="mt-4 font-display text-h2 text-ink-950">Modelos disponíveis</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {produto.variantes.map((v) => (
                <div key={v.nome} className="border border-ink-100 p-6">
                  <h3 className="font-display text-h3 text-ink-950">{v.nome}</h3>
                  <p className="mt-2 font-mono text-small text-brand-yellow-dim">{v.capacidade}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {produto.specs && produto.specs.length > 0 && (
        <section className="border-b border-ink-100 bg-surface-alt py-20">
          <div className="container-wide">
            <span className="label-tracked text-brand-yellow-dim">Especificações</span>
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
