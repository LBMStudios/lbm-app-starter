import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

const sourceSchema = z
  .object({
    kind: z.enum(["meeting", "voice-note", "notes"]),
    date: z.iso.date(),
    reference: nonEmpty,
    language: nonEmpty.default("es"),
  })
  .strict();

const assumptionSchema = z
  .object({
    statement: nonEmpty,
    needsValidation: z.boolean(),
  })
  .strict();

const acceptanceCriterionSchema = z
  .object({
    id: z.string().regex(/^AC-[1-9]\d*$/),
    statement: nonEmpty,
  })
  .strict();

export const pocIntakeSchema = z
  .object({
    schemaVersion: z.literal(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: nonEmpty,
    source: sourceSchema,
    problem: nonEmpty,
    users: z.array(nonEmpty).min(1),
    desiredOutcome: nonEmpty,
    constraints: z.array(nonEmpty),
    scope: z
      .object({
        in: z.array(nonEmpty).min(1),
        out: z.array(nonEmpty),
      })
      .strict(),
    decisions: z.array(nonEmpty),
    assumptions: z.array(assumptionSchema),
    openQuestions: z.array(nonEmpty),
    acceptanceCriteria: z.array(acceptanceCriterionSchema).min(1),
    poc: z
      .object({
        hypothesis: nonEmpty,
        demoFlow: z.array(nonEmpty).min(1),
        implementationNotes: z.array(nonEmpty),
        successSignals: z.array(nonEmpty).min(1),
        requiresBrowser: z.boolean(),
      })
      .strict(),
  })
  .strict();

function bulletList(items, empty = "- Ninguno.") {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : empty;
}

function numberedList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function renderBrief(data) {
  const assumptions = data.assumptions.map(
    ({ statement, needsValidation }) =>
      `${needsValidation ? "[ ]" : "[x]"} ${statement}`,
  );

  return `# ${data.title}

## Fuente

- Tipo: ${data.source.kind}
- Fecha: ${data.source.date}
- Referencia: ${data.source.reference}
- Idioma: ${data.source.language}

La transcripción original no forma parte de este paquete. Verifica que el brief no contenga secretos ni datos personales innecesarios antes de publicarlo.

## Problema

${data.problem}

## Usuarios

${bulletList(data.users)}

## Resultado deseado

${data.desiredOutcome}

## Hipótesis del POC

${data.poc.hypothesis}

## Alcance incluido

${bulletList(data.scope.in)}

## Fuera de alcance

${bulletList(data.scope.out)}

## Restricciones

${bulletList(data.constraints)}

## Decisiones confirmadas

${bulletList(data.decisions)}

## Supuestos

${bulletList(assumptions)}

## Preguntas abiertas

${bulletList(data.openQuestions)}

## Flujo de demostración

${numberedList(data.poc.demoFlow)}

## Señales de éxito

${bulletList(data.poc.successSignals)}
`;
}

function renderTasks(data) {
  const criteria = data.acceptanceCriteria.map(
    ({ id, statement }) => `[ ] **${id}** — ${statement}`,
  );
  const implementation = data.poc.implementationNotes.map((item) => `[ ] ${item}`);

  return `# Tareas — ${data.title}

## Criterios de aceptación

${bulletList(criteria)}

## Notas de implementación

${bulletList(implementation, "- El agente debe proponer el incremento mínimo compatible con la arquitectura existente.")}

## Regla de avance

Marca una tarea solo después de producir evidencia verificable. Mantén los cambios en la rama \`poc/${data.slug}\`; no fusiones ni despliegues producción desde este flujo.
`;
}

function requiredChecks(data) {
  return ["pnpm check", ...(data.poc.requiresBrowser ? ["pnpm test:e2e"] : [])];
}

function renderVerification(data) {
  const checks = requiredChecks(data).map((command) => `[ ] \`${command}\``);
  const criteria = data.acceptanceCriteria.map(({ id }) => `- **${id}** — Pendiente.`);

  return `# Verificación — ${data.title}

## Checks requeridos

${bulletList(checks)}

## Evidencia por criterio

${criteria.join("\n")}

## Evidencia

- Resultado de cada comando:
- Criterios demostrados:
- Riesgos residuales:
- Preguntas que requieren decisión humana:

Conserva screenshots, video y trace solo cuando falle el chequeo determinista o cuando la revisión visual sea parte explícita del alcance.
`;
}

export function buildHandoff(data) {
  return {
    ...data,
    routing: {
      target: "antigravity",
      workflow: "/continue-poc",
      branch: `poc/${data.slug}`,
      entrypoint: `docs/pocs/${data.slug}/brief.md`,
      tasks: `docs/pocs/${data.slug}/tasks.md`,
      verification: `docs/pocs/${data.slug}/verification.md`,
      requiredChecks: requiredChecks(data),
    },
  };
}

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

function getFlag(args, flag, fallback) {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Falta el valor de ${flag}.`);
  return value;
}

export async function createPackage({ inputPath, root = "docs/pocs" }) {
  const raw = await readFile(inputPath, "utf8");
  const intake = pocIntakeSchema.parse(JSON.parse(raw));
  const rootPath = path.resolve(root);
  const packagePath = path.resolve(rootPath, intake.slug);

  if (!packagePath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error("El slug produciría una ruta fuera del directorio de POC.");
  }
  if (await pathExists(packagePath)) {
    throw new Error(`El paquete ya existe: ${path.relative(process.cwd(), packagePath)}`);
  }

  await mkdir(packagePath, { recursive: true });
  await Promise.all([
    writeFile(path.join(packagePath, "brief.md"), renderBrief(intake), "utf8"),
    writeFile(path.join(packagePath, "tasks.md"), renderTasks(intake), "utf8"),
    writeFile(path.join(packagePath, "verification.md"), renderVerification(intake), "utf8"),
    writeFile(
      path.join(packagePath, "handoff.json"),
      `${JSON.stringify(buildHandoff(intake), null, 2)}\n`,
      "utf8",
    ),
  ]);

  return packagePath;
}

export async function checkPackages({ root = "docs/pocs" } = {}) {
  const rootPath = path.resolve(root);
  if (!(await pathExists(rootPath))) return [];

  const entries = await readdir(rootPath, { withFileTypes: true });
  const checked = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const handoffPath = path.join(rootPath, entry.name, "handoff.json");
    const raw = await readFile(handoffPath, "utf8");
    const parsed = JSON.parse(raw);
    const { routing, ...intake } = parsed;
    const validated = pocIntakeSchema.parse(intake);
    const expectedRouting = buildHandoff(validated).routing;

    if (JSON.stringify(routing) !== JSON.stringify(expectedRouting)) {
      throw new Error(`Routing inválido en ${path.relative(process.cwd(), handoffPath)}.`);
    }

    const requiredArtifacts = [
      ["brief", path.join(rootPath, entry.name, "brief.md")],
      ["tasks", path.join(rootPath, entry.name, "tasks.md")],
      ["verification", path.join(rootPath, entry.name, "verification.md")],
    ];

    for (const [artifact, artifactPath] of requiredArtifacts) {
      if (!(await pathExists(artifactPath))) {
        throw new Error(
          `Falta ${artifact} en el paquete ${entry.name}: ${path.relative(process.cwd(), artifactPath)}.`,
        );
      }
    }

    const tasks = await readFile(path.join(rootPath, entry.name, "tasks.md"), "utf8");
    for (const criterion of validated.acceptanceCriteria) {
      if (!tasks.includes(`**${criterion.id}**`)) {
        throw new Error(`Falta ${criterion.id} en las tareas del paquete ${entry.name}.`);
      }
    }

    const verification = await readFile(
      path.join(rootPath, entry.name, "verification.md"),
      "utf8",
    );
    for (const command of expectedRouting.requiredChecks) {
      if (!verification.includes(`\`${command}\``)) {
        throw new Error(`Falta el check ${command} en la verificación del paquete ${entry.name}.`);
      }
    }
    for (const criterion of validated.acceptanceCriteria) {
      const evidencePrefix = `- **${criterion.id}** — `;
      const evidenceLine = verification
        .split("\n")
        .find((line) => line.startsWith(evidencePrefix));
      if (!evidenceLine) {
        throw new Error(`Falta evidencia para ${criterion.id} en el paquete ${entry.name}.`);
      }

      const completed = new RegExp(
        `- \\[[xX]\\] \\*\\*${criterion.id}\\*\\*`,
      ).test(tasks);
      if (completed && evidenceLine === `${evidencePrefix}Pendiente.`) {
        throw new Error(
          `${criterion.id} está completo pero no tiene evidencia en el paquete ${entry.name}.`,
        );
      }
    }
    checked.push(handoffPath);
  }

  return checked;
}

