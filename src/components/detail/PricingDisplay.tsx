import { formatPEN } from "@/lib/money";

function calcDiscount(basePEN: number, finalPEN: number) {
  const diff = Math.max(0, basePEN - finalPEN);
  const pct = basePEN > 0 ? Math.round((diff / basePEN) * 100) : 0;
  return { diff, pct };
}

type Size = "sm" | "md" | "lg";

const sizeMap: Record<
  Size,
  {
    base: string;
    final: string;
    meta: string;
  }
> = {
  sm: {
    base: "text-sm",
    final: "text-2xl",
    meta: "text-xs",
  },
  md: {
    base: "text-sm",
    final: "text-3xl",
    meta: "text-xs",
  },
  lg: {
    base: "text-lg",
    final: "text-3xl md:text-4xl",
    meta: "text-xs",
  },
};

export function PricingDisplay({
  basePEN,
  finalPEN,
  size = "md",
  showSave = true,
  showPercent = true,
  className = "",
}: {
  basePEN: number;
  finalPEN?: number | null;
  size?: Size;
  showSave?: boolean;
  showPercent?: boolean;
  className?: string;
}) {
  const final = typeof finalPEN === "number" ? finalPEN : basePEN;
  const hasDiscount = final < basePEN;

  const { diff, pct } = calcDiscount(basePEN, final);
  const s = sizeMap[size];

  return (
    <div className={`flex flex-wrap items-end gap-x-4 gap-y-2 ${className}`}>
      {hasDiscount ? (
        <>
          <div className={`${s.base} text-white/45 line-through`}>
            {formatPEN(basePEN)}
          </div>

          <div className={`${s.final} font-semibold text-white`}>
            {formatPEN(final)}
          </div>

          {showSave ? (
            <div className={`${s.meta} text-white/60`}>
              Ahorras{" "}
              <span className="text-white/85 font-semibold">{formatPEN(diff)}</span>{" "}
              {showPercent && pct > 0 ? (
                <span className="ml-1 text-brand-500 font-semibold">
                  ({pct}% OFF)
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div className={`${s.final} font-semibold text-white`}>
          {formatPEN(basePEN)}
        </div>
      )}
    </div>
  );
}
