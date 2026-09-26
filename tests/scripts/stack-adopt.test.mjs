import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  inspectAdoption,
  parseAdoptionArgs,
  summarizeMatrix,
} from "../../scripts/stack-adopt.mjs";

test("conserva las cuatro categorías de adopción", () => {
  const summary = summarizeMatrix([
    { status: "already_present" },
    { status: "compatible_addition" },
    { status: "requires_adaptation" },
    { status: "out_of_scope" },
  ]);

  assert.deepEqual(summary, {
    already_present: 1,
    compatible_addition: 1,
    requires_adaptation: 1,
    out_of_scope: 1,
  });
});

test("bloquea cualquier intento de aplicar cambios", () => {
  assert.throws(
    () => parseAdoptionArgs(["--target", "../app", "--apply"]),
    /exclusivamente de lectura/u,
  );
});

test("analiza un proyecto existente sin modificarlo", async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), "lbm-stack-adopt-"));
  try {
    await mkdir(path.join(target, ".github/workflows"), { recursive: true });
    await writeFile(
      path.join(target, "package.json"),
      JSON.stringify({
        name: "existing-app",
        packageManager: "pnpm@11.25.0",
        scripts: { lint: "eslint .", build: "next build" },
        dependencies: { next: "16.3.4", react: "19.2.8" },
      }),
    );
    await writeFile(path.join(target, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
    await writeFile(path.join(target, ".github/workflows/deploy.yml"), "name: Existing deployment\n");

    const result = await inspectAdoption({ target });
    const byId = Object.fromEntries(result.matrix.map((item) => [item.id, item]));

    assert.equal(result.mode, "dry-run");
    assert.equal(result.mutations, 0);
    assert.equal(result.detected.framework, "nextjs");
    assert.equal(result.detected.packageManager, "pnpm");
    assert.equal(byId["quality-gate"].status, "requires_adaptation");
    assert.equal(byId["continuous-integration"].status, "requires_adaptation");
    assert.equal(byId["meeting-to-poc"].status, "compatible_addition");
    assert.equal(byId["supabase-safety"].status, "out_of_scope");
  } finally {
    await rm(target, { recursive: true, force: true });
  }
});
