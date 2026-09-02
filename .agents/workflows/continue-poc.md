# Continue a POC

Input: a `docs/pocs/<slug>/handoff.json` path.

1. Run `pnpm poc:status -- --handoff <input-path>`. Stop if validation fails; otherwise use its branch, next criterion, files, and required checks as the initial work queue.
2. Read the linked brief, tasks, verification file, repository instructions, current branch, diff, and recent commits.
3. Work only on `expectedBranch`. Preserve unrelated user changes. If `branchMatches` is false, switch safely before editing.
4. Implement `nextCriterion`; if it is null, report that the POC is complete and do not invent more scope.
5. Implement one reviewable increment. Mark tasks complete only with observable evidence.
6. Run the narrowest relevant test, then the commands in `requiredChecks`.
7. Record the completed criterion and its concrete evidence atomically with `pnpm poc:record -- --handoff <input-path> --criterion <AC-id> --evidence "<command and result>"`. The command must reject a branch mismatch. Never mark a criterion complete before its evidence exists.
8. Update the remaining verification summary with risks and decisions needed from the user.
9. Return the changed files, demo path, verified criteria, blockers, and next recommended increment.

Do not restart discovery already captured in the brief. Do not merge, deploy production, expose secrets, or broaden scope without explicit approval.
