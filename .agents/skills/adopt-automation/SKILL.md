---
name: adopt-automation
description: Adopt the LBM automated development stack in an existing repository. Use when migrating or standardizing an existing app for shared ChatGPT/Codex and Antigravity instructions, deterministic quality gates, Playwright browser QA, GitHub CI, Vercel previews, production monitoring, or safe release controls without overwriting project-specific conventions.
---

# Adopt automation

1. Run `pnpm stack:adopt -- --target <path>` from the starter and treat its output as a read-only inventory.
2. Verify the generated adoption matrix against the target repository evidence: already present, compatible addition, requires adaptation, or out of scope. Do not assume Next.js, pnpm, Supabase, or Vercel.
3. Preserve existing behavior and user changes. Never replace configuration wholesale when it can be merged.
4. Add a concise root `AGENTS.md` and compatible skills under `.agents/skills/`; keep tool-specific workflows separate.
5. Establish one native quality command covering lint, types, unit tests, and build. Add browser checks only for observable routes and critical journeys.
6. Configure failure-only browser artifacts. Add preview, monitoring, or release workflows only for the deployment provider actually in use.
7. Never copy credentials. Document required variables and secrets by name, with the minimum scope.
8. Present the matrix and proposed scope before editing. Apply only approved layers, then run existing checks before and after adoption. Report regressions, unsupported assumptions, external setup, and the smallest safe next step.
