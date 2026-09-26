# Fix CI

1. Read the failing job and reproduce the exact command locally.
2. Identify the first root-cause failure; ignore downstream noise.
3. Make the smallest correction and add regression coverage when appropriate.
4. Run the failed command, then `pnpm check`.
5. Report root cause, correction, evidence, and any unrelated failures left untouched.
