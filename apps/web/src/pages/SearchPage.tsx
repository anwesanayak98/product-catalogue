import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { ProductGrid } from '../components/ProductGrid';
import { useProductSearch } from '../hooks/useProductSearch';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search')?.trim() ?? '';
  const { data: products, isError, isFetching, isPending, refetch } = useProductSearch(query);

  return (
    <section className="results-page" aria-labelledby="search-heading">
      <div className="collection-heading">
        <LinkBack />
        <span className="section-kicker">Search the catalogue</span>
        <h1 id="search-heading">{query ? 'Search results' : 'Find a product'}</h1>
        {query ? (
          <p>
            Results for <strong>“{query}”</strong>
          </p>
        ) : (
          <p>Enter a product name or description in the search bar above.</p>
        )}
      </div>

      {!query ? (
        <EmptyState
          title="Start with a search"
          message="Use the search field above to find products by title or description."
        />
      ) : isPending ? (
        <LoadingState message="Searching products…" />
      ) : isError ? (
        <ErrorState
          title="We couldn’t complete your search"
          message="Please check your connection and try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No matching products"
          message={`We couldn’t find any products matching “${query}”. Try another search.`}
        />
      ) : (
        <>
          <p className="results-count" aria-live="polite">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
          <ProductGrid products={products} ariaLabel="Search results" />
        </>
      )}
    </section>
  );
}

function LinkBack() {
  return (
    <Link className="back-home-link" to="/">
      ← Back to home
    </Link>
  );
}
