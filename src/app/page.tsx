import { StackCard } from "@/components/stack-card";
import { capabilities } from "@/lib/capabilities";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">LBM Studios</p>
      <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
        De la idea al pull request, con menos fricción.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Un starter reproducible para que ChatGPT, Codex y Antigravity trabajen con el mismo contexto,
        los mismos controles de calidad y un flujo verificable.
      </p>
      <section aria-label="Capacidades del starter" className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((capability) => <StackCard key={capability.title} {...capability} />)}
      </section>
    </main>
  );
}
