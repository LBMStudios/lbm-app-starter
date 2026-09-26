# Browser QA

1. Add the changed public route to `tests/e2e/routes.ts` and encode its key observable behavior as Playwright assertions.
2. Run the focused headless spec first. It must check the response, content, framework overlays, console errors, page errors, request failures, and 5xx responses.
3. If it passes, do not spend time generating or interpreting screenshots.
4. If it fails, inspect the retained screenshot, video, trace, and `browser-issues` attachment; correlate them with server logs.
5. Use a headed desktop/mobile inspection only for deliberate visual or interaction changes.
6. Fix the root cause, rerun the focused spec, then return a compact pass/fail checklist with residual risks.
