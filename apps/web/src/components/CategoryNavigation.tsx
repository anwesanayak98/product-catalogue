import { NavLink } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

export function CategoryNavigation() {
  const { data: categories, isError, isFetching, isPending, refetch } = useCategories();

  return (
    <div className="category-strip">
      <span className="category-strip-label">Shop by category</span>
      {isPending ? (
        <span className="category-status" role="status">
          Loading categories…
        </span>
      ) : isError ? (
        <button
          className="category-retry"
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Retrying…' : 'Categories unavailable · Retry'}
        </button>
      ) : categories.length === 0 ? (
        <span className="category-status">No categories available</span>
      ) : (
        <nav className="category-nav" aria-label="Product categories">
          {categories.map((category) => (
            <NavLink
              key={category}
              to={`/categories/${encodeURIComponent(category)}`}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {category}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
