// src/app/checkout/page.tsx
import { Suspense } from "react";

import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getAllCourses } from "@/data/courses/getAll";
import { getActivePromos } from "@/data/promos/getActivePromos";

export const revalidate = 60;

function CheckoutFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-white/5 p-8 shadow-card">
      <p className="text-white/80">Cargando checkout…</p>
    </div>
  );
}

export default async function CheckoutPage() {
  const courses = await Promise.resolve(getAllCourses());
  const promos = await getActivePromos();

  const basePriceBySlug: Record<string, number> = {};
  const titleBySlug: Record<string, string> = {};

  for (const c of courses) {
    basePriceBySlug[c.slug] = c.pricePEN;
    titleBySlug[c.slug] = c.title;
  }

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-10">
      <Suspense fallback={<CheckoutFallback />}>
        <CheckoutClient
          basePriceBySlug={basePriceBySlug}
          titleBySlug={titleBySlug}
          promos={promos}
        />
      </Suspense>
    </main>
  );
}
