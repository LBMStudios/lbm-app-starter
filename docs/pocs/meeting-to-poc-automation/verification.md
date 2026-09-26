# Verificación — Automatizar el paso de una reunión a un POC

## Checks requeridos

- [x] `pnpm check`

## Evidencia por criterio

- **AC-1** — `node --test tests/scripts/poc-package.test.mjs`: generó brief, tareas, verificación y routing estable.
- **AC-2** — `node --test tests/scripts/poc-package.test.mjs`: rechazó un identificador de criterio inválido y un paquete incompleto.
- **AC-3** — `pnpm poc:status -- --handoff docs/pocs/meeting-to-poc-automation/handoff.json`: confirmó workflow, rama y archivos del handoff.
- **AC-4** — `pnpm check`: validó lint, tipos, tests, `poc:check` y build sin almacenar la transcripción original.

## Evidencia

- Resultado de cada comando: `pnpm check` finalizó correctamente el 2026-09-02; incluyó lint, tipos, Vitest, tres pruebas del generador, `poc:check` sobre este paquete y build de Next.js.
- Criterios demostrados: AC-1 a AC-4 mediante generación real, validación del routing y rechazo de un identificador de criterio inválido.
- Riesgos residuales: la continuidad remota no puede probarse hasta instalar ChatGPT Codex Connector con escritura sobre el repositorio y publicar la rama.
- Preguntas que requieren decisión humana: elegir el primer proyecto real para pilotear el flujo después de publicar el starter.

Conserva screenshots, video y trace solo cuando falle el chequeo determinista o cuando la revisión visual sea parte explícita del alcance.
