import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildHandoff,
  checkPackages,
  createPackage,
  getPackageStatus,
  pocIntakeSchema,
  recordCriterionEvidence,
} from "../../scripts/poc-package.mjs";

const validIntake = {
  schemaVersion: 1,
  slug: "meeting-to-poc",
  title: "Convertir una reunión en un POC",
  source: {
    kind: "meeting",
    date: "2026-09-02",
    reference: "Reunión interna de producto",
    language: "es",
  },
  problem: "El contexto de una reunión se pierde antes de llegar a implementación.",
  users: ["Product owner", "Agente de desarrollo"],
  desiredOutcome: "Un POC verificable y listo para continuar en Antigravity.",
  constraints: ["No guardar la transcripción original"],
  scope: {
    in: ["Generar un handoff estructurado"],
    out: ["Desplegar producción"],
  },
  decisions: ["GitHub será la fuente de verdad"],
  assumptions: [
    { statement: "Antigravity abre el mismo repositorio", needsValidation: false },
  ],
  openQuestions: ["Qué proyecto real recibirá el primer POC"],
  acceptanceCriteria: [
    { id: "AC-1", statement: "El handoff inválido detiene el flujo con un error útil." },
  ],
  poc: {
    hypothesis: "Un contrato pequeño evita repetir el contexto entre agentes.",
    demoFlow: ["Entregar notas", "Generar paquete", "Continuar en Antigravity"],
    implementationNotes: ["Validar el contrato antes de editar código"],
    successSignals: ["Antigravity puede continuar sin volver a preguntar el objetivo"],
    requiresBrowser: false,
  },
};

test("valida y completa el routing de Antigravity", () => {
  const parsed = pocIntakeSchema.parse(validIntake);
  const handoff = buildHandoff(parsed);

  assert.equal(handoff.routing.workflow, "/continue-poc");
  assert.equal(handoff.routing.branch, "poc/meeting-to-poc");
  assert.deepEqual(handoff.routing.requiredChecks, ["pnpm check"]);
});

test("crea un paquete verificable sin copiar la transcripción", async () => {
  const sandbox = await mkdtemp(path.join(tmpdir(), "lbm-poc-"));
  const inputPath = path.join(sandbox, "intake.json");
  const root = path.join(sandbox, "pocs");
  await writeFile(inputPath, JSON.stringify(validIntake), "utf8");

  const packagePath = await createPackage({ inputPath, root });
  const brief = await readFile(path.join(packagePath, "brief.md"), "utf8");
  const tasks = await readFile(path.join(packagePath, "tasks.md"), "utf8");
  const checked = await checkPackages({ root });

  assert.match(brief, /La transcripción original no forma parte/);
  assert.match(tasks, /- \[ \] \*\*AC-1\*\*/);
  assert.doesNotMatch(tasks, /- - \[ \]/);
  assert.equal(checked.length, 1);
});

test("rechaza un handoff cuyo paquete no está completo", async () => {
  const sandbox = await mkdtemp(path.join(tmpdir(), "lbm-poc-incomplete-"));
  const inputPath = path.join(sandbox, "intake.json");
  const root = path.join(sandbox, "pocs");
  await writeFile(inputPath, JSON.stringify(validIntake), "utf8");

  const packagePath = await createPackage({ inputPath, root });
  await rm(path.join(packagePath, "tasks.md"));

  await assert.rejects(
    checkPackages({ root }),
    /Falta tasks en el paquete meeting-to-poc/,
  );
});

test("resume el próximo criterio y la rama sin redescubrir el paquete", async () => {
  const sandbox = await mkdtemp(path.join(tmpdir(), "lbm-poc-status-"));
  const inputPath = path.join(sandbox, "intake.json");
  const root = path.join(sandbox, "pocs");
  await writeFile(inputPath, JSON.stringify(validIntake), "utf8");

  const packagePath = await createPackage({ inputPath, root });
  const status = await getPackageStatus({
    handoffPath: path.join(packagePath, "handoff.json"),
    currentBranch: "poc/meeting-to-poc",
  });

  assert.equal(status.status, "in_progress");
  assert.equal(status.nextCriterion.id, "AC-1");
  assert.equal(status.branchMatches, true);
  assert.deepEqual(status.progress, { completedCriteria: 0, totalCriteria: 1 });
});

test("cierra un criterio solamente junto con evidencia", async () => {
  const sandbox = await mkdtemp(path.join(tmpdir(), "lbm-poc-record-"));
  const inputPath = path.join(sandbox, "intake.json");
  const root = path.join(sandbox, "pocs");
  await writeFile(inputPath, JSON.stringify(validIntake), "utf8");

  const packagePath = await createPackage({ inputPath, root });
  const handoffPath = path.join(packagePath, "handoff.json");

  await assert.rejects(
    recordCriterionEvidence({
      handoffPath,
      criterionId: "AC-1",
      evidence: "node --test: valida routing y paquete",
      currentBranch: "main",
    }),
    /Rama incorrecta.*poc\/meeting-to-poc/,
  );

  await recordCriterionEvidence({
    handoffPath,
    criterionId: "AC-1",
    evidence: "node --test: valida routing y paquete",
    currentBranch: "poc/meeting-to-poc",
  });

  const [tasks, verification, status] = await Promise.all([
    readFile(path.join(packagePath, "tasks.md"), "utf8"),
    readFile(path.join(packagePath, "verification.md"), "utf8"),
    getPackageStatus({ handoffPath, currentBranch: "poc/meeting-to-poc" }),
  ]);
  assert.match(tasks, /- \[x\] \*\*AC-1\*\*/);
  assert.match(verification, /AC-1.*node --test/);
  assert.equal(status.status, "complete");

  await assert.rejects(
    recordCriterionEvidence({
      handoffPath,
      criterionId: "AC-1",
      evidence: "otra evidencia",
      currentBranch: "poc/meeting-to-poc",
    }),
    /AC-1 no está pendiente/,
  );
});

test("rechaza criterios sin identificador estable", () => {
  const invalid = structuredClone(validIntake);
  invalid.acceptanceCriteria[0].id = "criterio-1";

  assert.equal(pocIntakeSchema.safeParse(invalid).success, false);
});
