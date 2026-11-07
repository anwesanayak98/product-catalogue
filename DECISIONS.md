# Decisions

## Assumptions Where Acceptance Criteria Were Unclear

- **Product data source:** Used Fake Store API as the external product data source, as no specific provider or product dataset was mandated.
- **Featured products:** Interpreted the requirement for five highest-rated products as selecting the top five products based on rating, sorted in descending order.
- **Search behaviour:** Implemented backend-driven search across product titles and descriptions. Category matching was not included in the initial search behaviour.
- **Category listings:** Interpreted the requirement as displaying the five highest-rated products separately from the remaining products within the selected category.
- **Enquiry workflow:** Assumed that enquiries only needed to be emailed to a configured sales inbox. Persistent storage, enquiry history, and customer accounts were not required.
- **Email confirmation:** The application displays a thank-you confirmation after the backend successfully accepts the enquiry for email delivery. Ethereal SMTP is documented as a local email-capture option rather than real delivery; automated tests mock email sending.
- **Authentication:** Assumed that authentication and user-specific access control were outside the scope of this assessment.

## Requirements Dropped or Simplified

Given the assessment time constraints, I prioritised the core user journeys and maintainability over additional features.

- **Persistent enquiry storage:** Did not introduce a database to store enquiries because the requirement only specified email notification. This avoids additional infrastructure and operational complexity.
- **Email integration:** Used Nodemailer with configurable SMTP settings instead of integrating a specific production email provider. This keeps the implementation easy to configure locally while allowing a production SMTP provider to be introduced later.
- **Search functionality:** Kept search simple, supporting product title and description matching. Advanced filtering, category matching, and more sophisticated search capabilities were left as future enhancements.
- **Pagination:** Loaded the available products for search and category results rather than implementing server-side pagination. Pagination would be beneficial for a significantly larger catalogue.
- **Authentication and authorisation:** Did not implement user authentication because the assessment did not require protected functionality.
- **Production infrastructure:** Did not introduce Docker, cloud deployment configuration, queues, or additional infrastructure. The application can be run locally with the provided environment configuration and npm scripts.

## How the Design Supports Growth Beyond the PoC

Although the application is intentionally lightweight, some design decisions provide clear extension points as requirements evolve.

- **Separation of frontend and backend:** The frontend communicates exclusively with the backend API. This allows the UI and backend to evolve independently and prevents external provider dependencies from leaking into the frontend.
- **Product repository abstraction:** Product data access is isolated behind a `ProductRepository` interface, with Fake Store API implemented as the current provider. A different product source can be introduced without changing the business logic or API contracts.
- **Separation of responsibilities:** Routes, controllers, services, and repository logic have distinct responsibilities. This makes the code easier to maintain, test, and extend as business requirements grow.
- **Shared TypeScript contracts:** Shared product and API types help maintain consistency between the frontend and backend and reduce contract mismatches.
- **Centralised API communication:** The frontend uses a shared Axios client and service layer, making it easier to manage API configuration and introduce common request or response handling.
- **Environment-based configuration:** API URLs and SMTP settings are configurable through environment variables, avoiding hardcoded environment-specific values or committed secrets.
- **Independent email functionality:** Email delivery is isolated from product catalogue functionality. The catalogue remains available even when SMTP is not configured, while enquiry submissions return a clear error when email delivery is unavailable.
- **Automated tests:** Business logic and key API behaviours are covered by automated tests, providing a foundation for safely introducing future changes.

## Next steps with another day

1. **End-to-end testing:** Add Playwright tests covering complete user journeys, including product search, category navigation, product details, and enquiry submission. This would complement the existing unit and integration tests.
2. **Scalability and performance:** Introduce pagination for product listings and optimize image loading. This would help the application handle larger product catalogues without unnecessarily loading all products at once.
3. **Search improvements:** Extend search to support category matching and additional filtering options, making product discovery more flexible.
4. **API security:** Introduce rate limiting and basic spam protection on the enquiry endpoint to prevent abuse.
5. **Proper validations:** Add more robust validations to the enquiry form; it currently has only basic validations.
6. **Accessibility and UX:** Perform a more comprehensive accessibility review and refine loading states, image fallbacks, and responsive layouts across different screen sizes.
