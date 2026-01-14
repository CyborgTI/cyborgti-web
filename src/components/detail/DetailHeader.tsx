import type { ReactNode } from "react";

export function DetailHeader({
  badges,
  title,
  subtitle,
  rightSlot,
  className = "",
  titleClassName = "",
}: {
  badges?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <header className={`space-y-3 ${className}`}>
      {(badges || rightSlot) ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">{badges}</div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>
      ) : null}

      <h1
        className={
          titleClassName ||
          "mt-2 text-4xl md:text-6xl font-semibold tracking-tight text-white"
        }
      >
        {title}
      </h1>

      {subtitle ? (
        <div className="text-sm md:text-base leading-relaxed text-white/70">
          {subtitle}
        </div>
      ) : null}
    </header>
  );
}
