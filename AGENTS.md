# Agent Instructions

## Project Guidelines

- Use TypeScript for application code and keep the frontend and API independently buildable.
- Follow the existing monorepo structure and reuse shared types from the shared package where appropriate.
- Keep changes focused. Do not introduce new product or business behavior without an explicit requirement.
- Prefer simple, maintainable solutions over unnecessary abstractions, dependencies, or infrastructure.
- Keep frontend components, API controllers, services, and data-access logic separated according to their existing responsibilities.
- The frontend must communicate with the backend API and must never call external product data providers directly.
- Keep external product data integration isolated behind the existing `ProductRepository` abstraction.
- Read configuration from environment variables. Never hardcode or commit secrets or real environment files.
- Validate external input and handle errors explicitly. Avoid exposing internal errors or sensitive configuration details to API clients.
- Keep shared formatting consistent with the root Prettier configuration.

## Testing and Validation

- Add focused Vitest tests when introducing or changing behavior that needs verification.
- Update existing tests when modifying established functionality.
- Before submitting changes, run:
  - `npm run lint`
  - `npm run format:check`
  - `npm run build`
- Ensure the frontend and API continue to build independently.
- Do not claim tests or validation have passed unless they have actually been executed.
