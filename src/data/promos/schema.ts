// src/data/promos/schema.ts
import { z } from "zod";

/* ------------------ HOME ------------------ */

export const HomePromoCardSchema = z.object({
  id: z.string(),
  label: z.string().optional().default(""),
  image: z.string(),
  href: z.string().nullable().default(null), // ✅ tu JSON usa null
});

export type HomePromoCard = z.infer<typeof HomePromoCardSchema>;

export const HomePromosSchema = z.object({
  top: z.array(HomePromoCardSchema).default([]),
  featured: HomePromoCardSchema.nullable().default(null),
});

export type HomePromos = z.infer<typeof HomePromosSchema>;

/* ------------------ ITEMS ------------------ */

const PromoBaseSchema = z.object({
  id: z.string(),
  type: z.enum(["bundle", "percent"]),
  title: z.string(),
  subtitle: z.string().optional().default(""),
  image: z.string(),
  activeFrom: z.string(), // YYYY-MM-DD
  activeTo: z.string(), // YYYY-MM-DD
  href: z.string().nullable().default(null),
  priority: z.number().optional().default(0),
  badge: z.string().optional().default(""),
});

export const PromoBundleSchema = PromoBaseSchema.extend({
  type: z.literal("bundle"),
  courses: z.array(z.string()).default([]),
  bundlePricePEN: z.number(),
});

export const PromoPercentSchema = PromoBaseSchema.extend({
  type: z.literal("percent"),
  discountPercent: z.number(),
  // [] => aplica a todos
  courses: z.array(z.string()).default([]),
});

export const PromoSchema = z.union([PromoBundleSchema, PromoPercentSchema]);
export type Promo = z.infer<typeof PromoSchema>;

export const PromosPayloadSchema = z.object({
  home: HomePromosSchema.default({ top: [], featured: null }),
  items: z.array(PromoSchema).default([]),
});

export type PromosPayload = z.infer<typeof PromosPayloadSchema>;

/**
 * Acepta:
 * 1) { home, items }
 * 2) { promos: { home, items } }
 */
export function normalizePromosPayload(raw: unknown): PromosPayload {
  const maybeWrapped =
    raw &&
    typeof raw === "object" &&
    raw !== null &&
    "promos" in (raw as Record<string, unknown>)
      ? (raw as { promos: unknown }).promos
      : raw;

  const parsed = PromosPayloadSchema.safeParse(maybeWrapped);
  if (parsed.success) return parsed.data;

  // fallback seguro
  return {
    home: { top: [], featured: null },
    items: [],
  };
}
