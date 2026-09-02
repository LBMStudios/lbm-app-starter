import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { inspectStack, summarizeChecks } from "../../scripts/stack-doctor.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("resume el estado por severidad", () => {
  assert.equal(summarizeChecks([{ status: "pass" }]).status, "ready");
  assert.equal(summarizeChecks([{ status: "warn" }]).status, "ready_with_external_setup");
  assert.equal(summarizeChecks([{ status: "fail" }]).status, "blocked");
});

test("el starter tiene completo su núcleo local", async () => {
  const result = await inspectStack({ cwd: repositoryRoot });

  assert.equal(result.counts.fail, 0);
  assert.equal(result.checks.find(({ id }) => id === "agent-files").status, "pass");
  assert.equal(result.checks.find(({ id }) => id === "package-scripts").status, "pass");
  assert.equal(result.checks.find(({ id }) => id === "poc-packages").status, "pass");
});
