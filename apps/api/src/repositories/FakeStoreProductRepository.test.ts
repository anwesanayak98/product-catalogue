import { describe, expect, it, vi } from 'vitest';
import { FakeStoreProductRepository } from './FakeStoreProductRepository.js';
import { ProductProviderError } from './ProductProviderError.js';

describe('FakeStoreProductRepository', () => {
  it('maps provider data to the shared product shape', async () => {
    const providerProduct = {
      id: 1,
      title: 'Wireless headphones',
      price: 49.99,
      description: 'Over-ear headphones',
      category: 'electronics',
      image: 'https://example.com/headphones.jpg',
      rating: { rate: 4.5, count: 10 },
      providerOnlyField: 'not exposed',
    };
    const fetchProduct = vi.fn(
      async () =>
        new Response(JSON.stringify([providerProduct]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const repository = new FakeStoreProductRepository(
      'https://fakestore.example/api',
      fetchProduct,
    );

    await expect(repository.getAllProducts()).resolves.toEqual([
      {
        id: 1,
        title: 'Wireless headphones',
        price: 49.99,
        description: 'Over-ear headphones',
        category: 'electronics',
        image: 'https://example.com/headphones.jpg',
        rating: { rate: 4.5, count: 10 },
      },
    ]);
    expect(fetchProduct).toHaveBeenCalledWith(new URL('https://fakestore.example/api/products'));
  });

  it('treats a provider 404 for an individual product as not found', async () => {
    const fetchProduct = vi.fn(async () => new Response(null, { status: 404 }));
    const repository = new FakeStoreProductRepository('https://fakestore.example', fetchProduct);

    await expect(repository.getProductById(123)).resolves.toBeNull();
  });

  it('wraps provider network failures without exposing provider details', async () => {
    const fetchProduct = vi.fn(async () => {
      throw new Error('network failure');
    });
    const repository = new FakeStoreProductRepository('https://fakestore.example', fetchProduct);

    await expect(repository.getAllProducts()).rejects.toBeInstanceOf(ProductProviderError);
  });
});
