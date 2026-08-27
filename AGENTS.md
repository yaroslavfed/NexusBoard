## Microservice boundaries

NexusBoard is currently developed as a monorepo, but every microservice and application must be designed as if it could be moved to a separate repository.

The monorepo is only a development and repository organization choice. It must not be used to bypass service boundaries.

### Service independence

- Each microservice owns its domain, application logic, infrastructure, configuration, migrations and tests.
- A service must not import source code from another service.
- A service must not depend on another service being located in the same repository.
- Do not use relative filesystem imports between `services/*` or from `apps/*` into service internals.
- Do not share domain entities, repositories, application services or business rules between microservices.
- Do not introduce cross-service dependencies on internal NestJS modules, providers or classes.
- Services communicate only through explicit external contracts and transports such as HTTP, gRPC, RabbitMQ or another intentionally defined protocol.
- Internal implementation details of one service must not become compile-time dependencies of another service.
- Every service must remain independently buildable, testable, deployable and extractable from the monorepo.

A useful architectural check is:

> If a service were moved to a separate repository, only repository tooling, CI/CD, infrastructure configuration and package references should need adjustment. Its application architecture should not need to be redesigned.

### Application and service boundaries

Frontend and API Gateway must treat backend services as external systems even when they are stored in the same repository.

Do not do this:

```ts
import { TaskService } from '../../../services/task-service/src/tasks/application/task.service';
```

Do not import domain models or internal DTOs directly from another service or application.

Use an explicit contract instead:

- REST/OpenAPI
- GraphQL schema
- gRPC/protobuf
- RabbitMQ event or command contract
- WebSocket contract when applicable

Frontend communicates only with the public API/API Gateway and must never depend on internal service source code.

API Gateway must communicate with backend services through their public service contracts and must not import their internal NestJS modules or providers.

### Shared npm packages

Code placed under `packages/*` must be treated as an independently versionable npm package, not as a convenient shared folder.

Create a shared package only when there is a concrete reusable responsibility.

Prefer focused packages with explicit purposes, for example:

- `@nexusboard/contracts`
- `@nexusboard/eslint-config`
- `@nexusboard/tsconfig`
- `@nexusboard/observability`
- `@nexusboard/testing`

Avoid generic packages such as `shared`, `common`, `core` or `utils` unless their responsibility is narrow and clearly defined.

Shared packages must not contain service-specific business logic.

Do not move the following into shared packages:

- domain entities
- domain rules
- application services
- repositories
- service-specific validation rules
- authorization rules owned by a particular service
- internal DTOs that are not public contracts

A shared package should be independently publishable and versionable so that, if services are moved to separate repositories, a workspace dependency can be replaced by a normal npm package version without architectural changes.

### Contracts

`packages/contracts` is reserved for explicit contracts shared across process boundaries.

Appropriate contents include:

- protobuf definitions
- event schemas
- message contracts
- intentionally shared public API contract types

Do not place internal service domain models or implementation details in `packages/contracts`.

Contracts must evolve with backward compatibility in mind.

Services must not rely on every consumer upgrading to a new contract version at the same time.

### Dependency direction inside a service

Keep infrastructure dependencies outside the application and domain layers.

Application code should depend on abstractions or ports that it owns.

Infrastructure provides implementations of those ports.

For example:

```text
application
    -> TaskRepository port

infrastructure
    -> InMemoryTaskRepository
    -> PostgresTaskRepository
```

Do not make application or domain code depend directly on infrastructure implementations.

### Monorepo discipline

Do not introduce architecture that works only because all projects currently live in one repository.

When adding a dependency between projects, ask whether the same dependency would still make sense if the projects were stored in separate repositories.

If the answer is no, use an explicit service contract or a properly versioned npm package instead.

## Frontend

NexusBoard includes a frontend application that is developed in parallel with the backend.

Frontend architecture, technology choices, UI/UX conventions, mobile requirements, PWA requirements and agent workflow are defined in:

`docs/NEXUSBOARD_FRONTEND_GUIDELINES.md`

Before making any frontend-related changes, always read `docs/NEXUSBOARD_FRONTEND_GUIDELINES.md` and follow its requirements.

Do not rely on memory or assumptions about frontend conventions when this document is available.

When implementing or modifying a backend feature, evaluate whether the change introduces or modifies a user-facing scenario.

If it does:

1. Determine whether the frontend needs to be updated.
2. Update the frontend when the required backend contract is available.
3. Keep the frontend implementation proportional to the backend feature.
4. Do not expand the backend task into unrelated frontend redesign or refactoring.

The frontend is a first-class client, but backend development remains the primary learning focus of this project.

### Frontend architecture invariants

- Frontend uses Vue 3 + Vite + TypeScript.
- Frontend is an SPA.
- Frontend must support desktop and mobile layouts.
- Frontend must support installation and use as an iOS Web App/PWA.
- Frontend communicates only with the public API/API Gateway.
- Frontend must never call internal microservices directly.
- Backend is the source of truth for business rules and authorization.
- Do not duplicate backend business logic in the frontend.
- Prefer generated API contracts/client instead of manually duplicating DTOs.
- Use TanStack Vue Query for server state.
- Do not introduce Pinia or another global state manager unless there is a concrete need.
- Use shadcn-vue and the existing design system before creating custom UI primitives.
- Keep frontend architecture simple and avoid unnecessary abstractions.
- Every user-facing feature must be usable on both desktop and mobile.
- Mobile is a first-class supported client, not a degraded fallback.
- The primary UI language of NexusBoard is Russian.
- All user-facing text must be written in Russian unless a specific feature explicitly requires another language.
- The interface must be designed and tested with Russian text lengths in mind.
- Do not assume English text width when designing buttons, tabs, menus, dialogs, cards or navigation.
- Avoid layouts that only work because English labels are shorter.
- Buttons, menu items, form labels, placeholders, validation messages, empty states, errors, confirmations and notifications must use natural Russian wording.
- Do not use unnecessary English terms in the UI when a clear Russian equivalent exists.
- Technical names, product names, protocol names and established technical terms may remain in English where appropriate.

### Frontend changes during backend tasks

Do not automatically modify the frontend after every backend change.

Modify it when the backend change affects an actual user-facing scenario.

Examples:

- a new internal repository implementation does not require frontend changes
- a new REST endpoint used by the UI may require frontend changes
- a new task status transition should be reflected in the UI
- WebSocket events intended for users should be integrated into the UI
- internal RabbitMQ/gRPC/Redis changes do not require frontend changes unless they change observable user behaviour

When frontend work is required, implement only the UI necessary for the current feature and follow `docs/NEXUSBOARD_FRONTEND_GUIDELINES.md`.

### UI language and localization

NexusBoard is primarily a Russian-language application.

The default language for all user-facing UI is Russian.

This includes:

- navigation
- buttons
- headings
- forms
- placeholders
- validation messages
- dialogs
- confirmations
- empty states
- error states
- toast notifications
- tooltips
- notifications
- onboarding text

The layout must be resilient to Russian text, which is often longer than equivalent English labels.

Do not hardcode component widths around short English strings.

Prefer flexible layouts, wrapping, truncation with tooltips where appropriate, and responsive sizing.

Do not mix Russian and English in the UI without a clear reason.

Code identifiers, filenames, API names, DTO names, routes and technical implementation details remain in English.