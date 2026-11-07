import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CategoryNavigation } from './CategoryNavigation';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchFromUrl =
    location.pathname === '/search'
      ? (new URLSearchParams(location.search).get('search') ?? '')
      : '';
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
    if (searchTimer.current !== null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
  }, [location.pathname, location.search, searchFromUrl]);

  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#featured') {
      scrollToFeatured();
    }
  }, [location.hash, location.pathname]);

  useEffect(
    () => () => {
      if (searchTimer.current !== null) {
        window.clearTimeout(searchTimer.current);
      }
    },
    [],
  );

  const navigateToSearch = (value: string) => {
    const query = value.trim();

    if (!query) {
      if (location.pathname === '/search') {
        navigate('/', { replace: true });
      }
      return;
    }

    const target = `/search?${new URLSearchParams({ search: query }).toString()}`;
    if (`${location.pathname}${location.search}` !== target) {
      navigate(target, { replace: true });
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setSearchTerm(value);

    if (searchTimer.current !== null) {
      window.clearTimeout(searchTimer.current);
    }
    searchTimer.current = window.setTimeout(() => {
      searchTimer.current = null;
      navigateToSearch(value);
    }, 350);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTimer.current !== null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    navigateToSearch(searchTerm);
  };

  const handleFeaturedClick = () => {
    if (location.pathname === '/' && location.hash === '#featured') {
      scrollToFeatured();
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink className="brand" to="/" aria-label="Product Catalogue home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M7 9.5h18l-1.6 15H8.6L7 9.5Z" />
              <path d="M12 12V8a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <span>Product Catalogue</span>
        </NavLink>

        <form className="header-search" role="search" onSubmit={handleSearchSubmit}>
          <label className="visually-hidden" htmlFor="product-search">
            Search products by title or description
          </label>
          <input
            id="product-search"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search products..."
            autoComplete="off"
          />
          <button type="submit" aria-label="Search products">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.7" cy="8.7" r="5.7" />
              <path d="m13 13 4 4" />
            </svg>
          </button>
        </form>

        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Home
          </NavLink>
          <Link to="/#featured" onClick={handleFeaturedClick}>
            Featured
          </Link>
        </nav>
      </div>
      <CategoryNavigation />
    </header>
  );
}

function scrollToFeatured() {
  document.getElementById('featured')?.scrollIntoView({ block: 'start' });
}
