import type { Request } from 'express';
import type { ProductService } from '../services/ProductService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../errors/HttpError.js';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getProducts = asyncHandler(async (request, response) => {
    const search = getSearchQuery(request);
    const products = await this.productService.getProducts(search);
    response.json(products);
  });

  getFeaturedProducts = asyncHandler(async (_request, response) => {
    const products = await this.productService.getFeaturedProducts();
    response.json(products);
  });

  getProductById = asyncHandler(async (request, response) => {
    const id = parseProductId(request.params.id);
    const product = await this.productService.getProductById(id);
    response.json(product);
  });
}

function getSearchQuery(request: Request): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(request.query, 'search')) {
    return undefined;
  }

  const search = request.query.search;
  if (typeof search !== 'string' || search.trim().length === 0) {
    throw new HttpError('The search parameter must be a non-empty string.', 400);
  }

  return search.trim();
}

function parseProductId(value: string): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError('Product ID must be a positive integer.', 400);
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new HttpError('Product ID must be a positive integer.', 400);
  }

  return id;
}
