# Generar Encuesta Interactiva Universal Assistance

Crea una nueva encuesta o formulario dinámico interactivo con branding oficial de Universal Assistance / LBM Studios.

## Pasos de Ejecución

1. Solicitar o determinar el `slug` (ej: `calidad-comercial-2026`) y el `title` de la encuesta.
2. Ejecutar el comando de scaffolding:
   ```bash
   pnpm scaffold:survey create --slug "<slug>" --title "<title>"
   ```
3. Personalizar las preguntas y saltos condicionales en `src/data/surveys/<slug>.json`.
4. Registrar la ruta en `tests/e2e/routes.ts` para verificación automática de Playwright.
5. Ejecutar `pnpm check` y `/browser-qa` para validar que la interfaz y los flujos funcionen sin errores.
