import Link from "next/link";
import { getHomePromos } from "@/data/promos/getHomePromos";
import type { HomePromoCard } from "@/data/promos/schema";

function PromoTile({
  promo,
  clickable,
  note,
}: {
  promo: HomePromoCard;
  clickable: boolean;
  note?: string;
}) {
  const content = (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-card",
        clickable ? "transition-cyborg hover:border-white/20 hover:shadow-brand" : "",
      ].join(" ")}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${promo.image}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex min-h-[220px] items-end p-6 md:min-h-[250px] md:p-8">
        <div className="max-w-[92%]">
          <div className="text-[11px] uppercase tracking-[0.35em] text-white/60">
            Promoción
          </div>

          <div className="mt-2 text-xl font-semibold text-white md:text-2xl">
            {promo.label}
          </div>

          {note ? <div className="mt-2 text-sm text-white/65">{note}</div> : null}

          {clickable ? (
            <div className="mt-5 inline-flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-brand transition-cyborg group-hover:glow-brand-soft">
                Ver promoción
              </span>
              <span className="text-xs text-white/55 transition-cyborg group-hover:text-white/70">
                →
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {clickable ? (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-cyborg group-hover:opacity-100">
          <div className="absolute inset-0 ring-1 ring-brand-500/35" />
          <div className="absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full bg-brand-500/18 blur-[140px]" />
        </div>
      ) : null}
    </div>
  );

  if (!clickable) return <div className="cursor-default">{content}</div>;

  return (
    <Link href={promo.href ?? "/promociones"} className="block">
      {content}
    </Link>
  );
}

function FeaturedImageOnly({ featured }: { featured: HomePromoCard }) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-card transition-cyborg hover:border-white/20 hover:shadow-brand">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${featured.image}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* ✅ NO se cambia la altura */}
      <div className="relative min-h-[320px] md:min-h-[360px]" />
    </div>
  );

  return (
    <Link href={featured.href ?? "/promociones"} className="block">
      {content}
    </Link>
  );
}

export async function PromosSection() {
  const home = await getHomePromos();

  const top = home.top ?? [];
  const featured = home.featured ?? null;

  const promo2x1 = top.find((p) => p.id === "2x1-ccna-cyberops") ?? null;
  const promo10 = top.find((p) => p.id === "10off-web") ?? null;

  const fallbackA = !promo2x1 ? top[0] ?? null : null;
  const fallbackB =
    !promo10 ? top.find((p) => p.id !== promo2x1?.id) ?? top[1] ?? null : null;

  const left = promo2x1 ?? fallbackA;
  const right = promo10 ?? fallbackB;

  return (
    // ✅ Solo reducimos padding inferior
    <section className="mx-auto max-w-7xl px-4 pt-14 pb-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Promociones activas
        </h2>
        <div className="hidden sm:block h-px flex-1 bg-white/10" />
        <span className="hidden md:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          Se aplican en checkout
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {left ? <PromoTile promo={left} clickable={true} /> : null}

        {right ? (
          <PromoTile
            promo={right}
            clickable={false}
            note="Se aplica automáticamente en checkout."
          />
        ) : null}
      </div>

      {featured ? (
        // ✅ menos separación hacia abajo
        <div className="mt-4">
          <FeaturedImageOnly featured={featured} />
        </div>
      ) : null}
    </section>
  );
}
