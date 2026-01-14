export function CourseHeroImage({
  cover,
  className = "",
}: {
  cover?: string | null;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-xl border border-brand-500/60 bg-black/20 shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_25px_80px_rgba(0,0,0,0.55)]">
        {cover ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${cover}')` }}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.15),transparent_55%)]" />
        )}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute -bottom-32 -left-28 h-[520px] w-[520px] rounded-full bg-brand-500/10 blur-[150px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        <div className="relative aspect-[4/5] w-full" />
      </div>
    </div>
  );
}
