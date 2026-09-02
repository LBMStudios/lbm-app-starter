# Meeting to POC

Use the `meeting-to-poc` skill with the meeting transcript, voice note, notes, or linked source provided by the user.

1. Create and validate the privacy-safe POC package.
2. Create or switch to the generated `poc/<slug>` branch without discarding unrelated changes.
3. Implement the smallest end-to-end slice that demonstrates the recorded hypothesis.
4. Keep `tasks.md` and `verification.md` aligned with actual evidence.
5. Run the required checks and use `/browser-qa` only when browser behavior changed or deterministic checks fail.
6. Stop with a reviewable diff, demo instructions, remaining assumptions, and the exact `/continue-poc` command.

Do not merge or deploy production.
