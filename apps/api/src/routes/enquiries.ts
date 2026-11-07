import { Router } from 'express';
import { EnquiryController } from '../controllers/EnquiryController.js';
import type { ProductService } from '../services/ProductService.js';
import type { EnquiryEmailService } from '../services/EnquiryEmailService.js';

export function createEnquiryRouter(
  productService: ProductService,
  emailService: Pick<EnquiryEmailService, 'sendEnquiryEmail'>,
): Router {
  const router = Router();
  const controller = new EnquiryController(productService, emailService);

  router.post('/', controller.submitEnquiry);

  return router;
}
