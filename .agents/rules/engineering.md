# Engineering rules

- Read `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, and `docs/CURRENT_STATUS.md` first.
- Start by restating acceptance criteria and inspecting existing patterns.
- Keep the diff focused. Do not add packages or infrastructure without explaining the tradeoff.
- Run the narrowest relevant test while iterating, then `pnpm check` before handoff.
- Report changed files, commands run, evidence, remaining risks, and the next recommended action.
