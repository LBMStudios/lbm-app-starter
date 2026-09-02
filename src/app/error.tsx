"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <h1 className="text-3xl font-bold">Algo salió mal</h1>
      <p className="mt-4 text-[var(--muted)]">El error fue contenido. Puedes volver a intentar sin recargar todo.</p>
      <button className="mt-8 w-fit rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
