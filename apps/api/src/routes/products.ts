import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import type { ProductService } from '../services/ProductService.js';

export function createProductRouter(productService: ProductService): Router {
  const router = Router();
  const controller = new ProductController(productService);

  router.get('/featured', controller.getFeaturedProducts);
  router.get('/:id', controller.getProductById);
  router.get('/', controller.getProducts);

  return router;
}
