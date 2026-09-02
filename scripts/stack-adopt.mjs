import { spawnSync } from "node:child_process";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const MATRIX_ORDER = [
  "agent-contract",
  "shared-agent-context",
  "quality-gate",
  "browser-qa",
  "continuous-integration",
  "meeting-to-poc",
  "preview-verification",
  "production-controls",
  "supabase-safety",
  "vercel-observability",
];

async function exists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function readJson(candidate) {
  if (!(await exists(candidate))) return null;
  return JSON.parse(await readFile(candidate, "utf8"));
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function matrixItem(id, status, evidence, recommendation) {
  return { id, status, evidence, recommendation };
}

function detectPackageManager(packageJson, files) {
  const declared = packageJson?.packageManager?.split("@")[0];
  if (declared) return declared;
  if (files.has("pnpm-lock.yaml")) return "pnpm";
  if (files.has("yarn.lock")) return "yarn";
  if (files.has("bun.lock") || files.has("bun.lockb")) return "bun";
  if (files.has("package-lock.json")) return "npm";
  return "unknown";
}

function detectFramework(dependencies) {
  if (dependencies.next) return "nextjs";
  if (dependencies["@angular/core"]) return "angular";
  if (dependencies["@sveltejs/kit"] || dependencies.svelte) return "svelte";
  if (dependencies.vue) return "vue";
  if (dependencies.react) return "react";
  return "unknown";
}

export function summarizeMatrix(matrix) {
  const counts = {
    already_present: 0,
    compatible_addition: 0,
    requires_adaptation: 0,
    out_of_scope: 0,
  };
  for (const item of matrix) counts[item.status] += 1;
  return counts;
}

export async function inspectAdoption({ target = process.cwd() } = {}) {
  const root = path.resolve(target);
  const rootEntries = new Set(await readdir(root));
  const packageJson = await readJson(path.join(root, "package.json"));
  const dependencies = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };
  const scripts = packageJson?.scripts ?? {};
  const framework = detectFramework(dependencies);
  const packageManager = detectPackageManager(packageJson, rootEntries);
  const webFramework = framework !== "unknown";

  const workflowRoot = path.join(root, ".github/workflows");
  const workflowFiles = (await exists(workflowRoot))
    ? (await readdir(workflowRoot)).filter((file) => /\.ya?ml$/u.test(file)).sort()
    : [];
  const workflowText = (
    await Promise.all(workflowFiles.map((file) => readFile(path.join(workflowRoot, file), "utf8")))
  ).join("\n");

  const playwrightConfigs = await Promise.all(
    ["playwright.config.ts", "playwright.config.js", "playwright.config.mjs"].map((file) =>
      exists(path.join(root, file)),
    ),
  );
  const hasPlaywrightDependency = Boolean(dependencies["@playwright/test"] || dependencies.playwright);
  const hasPlaywright = hasPlaywrightDependency && playwrightConfigs.some(Boolean);
  const hasVercel = rootEntries.has("vercel.json") || /\bvercel\b/iu.test(workflowText);
  const hasNetlify = rootEntries.has("netlify.toml") || /\bnetlify\b/iu.test(workflowText);
  const deployment = hasVercel ? "vercel" : hasNetlify ? "netlify" : "unknown";
  const hasSupabase = Boolean(dependencies["@supabase/supabase-js"] || dependencies["@supabase/ssr"]);
  const hasVercelMetrics = Boolean(
    dependencies["@vercel/analytics"] || dependencies["@vercel/speed-insights"],
  );
  const hasQualityGate = Boolean(scripts.check || scripts.verify);
  const hasPartialQualityGate = Boolean(scripts.lint || scripts.typecheck || scripts.test || scripts.build);
  const hasCi = workflowFiles.some((file) => /^ci\.ya?ml$/u.test(file));
  const hasAgents = await exists(path.join(root, "AGENTS.md"));
  const hasSharedSkills = await exists(path.join(root, ".agents/skills"));
  const hasMeetingToPoc =
    (await exists(path.join(root, ".agents/skills/meeting-to-poc/SKILL.md"))) &&
    Boolean(scripts["poc:create"] && scripts["poc:check"] && scripts["poc:status"]);
  const hasPreviewVerification = workflowFiles.some((file) => file.startsWith("preview-e2e."));
  const hasProductionControls = workflowFiles.some((file) => file.startsWith("production-control."));
  const hasSupabaseSafety = await exists(path.join(root, ".agents/skills/supabase-review/SKILL.md"));

  const matrix = [
    matrixItem(
      "agent-contract",
      hasAgents ? "already_present" : "compatible_addition",
      hasAgents ? "AGENTS.md existe." : "No existe AGENTS.md.",
      hasAgents ? "Conservar y ampliar solo si falta una regla." : "Agregar instrucciones raíz concisas.",
    ),
    matrixItem(
      "shared-agent-context",
      hasSharedSkills ? "already_present" : "compatible_addition",
      hasSharedSkills ? ".agents/skills está disponible." : "No hay skills compartidos.",
      hasSharedSkills ? "Reutilizar el contexto existente." : "Agregar únicamente skills compatibles.",
    ),
    matrixItem(
      "quality-gate",
      hasQualityGate
        ? "already_present"
        : packageJson && hasPartialQualityGate
          ? "requires_adaptation"
          : packageJson
            ? "compatible_addition"
            : "out_of_scope",
      hasQualityGate
        ? "Existe un comando check o verify."
        : hasPartialQualityGate
          ? "Hay checks parciales, pero no un gate único."
          : "No se detectó un gate de calidad.",
      packageJson ? "Componer los scripts nativos sin reemplazarlos." : "Definir primero el sistema de build.",
    ),
    matrixItem(
      "browser-qa",
      hasPlaywright
        ? "already_present"
        : hasPlaywrightDependency
          ? "requires_adaptation"
          : webFramework
            ? "compatible_addition"
            : "out_of_scope",
      hasPlaywright
        ? "Playwright y su configuración están presentes."
        : hasPlaywrightDependency
          ? "Playwright está instalado sin configuración completa."
          : `Framework detectado: ${framework}.`,
      webFramework ? "Registrar rutas observables y guardar evidencia solo al fallar." : "Confirmar una UI web antes de agregarlo.",
    ),
    matrixItem(
      "continuous-integration",
      hasCi ? "already_present" : workflowFiles.length > 0 ? "requires_adaptation" : packageJson ? "compatible_addition" : "out_of_scope",
      hasCi ? "Existe .github/workflows/ci.yml o ci.yaml." : `${workflowFiles.length} workflow(s) existentes.`,
      hasCi ? "Conservar el CI actual." : "Integrar el gate nativo en el proveedor existente.",
    ),
    matrixItem(
      "meeting-to-poc",
      hasMeetingToPoc ? "already_present" : packageJson ? "compatible_addition" : "requires_adaptation",
      hasMeetingToPoc ? "Skill y comandos POC disponibles." : "No hay handoff ejecutable reunión → POC.",
      "Agregar el paquete de handoff después de estabilizar el gate de calidad.",
    ),
    matrixItem(
      "preview-verification",
      hasPreviewVerification
        ? "already_present"
        : deployment === "vercel"
          ? "compatible_addition"
          : deployment === "unknown"
            ? "out_of_scope"
            : "requires_adaptation",
      hasPreviewVerification ? "Existe verificación de Preview." : `Proveedor detectado: ${deployment}.`,
      deployment === "unknown" ? "Identificar el proveedor antes de automatizar previews." : "Adaptar el disparador al proveedor detectado.",
    ),
    matrixItem(
      "production-controls",
      hasProductionControls
        ? "already_present"
        : deployment === "vercel"
          ? "compatible_addition"
          : deployment === "unknown"
            ? "out_of_scope"
            : "requires_adaptation",
      hasProductionControls ? "Existe un control manual de producción." : `Proveedor detectado: ${deployment}.`,
      "Agregar solo con confirmación explícita y aprobación del entorno protegido.",
    ),
    matrixItem(
      "supabase-safety",
      hasSupabase && hasSupabaseSafety
        ? "already_present"
        : hasSupabase
          ? "compatible_addition"
          : "out_of_scope",
      hasSupabase ? "Se detectaron dependencias de Supabase." : "Supabase no está en uso.",
      hasSupabase ? "Agregar revisión de RLS, migraciones y tipos." : "No agregar dependencias innecesarias.",
    ),
    matrixItem(
      "vercel-observability",
      hasVercelMetrics
        ? "already_present"
        : deployment === "vercel"
          ? "compatible_addition"
          : "out_of_scope",
      hasVercelMetrics ? "Analytics o Speed Insights están instalados." : `Proveedor detectado: ${deployment}.`,
      deployment === "vercel" ? "Mantener métricas opt-in y sin secretos en Git." : "No agregar SDKs de Vercel.",
    ),
  ];

  const branch = run("git", ["branch", "--show-current"], root);
  const gitRepository = run("git", ["rev-parse", "--is-inside-work-tree"], root) === "true";
  const gitStatus = gitRepository ? run("git", ["status", "--porcelain"], root) : null;
  const recommendedOrder = MATRIX_ORDER.filter((id) =>
    matrix.some(({ id: itemId, status }) =>
      itemId === id && (status === "compatible_addition" || status === "requires_adaptation"),
    ),
  );

  return {
    schemaVersion: 1,
    mode: "dry-run",
    mutations: 0,
    target: root,
    detected: {
      project: packageJson?.name ?? path.basename(root),
      framework,
      packageManager,
      deployment,
      git: {
        repository: gitRepository,
        branch: branch || null,
        dirty: gitStatus === null ? null : gitStatus.length > 0,
      },
      workflows: workflowFiles,
    },
    summary: summarizeMatrix(matrix),
    matrix,
    recommendedOrder,
    next:
      recommendedOrder.length > 0
        ? `Revisar y aprobar la capa ${recommendedOrder[0]} antes de editar.`
        : "No hay capas locales pendientes de adopción.",
  };
}

export function parseAdoptionArgs(argv) {
  if (argv.includes("--apply")) {
    throw new Error("--apply está bloqueado: stack:adopt es exclusivamente de lectura.");
  }
  const targetIndex = argv.indexOf("--target");
  if (targetIndex === -1) return { target: process.cwd() };
  const target = argv[targetIndex + 1];
  if (!target || target.startsWith("--")) throw new Error("--target requiere una ruta.");
  return { target };
}

async function main() {
  const result = await inspectAdoption(parseAdoptionArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
