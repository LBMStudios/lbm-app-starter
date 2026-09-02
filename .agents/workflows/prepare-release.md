# Prepare release

1. Confirm the intended commit and review the complete diff.
2. Run `pnpm verify` from a clean dependency install.
3. Review environment variables, database migrations, security boundaries, and rollback steps.
4. Update `docs/CURRENT_STATUS.md` and release notes.
5. Present the evidence and ask for explicit approval before production deployment or merge.