function currentGitBranch() {
  const result = spawnSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

export async function getPackageStatus({ handoffPath, currentBranch = currentGitBranch() }) {
  const absoluteHandoff = path.resolve(handoffPath);
  const packagePath = path.dirname(absoluteHandoff);
  const rootPath = path.dirname(packagePath);
  const raw = await readFile(absoluteHandoff, "utf8");
  const parsed = JSON.parse(raw);
  const { routing, ...intake } = parsed;
  const validated = pocIntakeSchema.parse(intake);
  const expectedRouting = buildHandoff(validated).routing;

  if (JSON.stringify(routing) !== JSON.stringify(expectedRouting)) {
    throw new Error(`Routing inválido en ${path.relative(process.cwd(), absoluteHandoff)}.`);
  }

  await checkPackages({ root: rootPath });
  const tasks = await readFile(path.join(packagePath, "tasks.md"), "utf8");
  const criteria = validated.acceptanceCriteria.map((criterion) => ({
    ...criterion,
    completed: new RegExp(`- \\[[xX]\\] \\*\\*${criterion.id}\\*\\*`).test(tasks),
  }));
  const nextCriterion = criteria.find((criterion) => !criterion.completed) ?? null;
  const completedCriteria = criteria.filter((criterion) => criterion.completed).length;

  return {
    schemaVersion: validated.schemaVersion,
    slug: validated.slug,
    title: validated.title,
    status: nextCriterion ? "in_progress" : "complete",
    progress: {
      completedCriteria,
      totalCriteria: criteria.length,
    },
    nextCriterion: nextCriterion
      ? { id: nextCriterion.id, statement: nextCriterion.statement }
      : null,
    expectedBranch: routing.branch,
    currentBranch,
    branchMatches: currentBranch === routing.branch,
    workflow: routing.workflow,
    requiredChecks: routing.requiredChecks,
    files: {
      handoff: path.relative(process.cwd(), absoluteHandoff),
      brief: routing.entrypoint,
      tasks: routing.tasks,
      verification: routing.verification,
    },
  };
}

export async function recordCriterionEvidence({
  handoffPath,
  criterionId,
  evidence,
  currentBranch = currentGitBranch(),
}) {
  const normalizedEvidence = evidence.trim().replace(/\s+/g, " ");
  if (normalizedEvidence.length < 3 || normalizedEvidence.length > 500) {
    throw new Error("La evidencia debe tener entre 3 y 500 caracteres.");
  }

  const absoluteHandoff = path.resolve(handoffPath);
  const packagePath = path.dirname(absoluteHandoff);
  const rootPath = path.dirname(packagePath);
  const raw = await readFile(absoluteHandoff, "utf8");
  const parsed = JSON.parse(raw);
  const { routing, ...intake } = parsed;
  const validated = pocIntakeSchema.parse(intake);
  const expectedRouting = buildHandoff(validated).routing;

  if (JSON.stringify(routing) !== JSON.stringify(expectedRouting)) {
    throw new Error(`Routing inválido en ${path.relative(process.cwd(), absoluteHandoff)}.`);
  }
  if (currentBranch !== expectedRouting.branch) {
    throw new Error(
      `Rama incorrecta: estás en ${currentBranch || "(sin rama)"}; cambia a ${expectedRouting.branch} antes de registrar evidencia.`,
    );
  }

  const criterion = validated.acceptanceCriteria.find(({ id }) => id === criterionId);
  if (!criterion) throw new Error(`Criterio desconocido: ${criterionId}.`);

  const tasksPath = path.join(packagePath, "tasks.md");
  const verificationPath = path.join(packagePath, "verification.md");
  const [tasks, verification] = await Promise.all([
    readFile(tasksPath, "utf8"),
    readFile(verificationPath, "utf8"),
  ]);
  const pendingTask = `- [ ] **${criterionId}**`;
  const completedTask = `- [x] **${criterionId}**`;
  const pendingEvidence = `- **${criterionId}** — Pendiente.`;

  if (tasks.includes(completedTask) || !tasks.includes(pendingTask)) {
    throw new Error(`${criterionId} no está pendiente o su tarea no tiene el formato esperado.`);
  }
  if (!verification.includes(pendingEvidence)) {
    throw new Error(`${criterionId} no tiene una entrada de evidencia pendiente.`);
  }

  await Promise.all([
    writeFile(tasksPath, tasks.replace(pendingTask, completedTask), "utf8"),
    writeFile(
      verificationPath,
      verification.replace(pendingEvidence, `- **${criterionId}** — ${normalizedEvidence}`),
      "utf8",
    ),
  ]);
  await checkPackages({ root: rootPath });

  return { criterionId, evidence: normalizedEvidence };
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "create") {
    const inputPath = getFlag(args, "--input");
    if (!inputPath) throw new Error("Uso: pnpm poc:create -- --input <archivo.json>");
    const packagePath = await createPackage({
      inputPath,
      root: getFlag(args, "--root", "docs/pocs"),
    });
    process.stdout.write(`POC creado: ${path.relative(process.cwd(), packagePath)}\n`);
    return;
  }

  if (command === "check") {
    const checked = await checkPackages({ root: getFlag(args, "--root", "docs/pocs") });
    process.stdout.write(`POC válidos: ${checked.length}\n`);
    return;
  }

  if (command === "status") {
    const handoffPath = getFlag(args, "--handoff");
    if (!handoffPath) {
      throw new Error("Uso: pnpm poc:status -- --handoff <docs/pocs/slug/handoff.json>");
    }
    const status = await getPackageStatus({ handoffPath });
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    return;
  }

  if (command === "record") {
    const handoffPath = getFlag(args, "--handoff");
    const criterionId = getFlag(args, "--criterion");
    const evidence = getFlag(args, "--evidence");
    if (!handoffPath || !criterionId || !evidence) {
      throw new Error(
        "Uso: pnpm poc:record -- --handoff <archivo> --criterion <AC-1> --evidence <texto>",
      );
    }
    const result = await recordCriterionEvidence({ handoffPath, criterionId, evidence });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error("Uso: node scripts/poc-package.mjs <create|check|status|record>");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    if (error instanceof z.ZodError) {
      process.stderr.write(`${z.prettifyError(error)}\n`);
    } else {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    }
    process.exitCode = 1;
  });
}
