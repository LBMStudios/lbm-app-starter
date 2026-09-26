# Implement an issue

1. Read the repository context and the issue. Translate it into observable acceptance criteria.
2. Inspect the smallest relevant code paths and tests. State a short plan.
3. Implement in small, reviewable steps using existing patterns.
4. Add or update unit tests and the important browser journey.
5. Run `pnpm check`; if UI behavior changed, run `/browser-qa`.
6. Summarize the diff, evidence, assumptions, risks, and suggested pull-request description.

Do not merge or deploy unless the user explicitly asks.
