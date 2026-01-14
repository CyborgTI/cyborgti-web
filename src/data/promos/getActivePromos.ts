// src/data/promos/getActivePromos.ts
import { getPromos } from "./getPromos";
import type { Promo } from "./schema";

function dayStartUTC(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`).getTime();
}
function dayEndUTC(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999Z`).getTime();
}

function isPromoActiveNow(p: Promo, now = Date.now()) {
  const start = dayStartUTC(p.activeFrom);
  const end = dayEndUTC(p.activeTo);
  return now >= start && now <= end;
}

export async function getActivePromos(): Promise<Promo[]> {
  const payload = await getPromos();
  const now = Date.now();

  return payload.items
    .filter((p) => isPromoActiveNow(p, now))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}
