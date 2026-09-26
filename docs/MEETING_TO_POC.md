# Reunión → POC → Antigravity

## Resultado

Una reunión se convierte en una rama revisable con un POC vertical, criterios observables, pruebas y un paquete que Antigravity puede continuar sin depender del historial del chat.

## Circuito operativo

1. Envía a ChatGPT/Codex la transcripción, audio o notas y pide: `usa meeting-to-poc y crea el POC en <repositorio>`.
2. El agente separa decisiones confirmadas, supuestos, preguntas, alcance y criterios. Pregunta únicamente si falta una decisión que cambiaría materialmente la implementación.
3. El generador valida el contrato y crea `docs/pocs/<slug>/brief.md`, `tasks.md`, `verification.md` y `handoff.json`. `pnpm poc:check` también comprueba que esos artefactos existan y contengan todos los criterios y checks declarados.
4. Codex implementa la mínima prueba vertical en `poc/<slug>`, ejecuta checks y abre un pull request cuando GitHub tiene escritura habilitada.
5. Antigravity abre la rama y ejecuta `/continue-poc docs/pocs/<slug>/handoff.json` para tomar el siguiente criterio pendiente.
6. GitHub CI repite `pnpm check`; Vercel y Playwright validan el Preview cuando la integración está conectada.

El workflow comienza con `pnpm poc:status -- --handoff docs/pocs/<slug>/handoff.json`. La salida JSON indica si la rama actual es correcta, el avance, el próximo criterio, los archivos relevantes y los checks requeridos; así el agente no necesita reconstruir el estado recorriendo todo el repositorio.

Después de verificar un criterio, el agente ejecuta `pnpm poc:record -- --handoff <archivo> --criterion <AC-id> --evidence "<comando y resultado>"`. La operación rechaza una rama incorrecta, marca la tarea y registra la evidencia juntas; `pnpm poc:check` rechaza criterios completos sin evidencia.

## Qué queda automático

- Extracción estructurada del contexto útil.
- Creación y validación del paquete de handoff.
- Implementación del primer corte vertical por el agente con acceso al repositorio.
- Lint, tipos, unit tests, build y QA de navegador cuando corresponda.
- Diagnósticos de navegador solo en fallos.
- Continuidad entre Codex y Antigravity mediante archivos versionados.

## Límites deliberados

- No se guarda la transcripción original ni información sensible innecesaria.
- Una reunión ambigua no autoriza al agente a inventar decisiones de producto.
- ChatGPT no dispone de una API para iniciar una conversación de Antigravity desde este chat. GitHub y el workflow `/continue-poc` son el puente durable.
- Ningún agente fusiona, promueve, revierte ni despliega producción sin aprobación explícita.
- El flujo usa las suscripciones y conectores existentes; no presupone consumo de OpenAI API.

## Activación inicial

1. Instala `ChatGPT Codex Connector` en la cuenta GitHub `LBMStudios` y limita el acceso a `lbm-app-starter` y los proyectos que decidas incorporar.
2. Crea el entorno Codex del repositorio con `corepack enable` y `pnpm install --frozen-lockfile`.
3. Abre el mismo repositorio como proyecto de Antigravity. Los skills y workflows viven en `.agents/` y se cargan desde la rama.
4. Conecta el repositorio a Vercel. No es necesario agregar Supabase hasta que un POC necesite estado persistente.

## Prompt mínimo de uso

```text
Usa meeting-to-poc con esta reunión. Crea el brief derivado, registra supuestos,
implementa la mínima prueba vertical, verifica el resultado y deja el handoff
para Antigravity. No guardes la transcripción original ni despliegues producción.
```
