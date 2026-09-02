# LBM App Starter

Base automatizada para proyectos de LBM Studios con Next.js, Supabase opcional, pruebas y flujos compartidos para ChatGPT/Codex y Antigravity.

## Inicio rápido

```bash
nvm use
corepack enable
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. Supabase no es necesario para ejecutar la pantalla inicial. Para activarlo, copia `.env.example` a `.env.local` y completa las dos variables públicas.

## Comandos

| Comando | Propósito |
| --- | --- |
| `pnpm dev` | Desarrollo local |
| `pnpm check` | Lint, tipos, unit tests y build |
| `pnpm test:e2e` | Recorrido de navegador con Playwright |
| `pnpm test:a11y` | Auditoría WCAG automática sobre rutas públicas |
| `pnpm test:e2e:headed` | Inspección visual deliberada |
| `pnpm test:e2e:report` | Abre el diagnóstico de una ejecución fallida |
| `pnpm poc:create -- --input <archivo.json>` | Materializa un handoff reunión → POC |
| `pnpm poc:check` | Valida todos los handoffs de POC |
| `pnpm poc:status -- --handoff <archivo>` | Resume rama, avance y próximo criterio para el agente |
| `pnpm poc:record -- --handoff <archivo> --criterion <AC-id> --evidence <texto>` | Cierra un criterio junto con evidencia |
| `pnpm stack:adopt -- --target <ruta>` | Genera una matriz de adopción sin modificar el proyecto |
| `pnpm stack:doctor` | Audita la preparación local y enumera activaciones externas |
| `pnpm verify` | Gate completo antes de publicar |

## Flujo recomendado

1. Describe el objetivo y los criterios de aceptación en un issue.
2. En Antigravity ejecuta `/implement-issue` y proporciona el issue.
3. Antes del handoff ejecuta `/browser-qa`.
4. Abre un pull request; GitHub repite automáticamente el gate de calidad.
5. Usa Codex para revisar el diff o corregir el CI sin perder el contexto guardado en este repositorio.

Consulta `AGENTS.md` y `docs/` antes de ampliar la arquitectura.

## De una reunión a un POC

Pasa a ChatGPT/Codex la transcripción, nota de voz o resumen y pide “usa `meeting-to-poc`”. El agente conserva solo el contexto derivado necesario, crea `docs/pocs/<slug>/`, implementa una prueba vertical en `poc/<slug>` y ejecuta sus checks. La transcripción original, secretos y datos personales no se guardan en Git.

Para continuar sin volver a explicar el trabajo, abre la misma rama en Antigravity y ejecuta:

```text
/continue-poc docs/pocs/<slug>/handoff.json
```

El handoff enlaza el brief, tareas, criterios, verificación y comandos requeridos. Consulta `docs/MEETING_TO_POC.md` para el circuito completo y sus límites.

Antes de adoptar el flujo o iniciar un piloto, ejecuta `pnpm stack:doctor`. El comando devuelve JSON con checks `pass`, `warn` o `fail`: los fallos bloquean el trabajo; los avisos identifican activaciones externas como GitHub o Vercel sin romper el desarrollo local.

## QA de navegador sin capturas manuales

Las rutas públicas se registran en `tests/e2e/routes.ts`. El smoke test verifica automáticamente respuesta HTTP, contenido, headings, overlays, errores JavaScript, errores de consola, requests fallidos y respuestas 5xx. En éxito no analiza imágenes; en fallo Playwright conserva screenshot, video, trace y un reporte HTML para que un agente diagnostique la causa.

## Uso compartido entre ChatGPT/Codex y Antigravity

Abre este mismo repositorio en ambos entornos. Codex carga `AGENTS.md` y los skills de `.agents/skills/`; Antigravity utiliza además los slash workflows de `.agents/workflows/` y el hook de calidad. Para forzar el circuito desde ChatGPT, pide “usa frontend-qa para verificar este cambio”. Las correcciones permanentes deben agregarse a `AGENTS.md` o al skill correspondiente, no quedar solamente en el chat.

## Preview verificable por pull request

Conecta el repositorio a Vercel mediante Git Integration. Cada deployment exitoso del entorno `Preview` dispara `.github/workflows/preview-e2e.yml`, que ejecuta Playwright contra la URL desplegada en lugar del servidor local. No despliega ni promueve producción.

Si los previews tienen Deployment Protection, crea un secreto de **Protection Bypass for Automation** en Vercel y guarda el mismo valor como secret de GitHub `VERCEL_AUTOMATION_BYPASS_SECRET`. Playwright lo envía únicamente como header; nunca debe escribirse en el repositorio.

## Monitoreo y métricas

Configura la variable de repositorio GitHub `PRODUCTION_URL` con la URL pública. `Production Monitor` ejecutará el recorrido completo cada seis horas y conservará evidencia solo si falla. También puede iniciarse manualmente con otra URL desde GitHub Actions.

Para activar métricas reales, habilita Web Analytics y Speed Insights en Vercel y configura `NEXT_PUBLIC_VERCEL_OBSERVABILITY=1` para Preview/Production. El starter no recopila esas métricas hasta que se habilitan explícitamente.

## Release y adopción

`Production Control` permite promover un Preview verificado o restaurar un deployment conocido mediante ejecución manual, confirmación explícita y el Environment `production`. Consulta `docs/RELEASE_AUTOMATION.md` antes de habilitarlo.

Para llevar el stack a un repositorio existente, pide “usa adopt-automation en este proyecto”. El skill inspecciona su tecnología y fusiona solamente las capas compatibles; no reemplaza configuraciones completas ni presupone que todos los proyectos usan este starter.

Antes de editar el proyecto destino, genera el inventario seguro:

```bash
pnpm stack:adopt -- --target ../mi-proyecto
```

La salida JSON declara `mode: "dry-run"` y `mutations: 0`, detecta el stack y propone un orden de adopción. El flag `--apply` está bloqueado deliberadamente: cualquier cambio requiere revisar y aprobar primero la matriz.
