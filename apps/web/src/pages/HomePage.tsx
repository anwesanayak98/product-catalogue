import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { ProductGrid } from '../components/ProductGrid';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';

export function HomePage() {
  const { data: products, isError, isPending, isFetching, refetch } = useFeaturedProducts();

  return (
    <>
      <section className="hero-section" aria-labelledby="home-heading">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />A little inspiration, just for you
          </span>
          <h1 id="home-heading">
            Find something
            <br />
            <span>you’ll love.</span>
          </h1>
          <p>Explore thoughtful finds and customer favourites, all gathered in one lovely place.</p>
          <a className="hero-link" href="#featured">
            Explore the favourites <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-art-card">
            <span className="hero-art-sun" />
            <span className="hero-art-arch" />
            <span className="hero-art-vase" />
            <span className="hero-art-leaf leaf-one" />
            <span className="hero-art-leaf leaf-two" />
          </div>
          <span className="hero-sparkle sparkle-one">✳</span>
          <span className="hero-sparkle sparkle-two">✦</span>
        </div>
      </section>

      <section className="featured-section" id="featured" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Chosen by you</span>
            <h2 id="featured-heading">Top-rated picks</h2>
          </div>
          <p>Five standout finds our customers love most.</p>
        </div>

        {isPending ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <ProductGrid products={products} ariaLabel="Featured products" />
        )}
      </section>
    </>
  );
}
