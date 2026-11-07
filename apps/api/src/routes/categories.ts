import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import type { ProductService } from '../services/ProductService.js';

export function createCategoryRouter(productService: ProductService): Router {
  const router = Router();
  const controller = new CategoryController(productService);

  router.get('/:category/products', controller.getCategoryProducts);
  router.get('/', controller.getCategories);

  return router;
}
