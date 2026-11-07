import type { ErrorRequestHandler } from 'express';
import type { ApiError } from '@product-catalogue/shared';
import { HttpError } from '../errors/HttpError.js';
import { ProductProviderError } from '../repositories/ProductProviderError.js';
import { EmailDeliveryError } from '../services/EnquiryEmailService.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const isInvalidJson = isInvalidJsonError(error);
  if (!(error instanceof HttpError) && !isInvalidJson) {
    console.error('API request failed:', error);
  }

  const statusCode =
    error instanceof HttpError
      ? error.statusCode
      : isInvalidJson
        ? 400
        : error instanceof ProductProviderError || error instanceof EmailDeliveryError
          ? 502
          : 500;
  const message =
    error instanceof HttpError
      ? error.message
      : isInvalidJson
        ? 'Request body contains invalid JSON.'
        : error instanceof EmailDeliveryError
          ? 'Unable to send your enquiry right now. Please try again later.'
          : error instanceof ProductProviderError
            ? 'Product catalogue is temporarily unavailable.'
            : 'Internal server error.';
  const body: ApiError = { message, statusCode };

  response.status(statusCode).json(body);
};

function isInvalidJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  );
}
