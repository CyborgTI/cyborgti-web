import { CartClient } from "@/components/checkout/CartClient";
import { getAllCourses } from "@/data/courses/getAll";
import { getActivePromos } from "@/data/promos/getActivePromos";

export const revalidate = 60;

export default async function CarritoPage() {
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
      <CartClient basePriceBySlug={basePriceBySlug} titleBySlug={titleBySlug} promos={promos} />
    </main>
  );
}
