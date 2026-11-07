import type { Product } from '@product-catalogue/shared';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  ariaLabel?: string;
}

export function ProductGrid({ products, ariaLabel = 'Products' }: ProductGridProps) {
  return (
    <ul className="product-grid" aria-label={ariaLabel}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
