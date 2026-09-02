# LBM App Starter — agent contract

Read `docs/PROJECT_CONTEXT.md` and `docs/CURRENT_STATUS.md` before changing code.

## Working agreement

- Keep changes scoped to one issue and explain non-obvious tradeoffs.
- Use Server Components by default; add `"use client"` only at an interaction boundary.
- Validate external input with Zod and enforce authorization at the data layer.
- Never expose a Supabase service-role key to the browser or commit credentials.
- Add or update tests for behavior changes.
- When meeting transcripts, voice notes, or product notes should become implementation, use the shared `meeting-to-poc` skill. Never commit the raw transcript; create the validated POC package and hand off its path.
- Run `pnpm check` before handing work off. Run `pnpm verify` for release candidates.
- For any route, UI, navigation, or form change, use the shared `frontend-qa` skill. Run the focused headless Playwright test first.
- Do not open the browser or analyze screenshots after a successful headless run. On failure, inspect the retained browser issues and trace before screenshot/video evidence.
- Update `docs/CURRENT_STATUS.md` when a change affects setup, architecture, or pending work.
- Never promote, roll back, merge, or deploy production from agent initiative. Require the repository's explicit manual approval path.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
