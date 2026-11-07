import type { Product } from '@product-catalogue/shared';
import { ProductProviderError } from './ProductProviderError.js';
import type { ProductRepository } from './ProductRepository.js';

type FetchProduct = (url: URL) => Promise<Response>;

export class FakeStoreProductRepository implements ProductRepository {
  private readonly baseUrl: URL;

  constructor(
    baseUrl: string,
    private readonly fetchProduct: FetchProduct = (url) => fetch(url),
  ) {
    let parsedBaseUrl: URL;

    try {
      parsedBaseUrl = new URL(baseUrl);
    } catch (error) {
      throw new Error('FAKE_STORE_API_BASE_URL must be a valid HTTP(S) URL.', { cause: error });
    }

    if (parsedBaseUrl.protocol !== 'http:' && parsedBaseUrl.protocol !== 'https:') {
      throw new Error('FAKE_STORE_API_BASE_URL must be a valid HTTP(S) URL.');
    }

    this.baseUrl = new URL(parsedBaseUrl.toString().replace(/\/?$/, '/'));
  }

  async getAllProducts(): Promise<Product[]> {
    return this.mapProducts(await this.request('products'));
  }

  async getProductById(id: number): Promise<Product | null> {
    const response = await this.request(`products/${id}`, true);
    return response === null ? null : this.mapProduct(response);
  }

  async getCategories(): Promise<string[]> {
    const response = await this.request('products/categories');

    if (!Array.isArray(response) || !response.every((category) => typeof category === 'string')) {
      throw new ProductProviderError('The product provider returned an invalid category list.');
    }

    return response;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.mapProducts(
      await this.request(`products/category/${encodeURIComponent(category)}`),
    );
  }

  private async request(path: string, allowNotFound = false): Promise<unknown | null> {
    let response: Response;

    try {
      response = await this.fetchProduct(new URL(path, this.baseUrl));
    } catch (error) {
      throw new ProductProviderError('The product provider is unavailable.', { cause: error });
    }

    if (allowNotFound && response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ProductProviderError('The product provider returned an unsuccessful response.');
    }

    try {
      const body: unknown = await response.json();
      return body;
    } catch (error) {
      throw new ProductProviderError('The product provider returned an invalid response.', {
        cause: error,
      });
    }
  }

  private mapProducts(response: unknown): Product[] {
    if (!Array.isArray(response)) {
      throw new ProductProviderError('The product provider returned an invalid product list.');
    }

    return response.map((product) => this.mapProduct(product));
  }

  private mapProduct(response: unknown): Product {
    if (
      !isRecord(response) ||
      !isFiniteNumber(response.id) ||
      typeof response.title !== 'string' ||
      !isFiniteNumber(response.price) ||
      typeof response.description !== 'string' ||
      typeof response.category !== 'string' ||
      typeof response.image !== 'string' ||
      !isRecord(response.rating) ||
      !isFiniteNumber(response.rating.rate) ||
      !isFiniteNumber(response.rating.count)
    ) {
      throw new ProductProviderError('The product provider returned an invalid product.');
    }

    return {
      id: response.id,
      title: response.title,
      price: response.price,
      description: response.description,
      category: response.category,
      image: response.image,
      rating: {
        rate: response.rating.rate,
        count: response.rating.count,
      },
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
