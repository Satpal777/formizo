# Formizo Web

Next.js frontend for the Formizo form-building workspace.

## Folder Structure

- `app/` - App Router entrypoints, global CSS, fonts, and route files.
- `components/layout/` - Application shell and shared page layout components.
- `components/ui/` - Small reusable UI primitives. Add only components that are used.
- `config/` - Static navigation, workspace, and product configuration.
- `features/` - Feature modules such as forms, analytics, responses, and themes.
- `lib/` - Framework-agnostic utilities.
- `providers/` - Client providers for theme, tRPC, and React Query.
- `trpc/` - Web tRPC clients for server and browser usage.
- `types/` - Shared frontend-only TypeScript types.

## Development

From the repository root:

```bash
pnpm run dev --filter web
```

Run type checks with:

```bash
pnpm run check-types --filter web
```

## UI Direction

The default interface follows the saved Formizo style guide: dark-first, dense, panel-based, and inspired by developer tools. Keep new UI work modular and avoid generic SaaS dashboard patterns.
