import type { Product } from '@product-catalogue/shared';
import { describe, expect, it, vi } from 'vitest';
import type { ProductRepository } from '../repositories/ProductRepository.js';
import { ProductService } from './ProductService.js';

function makeProduct(id: number, rate: number, category = 'electronics'): Product {
  return {
    id,
    title: `Product ${id}`,
    price: id * 10,
    description: `Description ${id}`,
    category,
    image: `https://example.com/${id}.jpg`,
    rating: { rate, count: id },
  };
}

function createRepository(products: Product[], categories = ['electronics', 'books']) {
  return {
    getAllProducts: vi.fn(async () => products),
    getProductById: vi.fn(
      async (id: number) => products.find((product) => product.id === id) ?? null,
    ),
    getCategories: vi.fn(async () => categories),
    getProductsByCategory: vi.fn(async () => products),
  } satisfies ProductRepository;
}

describe('ProductService', () => {
  it('searches product titles and descriptions without case sensitivity', async () => {
    const products = [
      { ...makeProduct(1, 4), title: 'Wireless headphones' },
      { ...makeProduct(2, 3), description: 'Works with WIRELESS charging' },
      makeProduct(3, 5),
    ];
    const service = new ProductService(createRepository(products));

    await expect(service.getProducts('WIRELESS')).resolves.toEqual(products.slice(0, 2));
  });

  it('returns the five highest-rated products without mutating repository data', async () => {
    const products = [
      makeProduct(1, 1),
      makeProduct(2, 5),
      makeProduct(3, 3),
      makeProduct(4, 4),
      makeProduct(5, 2),
      makeProduct(6, 6),
      makeProduct(7, 7),
    ];
    const originalOrder = products.map((product) => product.id);
    const service = new ProductService(createRepository(products));

    const featuredProducts = await service.getFeaturedProducts();

    expect(featuredProducts.map((product) => product.id)).toEqual([7, 6, 2, 4, 3]);
    expect(products.map((product) => product.id)).toEqual(originalOrder);
  });

  it('filters a category, sorts by rating, and separates the first five products', async () => {
    const products = [
      ...Array.from({ length: 7 }, (_, index) => makeProduct(index + 1, index + 1)),
      makeProduct(8, 10, 'books'),
    ];
    const repository = createRepository(products);
    const service = new ProductService(repository);

    const response = await service.getCategoryProducts('electronics');

    expect(response.featuredProducts.map((product) => product.id)).toEqual([7, 6, 5, 4, 3]);
    expect(response.additionalProducts.map((product) => product.id)).toEqual([2, 1]);
    expect(
      [...response.featuredProducts, ...response.additionalProducts].every(
        (product) => product.category === 'electronics',
      ),
    ).toBe(true);
    expect(repository.getProductsByCategory).toHaveBeenCalledWith('electronics');
  });

  it('returns a not-found error when the requested product does not exist', async () => {
    const service = new ProductService(createRepository([]));

    await expect(service.getProductById(99)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Product not found.',
    });
  });

  it('returns a not-found error when the requested category does not exist', async () => {
    const repository = createRepository([]);
    const service = new ProductService(repository);

    await expect(service.getCategoryProducts('unknown')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Category not found.',
    });
    expect(repository.getProductsByCategory).not.toHaveBeenCalled();
  });
});
