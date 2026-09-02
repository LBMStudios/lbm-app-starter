import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { checkPackages } from "./poc-package.mjs";

const REQUIRED_FILES = [
  "AGENTS.md",
  ".agents/hooks.json",
  ".agents/skills/frontend-qa/SKILL.md",
  ".agents/skills/meeting-to-poc/SKILL.md",
  ".agents/workflows/browser-qa.md",
  ".agents/workflows/continue-poc.md",
  ".github/workflows/ci.yml",
  ".github/workflows/preview-e2e.yml",
  ".github/workflows/production-control.yml",
  "playwright.config.ts",
];

const REQUIRED_SCRIPTS = [
  "check",
  "verify",
  "test:e2e",
  "poc:create",
  "poc:check",
  "poc:status",
  "poc:record",
  "stack:adopt",
];

async function exists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim(),
  };
}

function check(id, status, detail, fix = null) {
  return { id, status, detail, ...(fix ? { fix } : {}) };
}

export function summarizeChecks(checks) {
  const counts = checks.reduce(
    (summary, item) => ({ ...summary, [item.status]: summary[item.status] + 1 }),
    { pass: 0, warn: 0, fail: 0 },
  );
  return {
    status: counts.fail > 0 ? "blocked" : counts.warn > 0 ? "ready_with_external_setup" : "ready",
    counts,
  };
}

export async function inspectStack({ cwd = process.cwd() } = {}) {
  const root = path.resolve(cwd);
  const packagePath = path.join(root, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  const checks = [];

  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  checks.push(
    check(
      "node",
      nodeMajor >= 22 ? "pass" : "fail",
      `Node ${process.versions.node}; requerido >=22.`,
      nodeMajor >= 22 ? null : "Instala Node 22 o superior.",
    ),
  );

  const expectedPnpm = packageJson.packageManager?.replace("pnpm@", "") ?? "";
  const pnpm = run("pnpm", ["--version"], root);
  const expectedMajor = expectedPnpm.split(".")[0];
  const actualMajor = pnpm.output.split(".")[0];
  const pnpmStatus = !pnpm.ok || actualMajor !== expectedMajor
    ? "fail"
    : pnpm.output === expectedPnpm
      ? "pass"
      : "warn";
  checks.push(
    check(
      "pnpm",
      pnpmStatus,
      `pnpm ${pnpm.output || "no disponible"}; fijado ${expectedPnpm}.`,
      pnpmStatus === "pass" ? null : "Ejecuta corepack enable y usa la versión fijada por packageManager.",
    ),
  );

  const missingFiles = [];
  for (const file of REQUIRED_FILES) {
    if (!(await exists(path.join(root, file)))) missingFiles.push(file);
  }
  checks.push(
    check(
      "agent-files",
      missingFiles.length === 0 ? "pass" : "fail",
      missingFiles.length === 0
        ? `${REQUIRED_FILES.length} archivos críticos presentes.`
        : `Faltan: ${missingFiles.join(", ")}.`,
      missingFiles.length === 0 ? null : "Restaura o adopta los archivos faltantes antes del handoff.",
    ),
  );

  const missingScripts = REQUIRED_SCRIPTS.filter((name) => !packageJson.scripts?.[name]);
  checks.push(
    check(
      "package-scripts",
      missingScripts.length === 0 ? "pass" : "fail",
      missingScripts.length === 0
        ? `${REQUIRED_SCRIPTS.length} comandos operativos disponibles.`
        : `Faltan scripts: ${missingScripts.join(", ")}.`,
      missingScripts.length === 0 ? null : "Agrega los comandos requeridos sin reemplazar scripts del proyecto.",
    ),
  );

  try {
    const packages = await checkPackages({ root: path.join(root, "docs/pocs") });
    checks.push(check("poc-packages", "pass", `${packages.length} paquete(s) POC válido(s).`));
  } catch (error) {
    checks.push(
      check(
        "poc-packages",
        "fail",
        error instanceof Error ? error.message : String(error),
        "Corrige el handoff y ejecuta pnpm poc:check.",
      ),
    );
  }

  const branch = run("git", ["branch", "--show-current"], root);
  checks.push(
    check(
      "git-branch",
      branch.ok && branch.output ? "pass" : "warn",
      branch.output ? `Rama actual: ${branch.output}.` : "No se pudo resolver una rama Git activa.",
      branch.output ? null : "Abre o crea una rama antes de implementar.",
    ),
  );

  const origin = run("git", ["remote", "get-url", "origin"], root);
  checks.push(
    check(
      "git-origin",
      origin.ok && origin.output ? "pass" : "warn",
      origin.ok && origin.output
        ? `Origin: ${origin.output}.`
        : "El repositorio no tiene origin configurado.",
      origin.ok && origin.output ? null : "Publica el repositorio y configura origin.",
    ),
  );

  const vercelLinked = await exists(path.join(root, ".vercel", "project.json"));
  checks.push(
    check(
      "vercel-project",
      vercelLinked ? "pass" : "warn",
      vercelLinked ? "Proyecto Vercel enlazado localmente." : "Proyecto Vercel todavía no enlazado.",
      vercelLinked ? null : "Importa el repositorio en Vercel; no confirmes producción automáticamente.",
    ),
  );

  const summary = summarizeChecks(checks);
  return {
    schemaVersion: 1,
    project: packageJson.name,
    ...summary,
    checks,
    external: [
      "Verificar que ChatGPT Codex Connector esté instalado en el repositorio.",
      "Proteger main con los checks de CI después de la primera ejecución.",
      "Ejecutar un POC real en Codex y continuar su rama en Antigravity.",
    ],
  };
}

async function main() {
  const result = await inspectStack();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status === "blocked") process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
