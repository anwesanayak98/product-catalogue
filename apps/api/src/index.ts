import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { FakeStoreProductRepository } from './repositories/FakeStoreProductRepository.js';
import { EnquiryEmailService, type EnquiryEmailConfig } from './services/EnquiryEmailService.js';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const apiBaseUrl = process.env.FAKE_STORE_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('FAKE_STORE_API_BASE_URL must be set.');
}

const port = Number(process.env.PORT ?? 3001);
const repository = new FakeStoreProductRepository(apiBaseUrl);
const emailConfig = getEmailConfig();
if (!emailConfig) {
  console.warn('SMTP is not configured; product enquiries will not be available.');
}
const emailService = new EnquiryEmailService(emailConfig);
const app = createApp(repository, emailService);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

function getRequiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set.`);
  }

  return value;
}

function getEmailConfig(): EnquiryEmailConfig | undefined {
  const names = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'SMTP_FROM_EMAIL',
    'SALES_RECIPIENT_EMAIL',
  ];
  const configuredValues = names.map((name) => process.env[name]?.trim());

  if (configuredValues.every((value) => !value)) {
    return undefined;
  }

  const port = Number(getRequiredEnvironmentValue('SMTP_PORT'));
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  return {
    host: getRequiredEnvironmentValue('SMTP_HOST'),
    port,
    username: getRequiredEnvironmentValue('SMTP_USERNAME'),
    password: getRequiredEnvironmentValue('SMTP_PASSWORD'),
    senderEmail: getRequiredEnvironmentValue('SMTP_FROM_EMAIL'),
    salesRecipientEmail: getRequiredEnvironmentValue('SALES_RECIPIENT_EMAIL'),
  };
}
