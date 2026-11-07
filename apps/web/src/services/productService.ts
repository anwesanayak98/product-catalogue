import type {
  CategoryProductsResponse,
  EnquiryRequest,
  EnquiryResponse,
  Product,
} from '@product-catalogue/shared';
import { apiClient } from '../api';

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await apiClient.get<unknown>('/api/products/featured');

  return parseProducts(response.data, 'featured-products');
}

export async function getProductById(id: string): Promise<Product> {
  const response = await apiClient.get<unknown>(`/api/products/${encodeURIComponent(id)}`);

  if (!isProduct(response.data)) {
    throw new Error('The product endpoint returned an invalid response.');
  }

  return response.data;
}

export async function submitEnquiry(enquiry: EnquiryRequest): Promise<EnquiryResponse> {
  const response = await apiClient.post<unknown>('/api/enquiries', enquiry);

  if (
    !isRecord(response.data) ||
    typeof response.data.success !== 'boolean' ||
    typeof response.data.message !== 'string'
  ) {
    throw new Error('The enquiry endpoint returned an invalid response.');
  }

  return {
    success: response.data.success,
    message: response.data.message,
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await apiClient.get<unknown>('/api/products', {
    params: { search: query },
  });

  return parseProducts(response.data, 'search');
}

export async function getCategories(): Promise<string[]> {
  const response = await apiClient.get<unknown>('/api/categories');

  if (!Array.isArray(response.data) || !response.data.every(isString)) {
    throw new Error('The categories endpoint returned an invalid response.');
  }

  return response.data;
}

export async function getCategoryProducts(category: string): Promise<CategoryProductsResponse> {
  const encodedCategory = encodeURIComponent(category);
  const response = await apiClient.get<unknown>(`/api/categories/${encodedCategory}/products`);
  const data = response.data;

  if (
    !isRecord(data) ||
    !isProductList(data.featuredProducts) ||
    !isProductList(data.additionalProducts)
  ) {
    throw new Error('The category products endpoint returned an invalid response.');
  }

  return {
    featuredProducts: data.featuredProducts,
    additionalProducts: data.additionalProducts,
  };
}

function parseProducts(value: unknown, endpoint: string): Product[] {
  if (!isProductList(value)) {
    throw new Error(`The ${endpoint} endpoint returned an invalid response.`);
  }

  return value;
}

function isProductList(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

function isProduct(value: unknown): value is Product {
  if (!isRecord(value) || !isRecord(value.rating)) {
    return false;
  }

  return (
    Number.isSafeInteger(value.id) &&
    typeof value.title === 'string' &&
    isFiniteNumber(value.price) &&
    typeof value.description === 'string' &&
    typeof value.category === 'string' &&
    typeof value.image === 'string' &&
    isFiniteNumber(value.rating.rate) &&
    isFiniteNumber(value.rating.count)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
