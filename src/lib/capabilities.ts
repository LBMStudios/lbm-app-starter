export const capabilities = [
  { title: "Producto", description: "Next.js 16, TypeScript estricto y Tailwind CSS." },
  { title: "Datos", description: "Supabase SSR preparado para autenticación y Postgres." },
  { title: "Calidad", description: "ESLint, tipos, Vitest, Playwright y build en cada PR." },
  { title: "Agentes", description: "Reglas, workflows y skills compartidos con Antigravity." },
] as const;

export function capabilityCount() {
  return capabilities.length;
}
