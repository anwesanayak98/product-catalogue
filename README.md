# Product Catalogue

An AI-assisted, full-stack product catalogue built with React, TypeScript, and Node.js. The application supports product discovery, category browsing, search, product details, and customer enquiries.

## Features

- Homepage displaying the five highest-rated products.
- Backend-driven product search across titles and descriptions.
- Category browsing with featured and remaining products.
- Individual product details.
- Customer enquiry form with email notifications.
- Loading, error, empty, and not-found states.
- Responsive layout and basic accessibility support.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TanStack Query, Axios.
- **Backend:** Node.js, Express, TypeScript.
- **Shared:** TypeScript models and API contracts.
- **Product data:** Fake Store API.
- **Email:** Nodemailer over SMTP.
- **Testing:** Vitest.

## Prerequisites

- Node.js 20.19 or later.
- npm.

## Run Locally

Clone the repository and install dependencies from the root directory:

```powershell
git clone https://github.com/anwesanayak98/product-catalogue.git
Set-Location product-catalogue
npm ci
```

Create local environment files:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Configure the environment variables as described below.

Start both applications:

```powershell
npm run dev
```

Alternatively, start them independently:

```powershell
npm run dev -w @product-catalogue/api
npm run dev -w @product-catalogue/web
```

The frontend runs on the Vite development server (default: `http://localhost:5173`) and proxies `/api` requests to the backend at `http://localhost:3001`.

The backend health endpoint is available at:

`http://localhost:3001/health`

The frontend API base URL can be configured using `VITE_API_URL` in `apps/web/.env`.

## Email Configuration

The API uses Nodemailer over SMTP to send customer enquiries to a configured sales inbox.

Configure the following values in `apps/api/.env`:

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port; port 465 uses TLS |
| `SMTP_USERNAME` | SMTP account username |
| `SMTP_PASSWORD` | SMTP account password |
| `SMTP_FROM_EMAIL` | Sender address configured for the account |
| `SALES_RECIPIENT_EMAIL` | Sales inbox that receives enquiries |

### Testing with Ethereal Email

For free local email testing:

1. Create a test account at [Ethereal Email](https://ethereal.email/create).
2. Use `smtp.ethereal.email` as the SMTP host and port `587`.
3. Copy the generated username and password into the SMTP environment variables.
4. Use the generated account email as `SMTP_FROM_EMAIL`.
5. Set `SALES_RECIPIENT_EMAIL` to an address where you want the test message to be captured.

Ethereal captures messages rather than delivering them to real inboxes. View captured messages at [Ethereal Email Messages](https://ethereal.email/messages).

The product catalogue remains available when SMTP is not configured. Enquiry submissions return a clear error until valid SMTP settings are provided.

Do not commit `.env` files or real credentials. Automated tests mock the email service and Nodemailer, so they do not send real emails.

## Validation

Run the automated tests:

```powershell
npm test
```

Run TypeScript checks:

```powershell
npx tsc -b apps/web --pretty false
```

Run linting, formatting checks, and production builds:

```powershell
npm run lint
npm run format:check
npm run build
```

## Project Documentation

- `API_CONTRACTS.md` – API endpoint definitions and response contracts.
- `DECISIONS.md` – Assumptions, scope decisions, trade-offs, and design considerations.
- `AI_USAGE.md` – AI tools, prompts, assistance, and validation details.
- `AGENTS.md` – Project-specific development instructions.