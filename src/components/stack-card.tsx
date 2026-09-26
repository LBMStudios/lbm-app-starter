type StackCardProps = {
  title: string;
  description: string;
};

export function StackCard({ title, description }: StackCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[var(--panel)] p-6 shadow-xl backdrop-blur">
      <h2 className="text-lg font-semibold text-[var(--accent)]">{title}</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{description}</p>
    </article>
  );
}
