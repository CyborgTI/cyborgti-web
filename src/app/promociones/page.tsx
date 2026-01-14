import Link from "next/link";
import { getActivePromos } from "@/data/promos/getActivePromos";

export const revalidate = 60;

function PromoCardContent({
  title,
  subtitle,
  typeLabel,
  activeFrom,
  activeTo,
  ctaLabel,
}: {
  title: string;
  subtitle?: string;
  typeLabel: string;
  activeFrom: string;
  activeTo: string;
  ctaLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card">
      <div className="text-xs text-white/60">{typeLabel}</div>

      <div className="mt-2 text-lg font-semibold text-white">{title}</div>

      {subtitle ? <div className="mt-1 text-sm text-white/70">{subtitle}</div> : null}

      <div className="mt-4 text-sm text-white/60">
        Vigencia: {activeFrom} → {activeTo}
      </div>

      {ctaLabel ? (
        <div className="mt-5 inline-flex items-center rounded-md bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-brand transition-cyborg">
          {ctaLabel}
        </div>
      ) : (
        <div className="mt-5 text-xs text-white/60">
          Se aplica automáticamente en checkout.
        </div>
      )}
    </div>
  );
}

export default async function PromocionesPage() {
  const promos = await getActivePromos();

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Promociones</h1>
        <p className="mt-2 text-muted-foreground">
          Promos activas por tiempo limitado.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {promos.map((p) => {
          const canOpenDetail = !!p.href; // ✅ regla: si no hay href, no hay página
          const typeLabel = p.type === "bundle" ? "Bundle" : "Descuento";

          const card = (
            <PromoCardContent
              title={p.title}
              subtitle={p.subtitle}
              typeLabel={typeLabel}
              activeFrom={p.activeFrom}
              activeTo={p.activeTo}
              ctaLabel={canOpenDetail ? "Ver promoción" : undefined}
            />
          );

          if (!canOpenDetail) {
            return (
              <div key={p.id} className="cursor-default">
                {card}
              </div>
            );
          }

          return (
            <Link
              key={p.id}
              href={`/promociones/${p.id}`}
              className="group block transition-cyborg hover:opacity-[0.98]"
            >
              <div className="rounded-2xl transition-cyborg group-hover:border-brand-500/40 group-hover:shadow-brand">
                {card}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
