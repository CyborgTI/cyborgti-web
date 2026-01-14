import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type PromoStripData = {
  badge?: string;
  title: string;
  subtitle?: string | null;
  href?: string | null;
};

export function PromoStrip({
  promo,
  className = "",
}: {
  promo: PromoStripData;
  className?: string;
}) {
  if (!promo) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-card ${className}`}
    >
      {/* fondos decorativos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-brand-500/14 blur-[130px]" />
        <div className="absolute -bottom-28 -right-24 h-[520px] w-[520px] rounded-full bg-brand-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-brand-500 text-white hover:bg-brand-500/90">
              {promo.badge ?? "PROMO"}
            </Badge>
            <span className="text-xs text-white/50">
              Oferta por tiempo limitado
            </span>
          </div>

          <div className="mt-1 font-semibold text-white">
            {promo.title}
          </div>

          {promo.subtitle ? (
            <div className="text-sm text-white/70">
              {promo.subtitle}
            </div>
          ) : null}
        </div>

        {promo.href ? (
          <Link href={promo.href} className="md:shrink-0">
            <Button className="bg-brand-500 hover:bg-brand-500/90 shadow-brand">
              Ver promoción
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
