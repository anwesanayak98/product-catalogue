import type { Product } from './Product.js';

export interface CategoryProductsResponse {
  featuredProducts: Product[];
  additionalProducts: Product[];
}
