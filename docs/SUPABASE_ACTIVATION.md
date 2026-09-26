# Supabase activation

Supabase clients are available, but local containers and schema files are intentionally not imposed on projects that do not use a database.

When a project adopts Supabase:

1. Read the current Supabase changelog and CLI documentation.
2. Run `supabase init`, then commit `supabase/config.toml` and migrations.
3. Create migrations through the CLI; do not invent timestamped filenames.
4. Explicitly grant Data API access only to intended roles and enable RLS on every exposed table.
5. Test unauthenticated, owner, cross-user, and privileged access.
6. Run database advisors and regenerate TypeScript types before the pull request.
7. Keep Supabase MCP read-only until a reviewed task explicitly requires schema mutation.

Authorization must use ownership or membership predicates. `TO authenticated` alone is not authorization, and client code must never receive a service-role or secret key.
