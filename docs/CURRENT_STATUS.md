# Current status

## Ready

- Next.js App Router, strict TypeScript, React and Tailwind CSS.
- Optional Supabase browser/server client factories.
- Unit, browser, lint, type and production-build checks.
- Headless route health checks with screenshots, video, traces, and browser issues retained only on failure.
- Automatic Playwright verification against successful Vercel Preview deployments.
- WCAG accessibility checks on every registered public route.
- Scheduled production browser monitoring with failure-only diagnostics.
- Opt-in Vercel Web Analytics and Speed Insights instrumentation.
- Manual, approval-gated Vercel promotion and rollback workflow.
- Shared adoption skill for integrating compatible automation into existing repositories.
- Read-only adoption analyzer with stack detection, compatibility matrix and ordered next steps.
- GitHub Actions, Dependabot and contribution templates.
- Antigravity workspace rules, workflows and reusable skills.
- Custom specialized agents (`ui-builder`, `db-architect`, `qa-tester`) in `.agents/agents/`.
- Interactive survey engine with Universal Assistance branding, step transitions and Zod validation.
- CLI scaffolding for interactive surveys (`pnpm scaffold:survey`) with `/scaffold-survey` workflow.
- MCP configurations for live GitHub and Supabase schema inspection in `.agents/mcp_config.json`.
- Validated meeting-to-POC packages with a `/continue-poc` Antigravity handoff.
- Local stack doctor for agent files, commands, POC integrity, Git state and Vercel linkage.

## Next project setup

1. Install the ChatGPT Codex Connector on the selected GitHub repositories and publish this starter.
2. Replace the sample homepage and update `docs/PROJECT_CONTEXT.md`.
3. Create `.env.local` from `.env.example` if Supabase is used.
4. Add the project origin and redirect URLs in Supabase Auth.
5. Enable RLS for every exposed table and explicitly grant Data API access.
6. Connect the GitHub repository to Vercel and protect `main` with the CI check.
