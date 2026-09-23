# BRACE Digital Platform — Backend API

Node.js/TypeScript backend for the BRACE Digital Platform's application
layer (accounts, workflows, applications, dashboards — as distinct from the
CMS/content-publishing layer described in the platform concept).

Layered, object-oriented (SOLID) architecture: controllers → services →
repository interfaces, wired together through a single composition root,
so new modules can be added the same way without restructuring.

## Stack

- Node.js 18+, TypeScript (strict mode)
- Express
- MySQL via Prisma ORM, with in-memory repositories as an automatic
  fallback when no database is configured (see "Database" below)
- JWT-based authentication (`jsonwebtoken`)
- `zod` for request validation
- `bcryptjs` for password hashing
- `swagger-ui-express` for interactive API docs
- `helmet`, `cors`, `morgan` for baseline HTTP hardening/logging
- Structured JSON logging (`utils/Logger.ts`), including a per-request
  audit line for every endpoint hit (see "Request logging" below)

## Project structure

```
src/
  composition/    Single composition root — wires every repository, service
                  and controller exactly once (see "Why a composition root")
  config/         Environment/config loading, PrismaService (DB client)
  controllers/    HTTP request/response handling only — no business logic
  services/       Business logic, framework-agnostic
  repositories/   Persistence interfaces + implementations (in-memory and
                  Prisma/MySQL — swappable, see "Database" below)
  routes/         Express routers, composed per feature
  middlewares/    Auth guards, error handling, 404 handling, request logging
  errors/         Typed AppError hierarchy
  types/          Shared interfaces, enums, validation schemas
  utils/          Logger, TokenService, shared request validation
  docs/           Hand-authored OpenAPI 3.0 specification
  app.ts          Express app assembly (class-based), routing, Swagger UI
  server.ts       Process entry point — starts/stops the HTTP server,
                  connects/disconnects Prisma
prisma/
  schema.prisma   Data model (User, Partner, TrainingApplication)
  seed.ts         Seeds the same demo accounts/partners as the in-memory
                  repositories, for parity when you switch to MySQL
```

### Why a composition root

Early on, each route file constructed its own repository instance. That's a
real bug once the same data is reachable through more than one path (e.g. a
root-level alias and a versioned route): the two paths would silently see
*different* in-memory data. `composition/container.ts` now builds every
repository, service and controller exactly once for the process lifetime;
every route file imports controllers from there. The composition root also
decides *once* whether to use the MySQL-backed (Prisma) repositories or the
in-memory ones, based on whether `DATABASE_URL` is set — nothing else in
the codebase needs to know which one is active.

### Design notes

- **Layered / OOP**: controllers depend on services via constructor
  injection; services depend on repository *interfaces*, not concrete
  implementations.
- **Typed errors**: throw `ValidationError`, `UnauthorizedError`,
  `ForbiddenError`, `NotFoundError`, or `ConflictError` from anywhere;
  `errorHandlerMiddleware` turns them into the right HTTP response
  automatically.
- **Roles**: `UserRole` mirrors the stakeholder groups in the BRACE
  governance model (super admin, web manager, technical reviewer, country
  coordinator, consortium partner, applicant). Protected routes use
  `authenticate` + `authorize(...)` from `middlewares/auth.middleware.ts`.
- **API versioning**: the canonical path prefix is `/api/v1`. `/api` is
  kept as an alias of the current version. A handful of root-level
  shortcuts (`/health`, `/login`, `/register`, `/me`, `/auth/*`,
  `/partners`, etc.) exist for convenience during early frontend
  integration — they resolve to the exact same controllers/data as the
  versioned routes (see composition root above), so nothing drifts.

## Getting started

```bash
npm install
cp .env.example .env    # then set a real JWT_SECRET
npm run dev              # starts with ts-node + nodemon on PORT (default 4000)
```

Build and run compiled output:

```bash
npm run build
npm start
```

## Database (MySQL via Prisma)

The app runs against in-memory repositories out of the box — no database
required to try it. To switch to real, persistent MySQL storage:

1. Have a MySQL 8+ server reachable (local install, Docker container, or a
   managed instance).
2. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/brace_platform
   ```
3. Generate the Prisma client and create the schema:
   ```bash
   npx prisma generate       # also runs automatically on npm install
   npx prisma migrate dev --name init
   ```
4. Optionally load the same demo accounts/partners the in-memory
   repositories ship with:
   ```bash
   npm run db:seed
   ```
5. Start the app as usual (`npm run dev` / `npm start`). On boot, the
   composition root logs which persistence layer is active
   (`Persistence layer: MySQL (Prisma)` vs `in-memory`), and `server.ts`
   connects/disconnects the Prisma client around the HTTP server's
   lifecycle.

No code changes are needed to switch back and forth — just set or unset
`DATABASE_URL`. `AuthService`, `PartnerService` and
`TrainingApplicationService` depend only on the `IUserRepository` /
`IPartnerRepository` / `ITrainingApplicationRepository` interfaces, and
`src/repositories/Prisma*Repository.ts` implement those interfaces exactly
like the in-memory versions do — including translating between Prisma's
generated `UserRole`/`ApplicationStatus` enums (SCREAMING_CASE, Prisma's
convention) and this app's own lowercase domain enums, so that translation
never leaks into services or controllers.

Other useful commands:

| Command | Purpose |
|---|---|
| `npm run prisma:studio` | Browser GUI to inspect/edit data |
| `npm run prisma:migrate` | Create + apply a new migration in development |
| `npm run prisma:migrate:deploy` | Apply pending migrations (CI/production) |

## Request logging

Every request gets one structured JSON log line, written once the response
has finished, via `middlewares/requestLogger.middleware.ts`:

```json
{
  "timestamp": "2026-09-19T09:32:10.123Z",
  "level": "info",
  "context": "HTTP",
  "message": "POST /api/v1/auth/login -> 200",
  "meta": {
    "method": "POST",
    "path": "/api/v1/auth/login",
    "statusCode": 200,
    "durationMs": 42.17,
    "ip": "127.0.0.1",
    "userAgent": "curl/8.5.0",
    "user": { "id": "usr_001", "email": "admin@brace-initiative.org", "role": "super_admin" }
  }
}
```

For unauthenticated requests, `"user"` is the string `"anonymous"` rather
than an object. This is deliberately separate from the `morgan` dev tail
(which stays, for a quick human-readable log while developing) — this one
is the structured, machine-parseable audit trail, and is what you'd wire a
log aggregator (e.g. CloudWatch, Datadog, ELK) up to in production.

## API documentation

- **Interactive (Swagger UI)**: `GET /docs` — browse and try every endpoint
  from the browser, including sending a bearer token via the "Authorize"
  button.
- **Raw OpenAPI 3.0 spec**: `GET /openapi.json` — import into Postman,
  Insomnia, or any codegen tool.
- **API directory**: `GET /` — a plain-JSON map of every mounted endpoint,
  its HTTP method, aliases, and which roles it's restricted to.

The spec is hand-authored in `src/docs/openapi.ts` (not generated from
scattered JSDoc comments), so it's one file to review and can't silently
drift out of sync. Update it whenever a route changes.

## Endpoints implemented so far

All paths below are shown under `/api/v1`; `/api` and the listed root
shortcuts resolve identically.

### Health

| Method & path | Auth | Notes |
|---|---|---|
| `GET /api/v1/health` (or `/health`) | none | General status + uptime |
| `GET /api/v1/health/live` (or `/health/live`, `/live`) | none | Liveness probe |
| `GET /api/v1/health/ready` (or `/health/ready`, `/ready`) | none | Readiness probe |

### Auth

| Method & path | Auth | Notes |
|---|---|---|
| `POST /api/v1/auth/login` (or `/auth/login`, `/login`) | none | Returns a JWT |
| `POST /api/v1/auth/register` (or `/auth/register`, `/register`) | none | Always creates an `applicant` account — see below |
| `GET /api/v1/auth/me` (or `/auth/me`, `/me`) | Bearer | Current user's profile |
| `POST /api/v1/auth/logout` (or `/auth/logout`, `/logout`) | none | Stateless — see note below |
| `GET /api/v1/auth/users` (or `/auth/users`, `/users`) | Bearer, roles: `super_admin`, `technical_reviewer` | Lists all accounts |

**Why register can't set a role**: accepting a `role` field on a public
endpoint would let anyone register as an admin. Self-registration always
creates an `applicant`; staff accounts (coordinators, reviewers, admins)
must be provisioned separately once a proper admin/user-management flow
exists.

**Why logout does nothing server-side**: JWTs are stateless and carry their
own expiry, so there's no session to destroy. The endpoint exists for a
conventional REST contract and as a place to add a token-blacklist or
refresh-token scheme later — for now the client just discards the token.

Development-only seeded accounts (see `InMemoryUserRepository`), all using
password `ChangeMe123!`:

| Email | Role |
|---|---|
| admin@brace-initiative.org | super_admin |
| reviewer@oeko-institut.de | technical_reviewer |
| coordinator.gh@brace-initiative.org | country_coordinator |

### Partners

Seeded from the BRACE consortium partner list in the concept document.
Fully public — a partner directory isn't sensitive.

| Method & path | Auth |
|---|---|
| `GET /api/v1/partners` (or `/partners`) | none |
| `GET /api/v1/partners/:id` (or `/partners/:id`) | none |
| `GET /api/v1/partners/country/:country` | none |

### Trainings (Policy Expert Training Programme applications)

Mirrors the submit → review → approve workflow from the platform report's
governance table (External applicant → Country coordinator → Consortium
review panel).

| Method & path | Auth |
|---|---|
| `POST /api/v1/trainings/applications` | none — anyone can apply |
| `GET /api/v1/trainings/applications` | Bearer, roles: `super_admin`, `country_coordinator`, `technical_reviewer` |
| `GET /api/v1/trainings/applications/:id` | same as above |
| `PATCH /api/v1/trainings/applications/:id/review` | Bearer, roles: `country_coordinator`, `super_admin` |

Reviewing an application that's already `approved` or `rejected` returns a
`409 Conflict` — approvals are terminal in this first slice; a "reopen"
action would be a separate, audited endpoint.

## Adding a protected route

```ts
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user.types';

router.get(
  '/some-resource',
  authenticate,
  authorize(UserRole.COUNTRY_COORDINATOR, UserRole.SUPER_ADMIN),
  someController.someHandler,
);
```

Remember to also add the path to `src/docs/openapi.ts` so it shows up in
`/docs`.

## Not yet implemented

Deliberately out of scope for this slice, to be added incrementally:
refresh tokens, password reset, admin-driven staff user provisioning,
content/resource endpoints, country dashboards, and automated tests.

## A note on this sandbox and `prisma generate`

This project was assembled in a sandboxed environment whose network
access is limited to package registries (npm, GitHub, etc.) and does not
reach `binaries.prisma.sh`, the host Prisma downloads its query-engine
binary from. That means `npx prisma generate` could not be run to
completion here, so the Prisma-touching files
(`config/prisma.ts`, `repositories/Prisma*Repository.ts`) could not be
type-checked end-to-end in this environment — every other file was
verified with `tsc --noEmit` and compiles cleanly. Running
`npm install` (which triggers `prisma generate` via the `postinstall`
script) on a machine with normal internet access will generate the
client and resolve this immediately; there is nothing else to change.
