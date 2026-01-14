// src/data/promos/getPromos.ts
import { cache } from "react";
import { get } from "@vercel/edge-config";
import { normalizePromosPayload, type PromosPayload } from "./schema";

async function readLocalPromosNode(): Promise<unknown | null> {
  try {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "public", "content", "promos.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveSiteOrigin(): string | null {
  // 1) URL explícita (recomendado)
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  // 2) Vercel (prod)
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  // 3) DEV fallback (local)
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";

  return null;
}


async function readLocalPromosEdge(): Promise<unknown | null> {
  try {
    const origin = resolveSiteOrigin();
    if (!origin) return null;

    const res = await fetch(`${origin}/content/promos.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function readLocalPromos(): Promise<unknown | null> {
  // En edge no hay fs
  if (process.env.NEXT_RUNTIME === "edge") return readLocalPromosEdge();
  return readLocalPromosNode();
}

async function readEdgePromos(): Promise<unknown | null> {
  try {
    const raw = await get("promos"); // key única "promos"
    return raw ?? null;
  } catch {
    return null;
  }
}

export const getPromos = cache(async (): Promise<PromosPayload> => {
  const source = (process.env.PROMOS_SOURCE ?? "edge").toLowerCase();

  // Dev: forzar local
  if (source === "local") {
    const local = await readLocalPromos();
    return normalizePromosPayload(local);
  }

  // Prod: edge primero
  const edge = await readEdgePromos();
  if (edge) return normalizePromosPayload(edge);

  // fallback: local
  const local = await readLocalPromos();
  return normalizePromosPayload(local);
});
