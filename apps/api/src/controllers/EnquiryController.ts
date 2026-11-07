import type { EnquiryRequest, EnquiryResponse } from '@product-catalogue/shared';
import type { Request } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../errors/HttpError.js';
import type { ProductService } from '../services/ProductService.js';
import type { EnquiryEmailService } from '../services/EnquiryEmailService.js';

export class EnquiryController {
  constructor(
    private readonly productService: ProductService,
    private readonly emailService: Pick<EnquiryEmailService, 'sendEnquiryEmail'>,
  ) {}

  submitEnquiry = asyncHandler(async (request, response) => {
    const enquiry = parseEnquiryRequest(request);
    const product = await this.productService.getProductById(enquiry.productId);
    await this.emailService.sendEnquiryEmail(enquiry, product);

    const result: EnquiryResponse = {
      success: true,
      message: 'Enquiry received.',
    };
    response.status(201).json(result);
  });
}

function parseEnquiryRequest(request: Request): EnquiryRequest {
  const body: unknown = request.body;

  if (!isRecord(body)) {
    throw new HttpError('The request body must be an object.', 400);
  }

  if (
    typeof body.productId !== 'number' ||
    !Number.isSafeInteger(body.productId) ||
    body.productId < 1
  ) {
    throw new HttpError('Product ID must be a positive integer.', 400);
  }

  const name = getRequiredString(body.name, 'Name');
  const email = getRequiredString(body.email, 'Email');
  const phone = getRequiredString(body.phone, 'Phone number');
  const message = getRequiredString(body.message, 'Message');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError('Email must be a valid email address.', 400);
  }
  if (!isValidPhoneNumber(phone)) {
    throw new HttpError('Phone number must contain 7 to 15 digits and may start with +.', 400);
  }

  return {
    productId: body.productId,
    name,
    email,
    phone,
    message,
  };
}

function getRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(`${field} is required.`, 400);
  }

  return value.trim();
}

function isValidPhoneNumber(value: string): boolean {
  const normalizedPhone = value.replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(normalizedPhone);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
