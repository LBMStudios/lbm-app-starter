# Frontend rules

- Prefer Server Components. Create small Client Components only for state, effects, or browser APIs.
- Preserve semantic HTML, keyboard use, visible focus, labels, and responsive layouts.
- Avoid waterfalls: fetch independent data concurrently and move expensive work behind explicit boundaries.
- Do not use effects for data that can be derived during render.
- A visual change is incomplete until the main path and one narrow mobile viewport are checked in the browser.
- Prefer automated assertions over screenshot interpretation. Capture screenshots, traces, and video only for failures or deliberate visual review.
