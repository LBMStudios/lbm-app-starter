---
name: frontend-qa
description: Verify routes, forms, navigation, layouts, and interactive UI with fast headless Playwright checks. Use for frontend implementation, browser QA, blank or broken pages, console/runtime/network errors, responsive behavior, or visual changes; inspect screenshots, video, and traces only when the deterministic checks fail or the user explicitly requests visual review.
---

# Frontend QA

## Procedure

1. Identify the smallest observable user journey and its failure states.
2. Add or update stable role/label assertions. Register public routes in `tests/e2e/routes.ts`.
3. Run the focused Playwright spec headlessly. Validate response, meaningful content, overlays, console/page errors, failed requests, and 5xx responses.
4. Run the relevant accessibility spec for new or changed public UI; do not suppress violations without documenting a justified exception.
5. If it passes, report the deterministic evidence and stop; do not open a browser or analyze screenshots.
6. If it fails, inspect `browser-issues` and the retained trace first. Use screenshots/video for visual context, then correlate with server logs.
7. Use headed desktop and mobile inspection only for deliberate visual, responsive, keyboard, or interaction review.
8. Fix the root cause, rerun the focused spec, and report exact evidence plus residual risks. Never claim a pass from visual inspection alone.
