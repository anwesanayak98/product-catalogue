import type { Product } from '@product-catalogue/shared';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="product-card-content">
        <div className="product-card-meta">
          <span className="product-category">{product.category}</span>
          <span
            className="product-rating"
            aria-label={`${product.rating.rate.toFixed(1)} out of 5 stars, ${product.rating.count} ratings`}
          >
            <span className="rating-star" aria-hidden="true">
              ★
            </span>
            {product.rating.rate.toFixed(1)}
            <span className="rating-count">({product.rating.count})</span>
          </span>
        </div>
        <h3 className="product-title">{product.title}</h3>
        <div className="product-card-footer">
          <p className="product-price">{priceFormatter.format(product.price)}</p>
          <Link
            className="details-button"
            to={`/products/${product.id}`}
            aria-label={`View details for ${product.title}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
