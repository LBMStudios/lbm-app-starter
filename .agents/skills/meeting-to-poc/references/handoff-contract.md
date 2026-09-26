# Handoff contract v1

Create a temporary JSON object with exactly these fields. The generator adds `routing`; do not provide it in the intake.

```json
{
  "schemaVersion": 1,
  "slug": "lowercase-kebab-case",
  "title": "POC title",
  "source": {
    "kind": "meeting | voice-note | notes",
    "date": "YYYY-MM-DD",
    "reference": "Short non-sensitive source reference",
    "language": "es"
  },
  "problem": "Observed problem",
  "users": ["Affected user"],
  "desiredOutcome": "Observable outcome",
  "constraints": ["Confirmed constraint"],
  "scope": {
    "in": ["Included behavior"],
    "out": ["Explicit non-goal"]
  },
  "decisions": ["Confirmed decision"],
  "assumptions": [
    { "statement": "Assumption", "needsValidation": true }
  ],
  "openQuestions": ["Non-blocking question"],
  "acceptanceCriteria": [
    { "id": "AC-1", "statement": "Observable, testable behavior" }
  ],
  "poc": {
    "hypothesis": "What this vertical slice should prove",
    "demoFlow": ["First user-visible step"],
    "implementationNotes": ["Relevant implementation constraint"],
    "successSignals": ["Evidence that supports the hypothesis"],
    "requiresBrowser": true
  }
}
```

Rules:

- Use stable sequential criterion IDs: `AC-1`, `AC-2`, and so on.
- Make `requiresBrowser` true for routes, forms, navigation, responsive UI, or browser interactions.
- Keep the raw transcript outside Git. A URL or recording reference may be included only when access and confidentiality permit it.
- A blocking unknown is one where different answers produce materially different code or risk. Ask the user before implementing it.
- Put every other uncertainty in `assumptions` or `openQuestions` so another agent can continue safely.
