import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EnquiryForm } from '../components/EnquiryForm';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useProduct } from '../hooks/useProduct';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function ProductDetailsPage() {
  const { id } = useParams();
  const { data: product, error, isError, isFetching, isPending, refetch } = useProduct(id);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const isNotFound = isAxiosError(error) && error.response?.status === 404;

  return (
    <section className="results-page product-details-page" aria-label="Product details">
      <Link to="/" className="back-home-link product-back-link">
        ← Back to products
      </Link>

      {isPending ? (
        <LoadingState message="Loading product details…" />
      ) : isError ? (
        isNotFound ? (
          <div className="feedback-panel error-panel" role="alert">
            <span className="feedback-icon" aria-hidden="true">
              !
            </span>
            <h1 id="product-details-heading">Product not found</h1>
            <p>This product may have been removed or the link may be incorrect.</p>
          </div>
        ) : (
          <ErrorState
            title="We couldn’t load this product"
            message="Please check your connection and try again."
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        )
      ) : product ? (
        <article className="product-details">
          <div className="product-details-image-wrap">
            <img className="product-details-image" src={product.image} alt={product.title} />
          </div>
          <div className="product-details-content">
            <span className="section-kicker">{product.category}</span>
            <h1 id="product-details-heading">{product.title}</h1>
            <p className="product-details-rating">
              <span className="rating-star" aria-hidden="true">
                ★
              </span>{' '}
              {product.rating.rate.toFixed(1)} / 5<span> · {product.rating.count} reviews</span>
            </p>
            <p className="product-details-price">{priceFormatter.format(product.price)}</p>
            <p className="product-details-description">{product.description}</p>
            {!showEnquiryForm && (
              <button
                className="enquiry-button"
                type="button"
                onClick={() => setShowEnquiryForm(true)}
              >
                Enquire about this product
              </button>
            )}
            {showEnquiryForm && (
              <EnquiryForm productId={product.id} onClose={() => setShowEnquiryForm(false)} />
            )}
          </div>
        </article>
      ) : null}
    </section>
  );
}
