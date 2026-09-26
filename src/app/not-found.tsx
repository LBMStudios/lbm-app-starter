import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="text-[var(--accent)]">404</p>
      <h1 className="mt-3 text-4xl font-bold">Esta página no existe</h1>
      <Link className="mt-8 underline" href="/">Volver al inicio</Link>
    </main>
  );
}
