import type { CartItem } from "./types";
import type { CourseDTO } from "@/data/courses/schema";

/** Une items del carrito (slug/qty) con data real de cursos */
export function hydrateCartItems(
  items: CartItem[],
  courses: CourseDTO[]
): Array<{ course: CourseDTO; qty: number }> {
  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  return items
    .map((it) => {
      const course = bySlug.get(it.slug);
      if (!course) return null;
      return { course, qty: it.qty };
    })
    .filter(Boolean) as Array<{ course: CourseDTO; qty: number }>;
}

export function calcSubtotal(hydrated: Array<{ course: CourseDTO; qty: number }>): number {
  return hydrated.reduce((acc, row) => acc + row.course.pricePEN * row.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.qty, 0);
}

/** ✅ Mapas para checkout/promos */
export function buildCheckoutMaps(courses: CourseDTO[]) {
  const basePriceBySlug: Record<string, number> = {};
  const titleBySlug: Record<string, string> = {};

  for (const c of courses) {
    basePriceBySlug[c.slug] = c.pricePEN;
    titleBySlug[c.slug] = c.title;
  }

  return { basePriceBySlug, titleBySlug };
}
