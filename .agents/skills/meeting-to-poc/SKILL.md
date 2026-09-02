---
name: meeting-to-poc
description: Convert meeting transcripts, voice notes, or product notes into a privacy-safe, testable proof of concept and a durable GitHub handoff for Codex and Antigravity. Use when work should continue automatically after a meeting; do not use for meeting summaries that require no implementation.
---

# Meeting to POC

Produce a reviewable POC without making the user restate meeting context.

1. Read `AGENTS.md`, project context, current status, and the relevant code before proposing changes.
2. Extract confirmed decisions, desired outcome, users, constraints, in/out scope, assumptions, open questions, observable acceptance criteria, demo flow, and success signals.
3. Do not commit the raw transcript, credentials, personal data, private customer data, or unrelated conversation. Reference the source briefly and keep only the minimum derived product context.
4. Ask only about a missing decision that would materially change the POC. Record non-blocking uncertainty as an explicit assumption or open question.
5. Build a version-1 intake JSON following [the handoff contract](references/handoff-contract.md). Validate and materialize it with `pnpm poc:create -- --input <temporary-json>`.
6. Work on `poc/<slug>`. Implement the smallest vertical slice that demonstrates the hypothesis; avoid speculative infrastructure and production mutations.
7. Run the narrowest checks while iterating, then every check listed in `handoff.json`. Close each acceptance criterion together with concrete evidence using `pnpm poc:record`; never mark it complete manually without evidence.
8. If browser behavior changes, use `frontend-qa`. Do not inspect screenshots after a deterministic pass.
9. Hand off the branch or pull request with the package path and the Antigravity command `/continue-poc docs/pocs/<slug>/handoff.json`.

Never merge, deploy production, purchase API usage, or enable an external integration without explicit authorization.
