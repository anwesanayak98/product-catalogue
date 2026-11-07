import type { EnquiryRequest, Product } from '@product-catalogue/shared';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { ProductRepository } from '../repositories/ProductRepository.js';
import { createApp } from '../app.js';
import { EmailDeliveryError } from '../services/EnquiryEmailService.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const product: Product = {
  id: 1,
  title: 'Desk Lamp',
  price: 35.5,
  description: 'A warm reading lamp.',
  category: 'home',
  image: 'https://example.com/lamp.jpg',
  rating: { rate: 4.4, count: 18 },
};

const validEnquiry: EnquiryRequest = {
  productId: 1,
  name: 'Taylor Example',
  email: 'taylor@example.com',
  phone: '+1 555 0100',
  message: 'Is this available in another colour?',
};

const repository: ProductRepository = {
  getAllProducts: async () => [product],
  getProductById: async (id) => (id === product.id ? product : null),
  getCategories: async () => ['home'],
  getProductsByCategory: async () => [product],
};

describe('POST /api/enquiries', () => {
  let server: Server;
  let baseUrl: string;
  let sendEnquiryEmail: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    sendEnquiryEmail = vi.fn().mockResolvedValue(undefined);
    server = createApp(repository, { sendEnquiryEmail }).listen(0);
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    vi.restoreAllMocks();
  });

  it('sends a valid enquiry with its product and returns success', async () => {
    const response = await postEnquiry(validEnquiry);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, message: 'Enquiry received.' });
    expect(sendEnquiryEmail).toHaveBeenCalledWith(validEnquiry, product);
  });

  it('rejects missing required fields', async () => {
    const response = await postEnquiry({ ...validEnquiry, message: '  ' });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Message is required.' });
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it('rejects invalid email addresses', async () => {
    const response = await postEnquiry({ ...validEnquiry, email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: 'Email must be a valid email address.',
    });
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it('rejects invalid phone numbers', async () => {
    const response = await postEnquiry({ ...validEnquiry, phone: '555-CALLS' });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: 'Phone number must contain 7 to 15 digits and may start with +.',
    });
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it('returns a validation error for malformed JSON', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"productId":',
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: 'Request body contains invalid JSON.',
    });
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it('returns not found when the product does not exist', async () => {
    const response = await postEnquiry({ ...validEnquiry, productId: 99 });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ message: 'Product not found.' });
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it('returns a gateway error when email delivery fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    sendEnquiryEmail.mockRejectedValue(new EmailDeliveryError(new Error('SMTP unavailable')));

    const response = await postEnquiry(validEnquiry);

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      message: 'Unable to send your enquiry right now. Please try again later.',
    });
  });

  async function postEnquiry(body: unknown): Promise<Response> {
    return fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
});
