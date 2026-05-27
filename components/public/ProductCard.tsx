import Image from 'next/image';
import Link from 'next/link';
import { buildWhatsAppUrl } from '@/lib/seo';
import type { Produto } from '@/lib/types';

const MOTOR_BADGE: Record<string, { label: string; className: string }> = {
  glp: { label: 'GLP', className: 'bg-amber-100 text-amber-900' },
  diesel: { label: 'DIESEL', className: 'bg-slate-200 text-slate-900' },
  eletricas: { label: 'ELÉTRICA', className: 'bg-emerald-100 text-emerald-900' },
};

function getBadge(produto: Produto) {
  if (produto.categoriaPai === 'empilhadeiras') {
    return MOTOR_BADGE[produto.slug];
  }
  return { label: 'CONSTRUÇÃO', className: 'bg-orange-100 text-orange-900' };
}

export function ProductCard({ produto }: { produto: Produto }) {
  const href = `/${produto.categoriaPai}/${produto.slug}`;
  const badge = getBadge(produto);
  const whatsappUrl = buildWhatsAppUrl(
    `Olá, gostaria de um orçamento para ${produto.nome}. Vim através do site.`,
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white transition-shadow hover:shadow-lg">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-surface-alt">
        <Image
          src={produto.imagemCapa}
          alt={produto.nome}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className={`absolute left-3 top-3 rounded px-2.5 py-1 text-[10px] font-bold tracking-wider ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href} className="block">
          <h3 className="font-display text-h3 font-semibold text-ink-950 transition-colors hover:text-brand-yellow-dim">
            {produto.nome}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-small text-ink-500">{produto.titulo}</p>

        <div className="mt-4 flex flex-1 items-end gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-brand-yellow px-3 py-2.5 text-center text-small font-semibold text-ink-950 transition-colors hover:bg-brand-yellow-dim"
          >
            Solicitar Orçamento
          </a>
          <Link
            href={href}
            className="rounded border border-ink-200 px-3 py-2.5 text-small font-medium text-ink-700 transition-colors hover:border-ink-950 hover:text-ink-950"
          >
            Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
