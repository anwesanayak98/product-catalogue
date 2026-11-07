import type { EnquiryRequest, Product } from '@product-catalogue/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createTransportMock, sendMailMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  sendMailMock: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

import { EmailDeliveryError, EnquiryEmailService } from './EnquiryEmailService.js';

const config = {
  host: 'smtp.example.test',
  port: 587,
  username: 'test-user',
  password: 'test-password',
  senderEmail: 'catalogue@example.test',
  salesRecipientEmail: 'sales@example.test',
};

const enquiry: EnquiryRequest = {
  productId: 2,
  name: 'Jordan Customer',
  email: 'jordan@example.test',
  phone: '+1 555 0199',
  message: 'Please share more details.',
};

const product: Product = {
  id: 2,
  title: 'Ceramic Vase',
  price: 24.99,
  description: 'Hand-finished ceramic.',
  category: 'home',
  image: 'https://example.test/vase.jpg',
  rating: { rate: 4.8, count: 8 },
};

describe('EnquiryEmailService', () => {
  beforeEach(() => {
    sendMailMock.mockReset().mockResolvedValue({ messageId: 'message-1' });
    createTransportMock.mockReset().mockReturnValue({ sendMail: sendMailMock });
  });

  it('sends product and customer details to the configured sales recipient', async () => {
    const service = new EnquiryEmailService(config);

    await service.sendEnquiryEmail(enquiry, product);

    expect(createTransportMock).toHaveBeenCalledWith({
      host: config.host,
      port: config.port,
      secure: false,
      auth: { user: config.username, pass: config.password },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: config.senderEmail,
      to: config.salesRecipientEmail,
      replyTo: enquiry.email,
      subject: 'Product enquiry: Ceramic Vase',
      text: expect.stringContaining('Name: Jordan Customer'),
    });
    expect(sendMailMock.mock.calls[0][0].text).toContain('Price: $24.99');
    expect(sendMailMock.mock.calls[0][0].text).toContain(enquiry.message);
  });

  it('wraps SMTP failures so the API can return a safe error', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP credentials rejected'));
    const service = new EnquiryEmailService(config);

    await expect(service.sendEnquiryEmail(enquiry, product)).rejects.toBeInstanceOf(
      EmailDeliveryError,
    );
  });

  it('fails an enquiry cleanly when SMTP is not configured', async () => {
    const service = new EnquiryEmailService(undefined);

    await expect(service.sendEnquiryEmail(enquiry, product)).rejects.toBeInstanceOf(
      EmailDeliveryError,
    );
    expect(createTransportMock).not.toHaveBeenCalled();
  });
});
