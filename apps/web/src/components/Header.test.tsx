// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

vi.mock('./CategoryNavigation', () => ({
  CategoryNavigation: () => null,
}));

const scrollIntoView = vi.fn();

function renderHeader(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
      <Routes>
        <Route path="/" element={<div id="featured">Featured section</div>} />
        <Route path="/products/:id" element={<p>Product page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('header featured navigation', () => {
  beforeEach(() => {
    scrollIntoView.mockClear();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(cleanup);

  it('scrolls to the featured section from the home page', async () => {
    renderHeader('/');

    fireEvent.click(screen.getByRole('link', { name: 'Featured' }));

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    });
  });

  it('navigates home and scrolls to featured from another page', async () => {
    renderHeader('/products/3');

    fireEvent.click(screen.getByRole('link', { name: 'Featured' }));

    expect(await screen.findByText('Featured section')).toBeTruthy();
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    });
  });
});
