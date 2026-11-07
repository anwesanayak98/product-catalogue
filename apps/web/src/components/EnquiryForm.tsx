import { isAxiosError } from 'axios';
import { useRef, useState, type FormEvent } from 'react';
import type { EnquiryRequest, ApiError } from '@product-catalogue/shared';
import { submitEnquiry } from '../services/productService';

type EnquiryFields = Omit<EnquiryRequest, 'productId'>;
type EnquiryFieldErrors = Partial<Record<keyof EnquiryFields, string>>;

interface EnquiryFormProps {
  productId: number;
  onClose: () => void;
}

const initialFields: EnquiryFields = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export function EnquiryForm({ productId, onClose }: EnquiryFormProps) {
  const [fields, setFields] = useState(initialFields);
  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submissionInProgress = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionInProgress.current) {
      return;
    }

    const validationErrors = validateFields(fields);
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      await submitEnquiry({
        productId,
        name: fields.name.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        message: fields.message.trim(),
      });
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof EnquiryFields, value: string) {
    setFields((currentFields) => ({ ...currentFields, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  return (
    <section className="enquiry-form-panel" aria-labelledby="enquiry-form-heading">
      <div className="enquiry-form-header">
        <h2 id="enquiry-form-heading">Enquire about this product</h2>
        <button className="enquiry-cancel-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {isSubmitted ? (
        <p className="enquiry-success" role="status">
          Thank you. Your enquiry has been sent to our sales team.
        </p>
      ) : (
        <form className="enquiry-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
          <FormField
            id="enquiry-name"
            label="Name"
            value={fields.name}
            error={errors.name}
            autoComplete="name"
            onChange={(value) => updateField('name', value)}
          />
          <FormField
            id="enquiry-email"
            label="Email"
            type="email"
            value={fields.email}
            error={errors.email}
            autoComplete="email"
            onChange={(value) => updateField('email', value)}
          />
          <FormField
            id="enquiry-phone"
            label="Phone number"
            type="tel"
            value={fields.phone}
            error={errors.phone}
            autoComplete="tel"
            onChange={(value) => updateField('phone', value)}
          />
          <div className="enquiry-field">
            <label htmlFor="enquiry-message">Message</label>
            <textarea
              id="enquiry-message"
              name="message"
              rows={4}
              required
              value={fields.message}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
              onChange={(event) => updateField('message', event.target.value)}
            />
            {errors.message && (
              <span className="enquiry-field-error" id="enquiry-message-error">
                {errors.message}
              </span>
            )}
          </div>
          {submitError && (
            <p className="enquiry-submit-error" role="alert">
              {submitError}
            </p>
          )}
          <button className="enquiry-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send enquiry'}
          </button>
        </form>
      )}
    </section>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  autoComplete: string;
  onChange: (value: string) => void;
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  error,
  autoComplete,
  onChange,
}: FormFieldProps) {
  return (
    <div className="enquiry-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id.replace('enquiry-', '')}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span className="enquiry-field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

function validateFields(fields: EnquiryFields): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = 'Name is required.';
  }
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhoneNumber(fields.phone)) {
    errors.phone = 'Enter a valid phone number (7–15 digits, optional +).';
  }
  if (!fields.message.trim()) {
    errors.message = 'Message is required.';
  }

  return errors;
}

function isValidPhoneNumber(value: string): boolean {
  const normalizedPhone = value.trim().replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(normalizedPhone);
}

function getSubmitErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const responseData: unknown = error.response?.data;
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }
  }

  return 'We couldn’t send your enquiry. Please try again.';
}
