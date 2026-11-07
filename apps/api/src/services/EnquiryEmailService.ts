import type { EnquiryRequest, Product } from '@product-catalogue/shared';
import nodemailer, { type Transporter } from 'nodemailer';

export interface EnquiryEmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  senderEmail: string;
  salesRecipientEmail: string;
}

export class EmailDeliveryError extends Error {
  constructor(cause: unknown) {
    super('The enquiry email could not be delivered.', { cause });
    this.name = 'EmailDeliveryError';
  }
}

export class EnquiryEmailService {
  private readonly transporter: Transporter | undefined;

  constructor(private readonly config: EnquiryEmailConfig | undefined) {
    this.transporter = config
      ? nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.port === 465,
          auth: {
            user: config.username,
            pass: config.password,
          },
        })
      : undefined;
  }

  async sendEnquiryEmail(enquiry: EnquiryRequest, product: Product): Promise<void> {
    if (!this.config || !this.transporter) {
      throw new EmailDeliveryError(new Error('SMTP is not configured.'));
    }

    const text = [
      `Product: ${product.title}`,
      `Product ID: ${product.id}`,
      `Category: ${product.category}`,
      `Price: $${product.price.toFixed(2)}`,
      '',
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone}`,
      '',
      'Message:',
      enquiry.message,
    ].join('\n');

    try {
      await this.transporter.sendMail({
        from: this.config.senderEmail,
        to: this.config.salesRecipientEmail,
        replyTo: enquiry.email,
        subject: `Product enquiry: ${product.title}`,
        text,
      });
    } catch (error) {
      throw new EmailDeliveryError(error);
    }
  }
}
