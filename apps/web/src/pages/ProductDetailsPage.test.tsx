// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EnquiryRequest, EnquiryResponse, Product } from '@product-catalogue/shared';
import { ProductCard } from '../components/ProductCard';
import { getProductById, submitEnquiry } from '../services/productService';
import { ProductDetailsPage } from './ProductDetailsPage';

vi.mock('../services/productService', () => ({
  getProductById: vi.fn(),
  submitEnquiry: vi.fn(),
}));

const exampleProduct: Product = {
  id: 7,
  title: 'Everyday Backpack',
  price: 42.5,
  description: 'A durable backpack with a roomy main compartment.',
  category: 'accessories',
  image: 'https://example.com/backpack.jpg',
  rating: { rate: 4.7, count: 36 },
};

function renderRoutes(initialPath: string, withCard = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          {withCard && <Route path="/" element={<ProductCard product={exampleProduct} />} />}
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('product details page', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the product details returned by the API', async () => {
    vi.mocked(getProductById).mockResolvedValue(exampleProduct);

    renderRoutes('/products/7');

    expect(await screen.findByRole('heading', { name: 'Everyday Backpack' })).toBeTruthy();
    expect(screen.getByText(exampleProduct.description)).toBeTruthy();
    expect(screen.getByText('$42.50')).toBeTruthy();
    expect(screen.getByText('accessories')).toBeTruthy();
    expect(screen.getByText('4.7 / 5')).toBeTruthy();
    expect(screen.getByText('· 36 reviews')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Back to products/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Enquire about this product' })).toBeTruthy();
  });

  it('shows a loading state while the product is being fetched', () => {
    vi.mocked(getProductById).mockReturnValue(new Promise(() => {}));

    renderRoutes('/products/7');

    expect(screen.getByRole('status').textContent).toContain('Loading product details');
  });

  it('shows an API error and provides a retry action', async () => {
    vi.mocked(getProductById)
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(exampleProduct);

    renderRoutes('/products/7');

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'We couldn’t load this product' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Everyday Backpack' })).toBeTruthy();
    expect(getProductById).toHaveBeenCalledTimes(2);
  });

  it('shows a not-found message without offering a retry', async () => {
    const notFoundError = Object.assign(new Error('Product not found'), {
      isAxiosError: true,
      response: { status: 404 },
    });
    vi.mocked(getProductById).mockRejectedValue(notFoundError);

    renderRoutes('/products/999');

    expect(await screen.findByRole('heading', { name: 'Product not found' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Back to products/ })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('navigates to the selected product from its card', async () => {
    vi.mocked(getProductById).mockResolvedValue(exampleProduct);

    renderRoutes('/', true);
    fireEvent.click(screen.getByRole('link', { name: 'View details for Everyday Backpack' }));

    expect(await screen.findByRole('heading', { name: 'Everyday Backpack' })).toBeTruthy();
    expect(getProductById).toHaveBeenCalledWith('7');
  });

  it('opens the form and displays required-field and email validation errors', async () => {
    vi.mocked(getProductById).mockResolvedValue(exampleProduct);

    renderRoutes('/products/7');
    fireEvent.click(await screen.findByRole('button', { name: 'Enquire about this product' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(screen.getByText('Name is required.')).toBeTruthy();
    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(screen.getByText('Phone number is required.')).toBeTruthy();
    expect(screen.getByText('Message is required.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(submitEnquiry).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '555-CALLS' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(screen.getByText('Enter a valid phone number (7–15 digits, optional +).')).toBeTruthy();
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('submits the enquiry once and shows the thank-you message', async () => {
    vi.mocked(getProductById).mockResolvedValue(exampleProduct);
    let finishSubmission: ((response: EnquiryResponse) => void) | undefined;
    const pendingSubmission = new Promise<EnquiryResponse>((resolve) => {
      finishSubmission = resolve;
    });
    vi.mocked(submitEnquiry).mockReturnValue(pendingSubmission);

    renderRoutes('/products/7');
    fireEvent.click(await screen.findByRole('button', { name: 'Enquire about this product' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jordan Customer' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '+1 555 0199' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Please share more details.' },
    });

    const form = screen.getByRole('button', { name: 'Send enquiry' }).closest('form');
    if (!form) {
      throw new Error('The enquiry form was not rendered.');
    }

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(screen.getByRole('button', { name: 'Sending…' }).hasAttribute('disabled')).toBe(true);
    expect(submitEnquiry).toHaveBeenCalledTimes(1);
    expect(vi.mocked(submitEnquiry).mock.calls[0][0]).toEqual({
      productId: 7,
      name: 'Jordan Customer',
      email: 'jordan@example.com',
      phone: '+1 555 0199',
      message: 'Please share more details.',
    } satisfies EnquiryRequest);

    finishSubmission?.({ success: true, message: 'Enquiry received.' });
    expect((await screen.findByRole('status')).textContent).toBe(
      'Thank you. Your enquiry has been sent to our sales team.',
    );
  });

  it('shows the API error when the enquiry cannot be sent', async () => {
    vi.mocked(getProductById).mockResolvedValue(exampleProduct);
    vi.mocked(submitEnquiry).mockRejectedValue(
      Object.assign(new Error('SMTP failed'), {
        isAxiosError: true,
        response: { data: { message: 'Unable to send your enquiry right now.' } },
      }),
    );

    renderRoutes('/products/7');
    fireEvent.click(await screen.findByRole('button', { name: 'Enquire about this product' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jordan Customer' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '+1 555 0199' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Please share more details.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByText('Unable to send your enquiry right now.')).toBeTruthy();
  });
});
