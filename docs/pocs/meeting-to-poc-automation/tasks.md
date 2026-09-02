# Tareas — Automatizar el paso de una reunión a un POC

## Criterios de aceptación

- [x] **AC-1** — Un intake válido genera brief, tareas, verificación y handoff con routing estable.
- [x] **AC-2** — Un intake inválido detiene el flujo con un error útil antes de implementar.
- [x] **AC-3** — Antigravity recibe una ruta y un comando únicos para continuar el siguiente criterio pendiente.
- [x] **AC-4** — El gate pnpm check valida todos los handoffs versionados sin guardar la transcripción original.

## Notas de implementación

- [x] Mantener el contrato en versión 1 y rechazar campos inesperados
- [x] Agregar pruebas del generador y del routing
- [x] Incluir poc:check en el gate existente

## Regla de avance

Marca una tarea solo después de producir evidencia verificable. Mantén los cambios en la rama `poc/meeting-to-poc-automation`; no fusiones ni despliegues producción desde este flujo.
