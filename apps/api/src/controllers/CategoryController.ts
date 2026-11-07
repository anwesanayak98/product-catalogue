import type { ProductService } from '../services/ProductService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../errors/HttpError.js';

export class CategoryController {
  constructor(private readonly productService: ProductService) {}

  getCategories = asyncHandler(async (_request, response) => {
    const categories = await this.productService.getCategories();
    response.json(categories);
  });

  getCategoryProducts = asyncHandler(async (request, response) => {
    const category = request.params.category.trim();
    if (!category) {
      throw new HttpError('Category must not be empty.', 400);
    }

    const products = await this.productService.getCategoryProducts(category);
    response.json(products);
  });
}
