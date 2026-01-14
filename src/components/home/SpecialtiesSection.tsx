import SpecialtiesSectionClient from "./SpecialtiesSectionClient";

import { getAllCourses } from "@/data/courses/getAll";
import { getActivePromos } from "@/data/promos/getActivePromos";
import { getDisplayPriceForCourse } from "@/data/promos/applyPromo";

const PICKS = [
  "ccna-200-301",
  "ccnp-enterprise",
  "it-essentials",
  "cyberops-associate",
] as const;

type Language = "Multilenguaje" | "Inglés";

function languageForSlug(slug: string): Language {
  // Regla negocio: CCNP y DevNet solo inglés
  if (slug === "ccnp-enterprise" || slug === "devnet") return "Inglés";
  return "Multilenguaje";
}

export default async function SpecialtiesSection() {
  const courses = getAllCourses();
  const promos = await getActivePromos();

  const cards = PICKS.map((slug) => {
    const course = courses.find((c) => c.slug === slug);

    const title = course?.title ?? slug;
    const subtitle = course?.shortDescription ?? "Acceso oficial Cisco NetAcad por 3 meses.";
    const cover =
      course?.cover ??
      (slug === "ccna-200-301"
        ? "/cursos/ccna.png"
        : slug === "ccnp-enterprise"
        ? "/cursos/ccnp.png"
        : slug === "it-essentials"
        ? "/cursos/it_essentials.png"
        : slug === "cyberops-associate"
        ? "/cursos/cyberops.png"
        : "/cursos/ccna.png");

    const basePricePEN = course?.pricePEN ?? 0;
    const view = getDisplayPriceForCourse(promos, slug, basePricePEN);

    return {
      slug,
      title,
      subtitle,
      cover,
      language: languageForSlug(slug),
      price: view,
    };
  });

  return <SpecialtiesSectionClient cards={cards} />;
}
