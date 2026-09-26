---
name: release-check
description: Run the repository release gate and prepare evidence without deploying or merging.
---

# Release check

1. Confirm branch, diff, runtime version, and lockfile state.
2. Install with `pnpm install --frozen-lockfile` and run `pnpm verify`.
3. Inspect client bundles and logs for secrets or sensitive data.
4. Summarize checks, failures, rollback needs, and unresolved risks.
5. Stop before merge or production deployment and request approval.
