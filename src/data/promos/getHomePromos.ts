// src/data/promos/getHomePromos.ts
import { getPromos } from "./getPromos";
import type { HomePromos } from "./schema";

export async function getHomePromos(): Promise<HomePromos> {
  const payload = await getPromos();
  return payload.home;
}
