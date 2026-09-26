# Release automation

`Production Control` is a manually triggered GitHub Actions workflow. It never runs from a push or agent completion.

## Setup

1. Create a GitHub Environment named `production` and configure required reviewers.
2. Add the GitHub secret `VERCEL_TOKEN` with the minimum suitable Vercel scope.
3. If the deployment belongs to a team, set the repository variable `VERCEL_SCOPE` to its team slug.
4. Keep `VERCEL_AUTOMATION_BYPASS_SECRET` configured when candidate previews are protected.

## Promote

Choose `promote`, provide the exact candidate deployment URL, and confirm the production change. The workflow runs the complete browser/accessibility suite first; promotion cannot run if verification fails. The production environment approval remains a second human gate.

## Rollback

Choose `rollback`, provide the exact known-good deployment URL, and confirm. GitHub environment approval is still required. Rollback intentionally does not depend on the currently broken application passing tests.

Do not weaken the environment approval to let an agent publish autonomously.
