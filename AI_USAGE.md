# AI Usage

## 1. Tools and Models Used

- **Tool:** GitHub Copilot CLI.
- **Model selection:** Auto mode. The underlying model was selected dynamically, and no fixed model identifier was exposed.
- **Local development tools:** PowerShell and npm scripts for workspace inspection, dependency management, testing, type checking, linting, formatting, production builds, and API health checks.
- **Other AI services or agents:** None used during this work.

## 2. Agent Instruction Files

- **AGENTS.md:** Present in the repository working tree. It provides project-level guidance on the technology stack, coding conventions, architecture, and implementation expectations. It is currently untracked in this workspace, so this document does not claim that it has been committed.
- No `CLAUDE.md` or `.cursor/rules` files were used.

## 3. Plan and Specification

I followed a requirement-driven, incremental implementation plan rather than asking AI to generate the entire application in one step. The work was organized into these stages:

1. Set up the frontend, backend, and shared TypeScript workspace.
2. Define shared data models and API contracts.
3. Implement backend product retrieval, search, and category functionality using Fake Store API.
4. Build the frontend homepage, search, and category views.
5. Implement product details and enquiry functionality.
6. Integrate email delivery through configurable SMTP settings.
7. Add automated tests, documentation, and final validation.

API contracts and project instructions were used as references throughout implementation. Changes were made and validated incrementally.

## 4. Key Prompts

### Prompt 1: Monorepo Setup

> I am building a full-stack Product Catalogue application as part of a Senior Full-Stack Engineer take-home assessment. I want to create a monorepo using npm workspaces.

**Technology stack**

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, and Axios
- Backend: Node.js, TypeScript, and Express.js
- Development tools: ESLint, Prettier, and Vitest

**Project structure**

```text
product-catalogue/
  apps/
    web/       React frontend
    api/       Node.js backend
  package.json
  .gitignore
  AGENTS.md
```

**Implementation requirements**

1. Configure npm workspaces at the root to manage both applications.
2. Scaffold the frontend using Vite with React and TypeScript.
3. Scaffold the backend using Node.js, Express, and TypeScript.
4. Configure independent TypeScript configurations for the frontend and backend.
5. Add root development scripts to run both applications concurrently.
6. Configure build scripts for both applications.
7. Configure ESLint and Prettier with consistent formatting rules.
8. Add a basic Express health-check endpoint at `GET /health` that returns:

   ```json
   { "status": "ok" }
   ```

9. Configure backend environment-variable handling.
10. Create a `.gitignore` that excludes `node_modules`, build output, `.env` files, and generated files.
11. Create `AGENTS.md` containing project-wide coding guidelines.

**Constraints**

- Use npm as the package manager and TypeScript throughout.
- Keep the configuration minimal and avoid unnecessary dependencies or folders.
- Do not implement business functionality or introduce Docker yet.
- Do not hardcode secrets or environment-specific configuration.

Before making changes, briefly explain the proposed project structure. After implementation, explain the files created and the commands required to run both applications.

### Prompt 2: Frontend Home Page

> Implement the frontend home page for the product catalogue application.

**Before making changes**

1. Inspect the existing frontend structure, shared TypeScript types, `API_CONTRACTS.md`, and `AGENTS.md`.
2. Inspect the backend implementation to understand the exact API response shapes.
3. Reuse existing dependencies and conventions wherever possible.

**Application structure**

- Set up React Router if it is not already configured.
- Create a reusable application layout.
- Add a responsive header with the application logo or name and navigation.
- Create a clean, modern product catalogue design.
- Use reusable components instead of putting everything in `App.tsx`.

**API integration**

- Create a central API client or service layer.
- Fetch featured products using `GET /api/products/featured`.
- Make the frontend communicate exclusively with our backend.
- Configure the backend base URL through a frontend environment variable; do not hardcode it throughout components.
- Use the shared `Product` type.

**Home page**

- Display a heading and short introduction.
- Display the five highest-rated products returned by the backend.
- Create reusable `ProductCard` components. Each card should show:
  - Product image and title
  - Price, rating, and category
  - A button or link to view product details
- Make the layout responsive for desktop, tablet, and mobile.

**Loading and error states**

- Display a loading indicator while fetching.
- Display a meaningful error message if the request fails, with a retry action.
- Handle an empty product response gracefully.

**State management**

- Use TanStack Query for server-state management if it is already installed. If not, add it and configure `QueryClientProvider` appropriately.
- Keep API-fetching logic outside UI components and avoid unnecessary global state.

**Code quality and scope**

- Use TypeScript properly and avoid unnecessary `any` types.
- Keep components small and reusable.
- Add accessible labels and semantic HTML.
- Avoid unnecessary dependencies.
- Do not implement category filtering, search, product details, or enquiry functionality yet.

**Validation and handoff**

- Run the frontend TypeScript build and lint; fix all errors.
- Summarize the components and files created.
- Explain how API data flows from the backend to the product cards.

## 5. Where AI Got Things Wrong and How I Caught Them

AI-generated suggestions and implementations were treated as drafts and checked against the code, requirements, and validation results.

- **Dependency compatibility:** During frontend setup, a Vite/Vitest version mismatch caused build issues. The dependency versions were reviewed and Vite was adjusted to restore compatibility; builds and checks were rerun.
- **Search expectations:** Search remains backend-driven over product titles and descriptions. Category matching was not part of the initial behavior, so it was kept as a documented future enhancement rather than added implicitly.
- **SMTP configuration:** Initially, missing email settings prevented the API from starting. Startup was changed so catalogue routes remain available without SMTP; enquiry submissions return a clear delivery error until SMTP is configured.
- **Hash navigation:** The header's React Router link changed the URL hash without scrolling to the featured section. Location-aware scrolling and repeat-click handling were added and tested.

## 6. Human Review and Validation

AI assistance accelerated inspection, implementation, and debugging, but the changes and scope decisions were reviewed against the requirements.

Validation included:

- Reviewing the implementation against the assessment requirements.
- Running the automated test suite (37 tests passed at the time of this document).
- Running TypeScript checks, linting, and formatting.
- Building the shared, backend, and frontend workspaces.
- Checking the API health endpoint and frontend development server.
- Documenting Ethereal SMTP as the free local email-capture option. A live Ethereal email capture has not been verified in this workspace.

Automated email tests mock the email service and Nodemailer; no production SMTP credentials or live email delivery are used in automated tests. The final architecture, scope decisions, simplifications, and acceptance of changes were reviewed before submission.
