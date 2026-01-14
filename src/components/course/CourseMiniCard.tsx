import Link from "next/link";

export function CourseMiniCard({
  href,
  title,
  cover,
  className = "",
  cta = "Ver detalle →",
}: {
  href: string;
  title: string;
  cover?: string | null;
  className?: string;
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className={
        "group relative w-full min-w-0 overflow-hidden rounded-3xl border border-brand-500/25 bg-black/25 shadow-card transition-cyborg hover:border-brand-500/55 hover:shadow-brand " +
        className
      }
    >
      <div className="absolute inset-0">
        {cover ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 transition-cyborg group-hover:opacity-95 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url('${cover}')` }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.12), transparent 55%)",
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-black/75 to-transparent" />
      </div>

      <div className="relative flex aspect-[4/3] sm:aspect-[4/5] items-end p-3 sm:p-4">
        <div className="w-full min-w-0">
          <div className="text-sm sm:text-sm text-white/90 line-clamp-2">{title}</div>
          <div className="mt-2 text-[11px] text-white/60">{cta}</div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-cyborg group-hover:opacity-100">
        <div className="absolute inset-0 ring-1 ring-brand-500/35" />
        <div className="absolute -bottom-28 -left-28 h-[420px] w-[420px] rounded-full bg-brand-500/14 blur-[120px]" />
      </div>
    </Link>
  );
}
