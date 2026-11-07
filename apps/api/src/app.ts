import express from 'express';
import type { ProductRepository } from './repositories/ProductRepository.js';
import { ProductService } from './services/ProductService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createCategoryRouter } from './routes/categories.js';
import { createProductRouter } from './routes/products.js';
import { createEnquiryRouter } from './routes/enquiries.js';
import type { EnquiryEmailService } from './services/EnquiryEmailService.js';

export function createApp(
  productRepository: ProductRepository,
  enquiryEmailService: Pick<EnquiryEmailService, 'sendEnquiryEmail'>,
) {
  const app = express();
  const productService = new ProductService(productRepository);

  app.use(express.json());
  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.use('/api/products', createProductRouter(productService));
  app.use('/api/categories', createCategoryRouter(productService));
  app.use('/api/enquiries', createEnquiryRouter(productService, enquiryEmailService));
  app.use(errorHandler);

  return app;
}
