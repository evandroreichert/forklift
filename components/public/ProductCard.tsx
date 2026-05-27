import Image from 'next/image';
import Link from 'next/link';
import type { Produto } from '@/lib/types';

export function ProductCard({ produto }: { produto: Produto }) {
  const href = `/${produto.categoriaPai}/${produto.slug}`;
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-100">
        <Image
          src={produto.imagemCapa}
          alt={produto.nome}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-display text-h3 text-ink-950 transition-colors group-hover:text-brand-yellow">
          {produto.nome}
        </h3>
        <span className="text-label text-ink-500 transition-colors group-hover:text-brand-yellow">→</span>
      </div>
    </Link>
  );
}
