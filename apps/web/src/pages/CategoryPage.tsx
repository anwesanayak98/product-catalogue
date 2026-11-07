import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { ProductGrid } from '../components/ProductGrid';
import { useCategoryProducts } from '../hooks/useCategoryProducts';

export function CategoryPage() {
  const { category } = useParams();
  const {
    data: categoryProducts,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useCategoryProducts(category);

  const hasProducts =
    categoryProducts !== undefined &&
    (categoryProducts.featuredProducts.length > 0 ||
      categoryProducts.additionalProducts.length > 0);

  return (
    <section className="results-page category-page" aria-labelledby="category-heading">
      <div className="collection-heading">
        <Link to="/" className="back-home-link">
          ← Back to home &nbsp;
        </Link>
        <span className="section-kicker">Browse category</span>
        <h1 id="category-heading">{category ?? 'Category'}</h1>
        <p>Explore customer favourites and more in this collection.</p>
      </div>

      {isPending ? (
        <LoadingState message="Loading this collection…" />
      ) : isError ? (
        <ErrorState
          title="We couldn’t load this category"
          message="Please check your connection and try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : !hasProducts ? (
        <EmptyState
          title="No products in this category"
          message="There aren’t any products to show here right now. Please check back soon."
        />
      ) : (
        <>
          <section className="category-product-section" aria-labelledby="featured-products-heading">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Top rated</span>
                <h2 id="featured-products-heading">Featured Products</h2>
              </div>
            </div>
            <ProductGrid
              products={categoryProducts.featuredProducts}
              ariaLabel="Featured products"
            />
          </section>

          <section
            className="category-product-section"
            aria-labelledby="remaining-products-heading"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">More to explore</span>
                <h2 id="remaining-products-heading">Remaining Products</h2>
              </div>
            </div>
            {categoryProducts.additionalProducts.length > 0 ? (
              <ProductGrid
                products={categoryProducts.additionalProducts}
                ariaLabel="Remaining products"
              />
            ) : (
              <p className="no-additional-products">No remaining products in this category.</p>
            )}
          </section>
        </>
      )}
    </section>
  );
}
