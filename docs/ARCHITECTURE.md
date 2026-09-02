# Architecture

## Boundaries

- `src/app`: routes, layouts, errors and route-level composition.
- `src/components`: reusable UI with narrow props.
- `src/lib`: domain utilities and external-service clients.
- `tests/e2e`: high-value user journeys, not implementation details.
- `.agents`: shared Antigravity operating instructions.
- `docs/pocs`: generated, versioned meeting-to-POC contracts and verification evidence.
- `scripts/poc-package.mjs`: deterministic validation and materialization of agent handoffs.

## Data and authentication

Supabase integration uses `@supabase/ssr` with a publishable key. Server authorization must validate identity with `auth.getClaims()` and Row Level Security; do not rely on unverified session data. Keep service-role operations in isolated server-only code if a project truly needs them.

The starter does not activate auth refresh globally because Supabase is optional. When auth is added, implement a root `proxy.ts` following the current Supabase SSR guide and cover login/logout with Playwright.
