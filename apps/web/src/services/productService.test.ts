import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../api';
import { getFeaturedProducts, getProductById, submitEnquiry } from './productService';

describe('getFeaturedProducts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProductById', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches and returns one valid product from the backend', async () => {
      const product = {
        id: 8,
        title: 'Example product',
        price: 19.99,
        description: 'A product description.',
        category: 'electronics',
        image: 'https://example.com/product.jpg',
        rating: { rate: 4.5, count: 10 },
      };
      const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: product });

      await expect(getProductById('8')).resolves.toEqual(product);
      expect(get).toHaveBeenCalledWith('/api/products/8');
    });

    it('rejects an invalid product response', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { id: 8 } });

      await expect(getProductById('8')).rejects.toThrow('invalid response');
    });
  });

  describe('submitEnquiry', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('posts the enquiry to the backend and returns its success response', async () => {
      const enquiry = {
        productId: 8,
        name: 'Taylor Example',
        email: 'taylor@example.com',
        phone: '+1 555 0100',
        message: 'Please share more details.',
      };
      const post = vi
        .spyOn(apiClient, 'post')
        .mockResolvedValue({ data: { success: true, message: 'Enquiry received.' } });

      await expect(submitEnquiry(enquiry)).resolves.toEqual({
        success: true,
        message: 'Enquiry received.',
      });
      expect(post).toHaveBeenCalledWith('/api/enquiries', enquiry);
    });
  });

  it('returns a valid Product array from the backend', async () => {
    const products = [
      {
        id: 1,
        title: 'Example product',
        price: 19.99,
        description: 'A product description.',
        category: 'electronics',
        image: 'https://example.com/product.jpg',
        rating: { rate: 4.5, count: 10 },
      },
    ];
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: products });

    await expect(getFeaturedProducts()).resolves.toEqual(products);
  });

  it('rejects a non-array response so the page can show its error state', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: '<!doctype html>' });

    await expect(getFeaturedProducts()).rejects.toThrow('invalid response');
  });
});
