import { spawnSync } from "node:child_process";
import process from "node:process";

let rawInput = "";
for await (const chunk of process.stdin) rawInput += chunk;

let event = {};
try {
  event = JSON.parse(rawInput || "{}");
} catch {
  process.stdout.write(JSON.stringify({ decision: "stop" }));
  process.exit(0);
}

if (event.terminationReason !== "model_stop" || event.fullyIdle !== true) {
  process.stdout.write(JSON.stringify({ decision: "stop" }));
  process.exit(0);
}

const cwd = event.workspacePaths?.[0] ?? process.cwd();
const result = spawnSync("pnpm", ["check"], {
  cwd,
  encoding: "utf8",
  timeout: 240_000,
});

if (result.status === 0) {
  process.stdout.write(JSON.stringify({ decision: "stop" }));
  process.exit(0);
}

const diagnostic = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim().slice(-4000);
process.stdout.write(JSON.stringify({
  decision: "continue",
  reason: `El gate automático pnpm check falló. Corrige la causa y vuelve a validarlo.\n\n${diagnostic}`,
}));
