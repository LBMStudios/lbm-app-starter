# Browser QA automation

## Objective

Fast feedback should be deterministic. An AI model should not open every page, take a screenshot, and infer health from pixels after each change.

## Default loop

1. Unit tests validate domain behavior.
2. `tests/e2e/smoke.spec.ts` validates registered routes headlessly.
3. Successful runs produce no screenshots for analysis.
4. Failed runs retain a screenshot, video, trace, browser issues, and HTML report.
5. The agent inspects those failure artifacts, fixes the root cause, and reruns only the focused spec.

## Preview environment

Vercel Git Integration reports a successful Preview deployment to GitHub. The `Preview E2E` workflow checks out that exact deployment commit and supplies its target URL through `PLAYWRIGHT_BASE_URL`, so Playwright skips the local dev server and validates the deployed artifact.

Protected previews may use the optional `VERCEL_AUTOMATION_BYPASS_SECRET` GitHub secret. The Playwright configuration sends it as `x-vercel-protection-bypass`; never log or commit the value.

## Production monitoring

Set the GitHub repository variable `PRODUCTION_URL`. The scheduled workflow runs the same deterministic browser and accessibility checks every six hours. A successful run retains no diagnostics; a failure retains the report, trace, screenshot, video, and structured issues for seven days.

GitHub Actions provides the failure signal. Add a separate notification integration only when a project has a concrete incident-response destination; the starter must not invent Slack, email, or webhook credentials.

## Adding a route

Add its path and expected main heading to `tests/e2e/routes.ts`. Add a separate test only for business-critical interactions such as login, checkout, form submission, or report generation.

## Visual regression

Use Playwright screenshot baselines only for stable, high-value surfaces. Do not snapshot every route: dynamic data, fonts, and animation produce noisy diffs. Create or update a baseline intentionally during a headed review, then let CI compare future renders.

## Failure artifacts

GitHub Actions uploads `playwright-diagnostics` for seven days. Download it from the failed browser job and provide the trace or screenshot to Codex/Antigravity; the agent should not repeat the full manual review.
