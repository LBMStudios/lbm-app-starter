# Architecture decisions

## 2026-09-02 — Node 22 baseline

Node 22 is the minimum because current Supabase libraries no longer support Node 20.

## 2026-09-02 — One command quality gate

`pnpm check` is the local and CI contract: lint, types, unit tests, then production build. Browser tests remain a separate release-level gate in `pnpm verify` so daily feedback stays fast.

## 2026-09-02 — Repository-owned agent context

Project rules, workflows and skills live with the code. ChatGPT/Codex and Antigravity therefore receive the same durable context rather than depending on a long chat history.

## 2026-09-02 — Verify deployed previews

Browser tests target successful Vercel Preview deployments through GitHub's deployment status event. This catches environment, routing, and runtime failures that a local server cannot reproduce, without automatically promoting anything to production.

## 2026-09-02 — Opt-in observability and database infrastructure

Web Analytics and Speed Insights are loaded only when explicitly enabled. Supabase clients remain ready, but the local Docker stack and schema are added only when a project adopts a database. This keeps prototype startup fast without weakening the migration and RLS requirements for stateful applications.

## 2026-09-02 — GitHub is the cross-agent handoff

Meeting context is reduced to a validated, privacy-safe POC package committed with the implementation. Codex and Antigravity share that contract through the repository instead of relying on chat history or an unavailable direct Antigravity trigger. Raw transcripts and unnecessary personal data stay outside Git.
