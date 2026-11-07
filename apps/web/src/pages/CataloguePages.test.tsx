// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CategoryProductsResponse, Product } from '@product-catalogue/shared';
import { getCategoryProducts, searchProducts } from '../services/productService';
import { CategoryPage } from './CategoryPage';
import { SearchPage } from './SearchPage';

vi.mock('../services/productService', () => ({
  getCategoryProducts: vi.fn(),
  searchProducts: vi.fn(),
}));

const product = (id: number, title: string): Product => ({
  id,
  title,
  price: 25,
  description: `${title} description`,
  category: 'electronics',
  image: `https://example.com/${id}.jpg`,
  rating: { rate: 4.5, count: 12 },
});

function renderPage(path: string, page: 'search' | 'category') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const element = page === 'search' ? <SearchPage /> : <CategoryPage />;

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/search" element={element} />
          <Route path="/categories/:category" element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('catalogue pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products returned for the URL search query', async () => {
    vi.mocked(searchProducts).mockResolvedValue([product(1, 'Canvas Backpack')]);

    renderPage('/search?search=backpack', 'search');

    expect(await screen.findByRole('heading', { name: 'Canvas Backpack' })).toBeTruthy();
    expect(searchProducts).toHaveBeenCalledWith('backpack');
  });

  it('shows an empty state when search returns no products', async () => {
    vi.mocked(searchProducts).mockResolvedValue([]);

    renderPage('/search?search=unknown', 'search');

    expect(await screen.findByRole('heading', { name: 'No matching products' })).toBeTruthy();
  });

  it('renders featured and remaining products for a category', async () => {
    const response: CategoryProductsResponse = {
      featuredProducts: [product(1, 'Featured Speaker')],
      additionalProducts: [product(2, 'Portable Radio')],
    };
    vi.mocked(getCategoryProducts).mockResolvedValue(response);

    renderPage('/categories/electronics', 'category');

    expect(await screen.findByRole('heading', { name: 'Featured Speaker' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Featured Products' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Remaining Products' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Portable Radio' })).toBeTruthy();
    expect(getCategoryProducts).toHaveBeenCalledWith('electronics');
  });

  it('shows an API error and retries the search when requested', async () => {
    vi.mocked(searchProducts)
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce([product(3, 'Recovered Product')]);

    renderPage('/search?search=product', 'search');

    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Recovered Product' })).toBeTruthy();
    });
    expect(searchProducts).toHaveBeenCalledTimes(2);
  });
});
