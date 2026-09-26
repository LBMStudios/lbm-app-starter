# Antigravity setup

Antigravity reads this workspace automatically:

- `rules/`: permanent engineering, frontend, and security constraints.
- `workflows/`: invoke with `/implement-issue`, `/fix-ci`, `/browser-qa`, or `/prepare-release`.
- `skills/`: specialized checklists loaded when the task matches.
- `hooks.json`: runs `pnpm check` when an agent finishes; a failure sends it back to correct the issue.

To enable MCP, copy `mcp_config.example.json` to the local, gitignored `mcp_config.json`. Provide credentials through environment variables, never in the file. Keep Supabase MCP read-only until a task explicitly needs schema changes.
