export function CategoryHero({
  label,
  titulo,
  descricao,
}: {
  label: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <section className="border-b border-paper-200 bg-paper-100 py-20">
      <div className="container-wide">
        <span className="label-tracked text-brand-yellow">— {label}</span>
        <h1 className="mt-4 max-w-3xl font-display text-h1 text-ink-950">{titulo}</h1>
        <p className="mt-6 max-w-2xl text-body text-ink-500">{descricao}</p>
      </div>
    </section>
  );
}
