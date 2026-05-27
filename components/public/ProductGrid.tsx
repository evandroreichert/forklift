import { ProductCard } from './ProductCard';
import type { Produto } from '@/lib/types';

export function ProductGrid({ produtos }: { produtos: Produto[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {produtos.map((p) => <ProductCard key={p.slug} produto={p} />)}
    </div>
  );
}
