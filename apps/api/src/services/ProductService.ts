import type { CategoryProductsResponse, Product } from '@product-catalogue/shared';
import { HttpError } from '../errors/HttpError.js';
import type { ProductRepository } from '../repositories/ProductRepository.js';

const FEATURED_PRODUCT_COUNT = 5;

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(search?: string): Promise<Product[]> {
    const products = await this.productRepository.getAllProducts();

    if (search === undefined) {
      return products;
    }

    const normalizedSearch = search.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch),
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.productRepository.getAllProducts();
    return sortByRating(products).slice(0, FEATURED_PRODUCT_COUNT);
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.getProductById(id);

    if (!product) {
      throw new HttpError('Product not found.', 404);
    }

    return product;
  }

  async getCategories(): Promise<string[]> {
    return this.productRepository.getCategories();
  }

  async getCategoryProducts(category: string): Promise<CategoryProductsResponse> {
    const categories = await this.productRepository.getCategories();

    if (!categories.includes(category)) {
      throw new HttpError('Category not found.', 404);
    }

    const products = await this.productRepository.getProductsByCategory(category);
    const categoryProducts = products.filter((product) => product.category === category);
    const sortedProducts = sortByRating(categoryProducts);

    return {
      featuredProducts: sortedProducts.slice(0, FEATURED_PRODUCT_COUNT),
      additionalProducts: sortedProducts.slice(FEATURED_PRODUCT_COUNT),
    };
  }
}

function sortByRating(products: Product[]): Product[] {
  return [...products].sort((first, second) => second.rating.rate - first.rating.rate);
}
