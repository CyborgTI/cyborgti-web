import type { ReactNode } from "react";

export function DetailSection({
  kicker,
  title,
  children,
  className = "",
  kickerClassName = "",
  titleClassName = "",
}: {
  kicker?: string; // ej: "DESCRIPCIÓN" o "INCLUYE"
  title?: ReactNode; // opcional si quieres un h2 real
  children: ReactNode;
  className?: string;
  kickerClassName?: string;
  titleClassName?: string;
}) {
  return (
    <section className={className}>
      {kicker ? (
        <div
          className={
            kickerClassName ||
            "text-[11px] uppercase tracking-[0.35em] text-white/55"
          }
        >
          {kicker}
        </div>
      ) : null}

      {title ? (
        <h2 className={titleClassName || "mt-3 text-lg font-medium text-white"}>
          {title}
        </h2>
      ) : null}

      <div className={kicker || title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
