// src/data/promos/applyPromo.ts
import type { Promo } from "./schema";

type PromoBundle = Extract<Promo, { type: "bundle" }>;
type PromoPercent = Extract<Promo, { type: "percent" }>;

export type DisplayPrice = {
  basePricePEN: number;
  finalPricePEN: number;
  badge?: string; // ej: "10% OFF"
  bundlePromo?: PromoBundle; // para mostrar pack si aplica
};

const parseISODateUTC = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0));
};

function isPromoActive(p: Promo, now = new Date()) {
  const from = parseISODateUTC(p.activeFrom);
  const to = parseISODateUTC(p.activeTo);
  return now >= from && now <= new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1);
}

function roundPEN(n: number) {
  return Math.round(n);
}

function appliesToCourse(p: PromoPercent, slug: string) {
  const list = p.courses ?? [];
  if (list.length === 0) return true; // global
  return list.includes(slug);
}

function getBestPercentPromoForCourse(promos: Promo[], slug: string, now = new Date()) {
  const candidates = promos
    .filter((p): p is PromoPercent => p.type === "percent")
    .filter((p) => isPromoActive(p, now))
    .filter((p) => appliesToCourse(p, slug));

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const dp = (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
    if (dp !== 0) return dp;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });

  return candidates[0];
}

function getFirstBundlePromoForCourse(promos: Promo[], slug: string, now = new Date()) {
  const bundles = promos
    .filter((p): p is PromoBundle => p.type === "bundle")
    .filter((p) => isPromoActive(p, now))
    .filter((p) => (p.courses ?? []).includes(slug));

  if (bundles.length === 0) return null;

  bundles.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return bundles[0];
}

export function getDisplayPriceForCourse(
  promos: Promo[],
  slug: string,
  basePricePEN: number,
  now = new Date()
): DisplayPrice {
  const percent = getBestPercentPromoForCourse(promos, slug, now);
  const bundlePromo = getFirstBundlePromoForCourse(promos, slug, now);

  if (!percent) {
    return { basePricePEN, finalPricePEN: basePricePEN, bundlePromo: bundlePromo ?? undefined };
  }

  const final = roundPEN(basePricePEN * (1 - percent.discountPercent / 100));

  return {
    basePricePEN,
    finalPricePEN: final,
    badge: `${percent.discountPercent}% OFF`,
    bundlePromo: bundlePromo ?? undefined,
  };
}

/* ------------------- CHECKOUT ------------------- */

export type CartItem = { slug: string; qty: number };

export type CheckoutLine =
  | {
      kind: "course";
      slug: string;
      title: string;
      qty: number;
      unitPricePEN: number; // puede tener % aplicado
      baseUnitPricePEN: number;
      lineTotalPEN: number;
    }
  | {
      kind: "bundle";
      promoId: string;
      title: string;
      qty: number;
      unitPricePEN: number; // pack (NO recibe %)
      lineTotalPEN: number;
      includes: string[];
    };

export type DiscountLine = { label: string; amountPEN: number };

export type CheckoutTotals = {
  lines: CheckoutLine[];
  subtotalPEN: number; // subtotal base (sin descuentos)
  discounts: DiscountLine[];
  totalPEN: number;
};

export function computeCheckoutTotals(args: {
  items: CartItem[];
  basePriceBySlug: Record<string, number>;
  titleBySlug: Record<string, string>;
  promos: Promo[];
  now?: Date;
}): CheckoutTotals {
  const now = args.now ?? new Date();
  const activePromos = args.promos.filter((p) => isPromoActive(p, now));

  const subtotalPEN = args.items.reduce((acc, it) => {
    const base = args.basePriceBySlug[it.slug] ?? 0;
    return acc + base * it.qty;
  }, 0);

  let lines: CheckoutLine[] = args.items.map((it) => {
    const baseUnit = args.basePriceBySlug[it.slug] ?? 0;
    const view = getDisplayPriceForCourse(activePromos, it.slug, baseUnit, now);

    return {
      kind: "course",
      slug: it.slug,
      title: args.titleBySlug[it.slug] ?? it.slug,
      qty: it.qty,
      unitPricePEN: view.finalPricePEN,
      baseUnitPricePEN: baseUnit,
      lineTotalPEN: view.finalPricePEN * it.qty,
    };
  });

  const discounts: DiscountLine[] = [];

  const bundles = activePromos
    .filter((p): p is PromoBundle => p.type === "bundle")
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const b of bundles) {
    const coursesInPack = b.courses ?? [];
    if (coursesInPack.length === 0) continue;

    const hasAll = coursesInPack.every((slug) => {
      const line = lines.find(
        (x) => x.kind === "course" && x.slug === slug
      ) as Extract<CheckoutLine, { kind: "course" }> | undefined;
      return !!line && line.qty >= 1;
    });
    if (!hasAll) continue;

    const sumBaseSingles = coursesInPack.reduce((acc, slug) => {
      const base = args.basePriceBySlug[slug] ?? 0;
      return acc + base;
    }, 0);

    if (b.bundlePricePEN >= sumBaseSingles) continue;

    const next: CheckoutLine[] = [];

    for (const l of lines) {
      if (l.kind !== "course") {
        next.push(l);
        continue;
      }

      if (!coursesInPack.includes(l.slug)) {
        next.push(l);
        continue;
      }

      const newQty = l.qty - 1;
      if (newQty <= 0) continue;

      next.push({
        ...l,
        qty: newQty,
        lineTotalPEN: l.unitPricePEN * newQty,
      });
    }

    next.push({
      kind: "bundle",
      promoId: b.id,
      title: b.title,
      qty: 1,
      unitPricePEN: b.bundlePricePEN,
      lineTotalPEN: b.bundlePricePEN,
      includes: [...coursesInPack],
    });

    lines = next;

    discounts.push({
      label: `Pack aplicado (${b.badge || "PROMO"})`,
      amountPEN: roundPEN(sumBaseSingles - b.bundlePricePEN),
    });
  }

  const percentSaved = lines
    .filter((l): l is Extract<CheckoutLine, { kind: "course" }> => l.kind === "course")
    .reduce((acc, l) => acc + (l.baseUnitPricePEN - l.unitPricePEN) * l.qty, 0);

  if (percentSaved > 0) {
    discounts.unshift({ label: "Descuento aplicado", amountPEN: roundPEN(percentSaved) });
  }

  const totalPEN = lines.reduce((acc, l) => acc + l.lineTotalPEN, 0);

  return {
    lines,
    subtotalPEN: roundPEN(subtotalPEN),
    discounts,
    totalPEN: roundPEN(totalPEN),
  };
}
