# Formizo

Production-style Typeform-inspired form builder SaaS built with Turborepo, Next.js, Express, tRPC, Zod, Drizzle ORM, PostgreSQL, and Scalar API docs.

Creators can build dynamic forms, publish public or unlisted links, collect anonymous responses, review responses, and inspect analytics. Respondents can open published forms and submit responses without signing in.

## Demo Links

- Deployed frontend: **TODO: add deployed web URL**
- Backend API: **TODO: add deployed API URL**
- Scalar API docs: **TODO: add deployed API docs URL**, usually `/docs` on the API host
- OpenAPI JSON: **TODO: add deployed OpenAPI URL**, usually `/openapi.json` on the API host

Local development links:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:9000](http://localhost:9000)
- Scalar API docs: [http://localhost:9000/docs](http://localhost:9000/docs)
- OpenAPI JSON: [http://localhost:9000/openapi.json](http://localhost:9000/openapi.json)

## Demo Credentials

Use these credentials after running the demo seed data:

```txt
Email: demo@formizo.dev
Password: Password123!
```

## Features

- Creator authentication and protected dashboard
- Dynamic form builder with configurable fields and validations
- Public and unlisted published forms
- Anonymous public form submissions
- Response management and analytics-ready response data
- Public explore-ready visibility model
- Rate limiting for API routes
- Scalar API documentation from OpenAPI metadata
- Seedable demo forms, fields, responses, themes, and analytics counts

## Stack

- Turborepo monorepo
- `apps/web`: Next.js frontend
- `apps/api`: Express backend
- `packages/trpc`: tRPC routers, OpenAPI metadata, shared API client code
- `packages/database`: Drizzle ORM schema and migrations
- `packages/services`: business logic, authentication, forms, and mail flows
- Zod for input and response validation
- Scalar for API documentation

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create an environment file:

```bash
cp .env.example .env
```

Start the database or provide a hosted PostgreSQL connection string in `DATABASE_URL`.

Run database migrations:

```bash
pnpm db:migrate
```

Start all apps:

```bash
pnpm dev
```

## Useful Commands

```bash
pnpm dev          # run frontend and backend through Turborepo
pnpm build        # build all apps and packages
pnpm lint         # lint workspace
pnpm check-types  # type-check workspace
pnpm db:generate  # generate Drizzle migrations
pnpm db:migrate   # run Drizzle migrations
```

## API Documentation

Scalar is served by the backend API.

- Local Scalar docs: [http://localhost:9000/docs](http://localhost:9000/docs)
- Local OpenAPI document: [http://localhost:9000/openapi.json](http://localhost:9000/openapi.json)

The OpenAPI document is generated from tRPC route metadata using `trpc-to-openapi`.

## Environment

All required and optional variables are documented in [.env.example](.env.example).

For local development, the default API URL expected by the web app is:

```txt
NEXT_PUBLIC_API_URL=http://localhost:9000/trpc
```

The API also exposes REST-style OpenAPI endpoints under:

```txt
http://localhost:9000/api
```

## Submission Checklist

- Add deployed frontend URL to this README
- Add deployed backend API URL to this README
- Add deployed Scalar docs URL to this README
- Confirm demo credentials work
- Confirm seeded demo data is available
- Confirm public forms appear in explore/template areas
- Confirm unlisted forms only work through direct links
- Confirm unpublished forms do not accept responses
