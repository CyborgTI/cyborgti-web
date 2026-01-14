import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/types/course";

import { formatPEN } from "@/lib/money";
import { AddIconToCart } from "@/components/course/AddIconToCart";
import { getDisplayPriceForCourse } from "@/data/promos/applyPromo";
import type { Promo } from "@/data/promos/schema";
import type { DisplayPrice } from "@/data/promos/applyPromo";

type Props = {
  course: Course;
  promos: Promo[];
};

function pickCover(course: Course) {
  const c = course as Course & { image?: string };
  return c.cover || c.image || "/images/course-placeholder.jpg";
}

function languageForSlug(slug: string) {
  return slug === "ccnp-enterprise" || slug === "devnet" ? "Inglés" : "Multilenguaje";
}

export function CourseCard({ course, promos }: Props) {
  const display: DisplayPrice = getDisplayPriceForCourse(promos, course.slug, course.pricePEN);

  const finalPEN = display.finalPricePEN;
  const basePEN = display.basePricePEN;

  const badge = display.badge ?? null;
  const hasDiscount = basePEN > finalPEN;

  const cover = pickCover(course);
  const lang = languageForSlug(course.slug);

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="
        group block w-full min-w-0 overflow-hidden rounded-2xl
        bg-white/3 ring-1 ring-white/10
        transition-all duration-300
        hover:bg-white/5 hover:ring-white/20
      "
    >
      {/* ==================================================
          MOBILE / TABLET (< md): tile compacta (2 cols)
         ================================================== */}
      <div className="md:hidden">
        {/* Imagen: 4/5 para evitar “gigante” en pantallas chicas */}
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={cover}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {badge ? (
            <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[10px] text-white/90 ring-1 ring-white/10 backdrop-blur">
              {badge}
            </div>
          ) : null}

          <div className="absolute right-2 top-2">
            <div className="scale-[0.82]">
              <AddIconToCart slug={course.slug} />
            </div>
          </div>

          <div className="absolute left-2 bottom-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] text-white/75 backdrop-blur">
              3 meses
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] text-white/75 backdrop-blur">
              {lang}
            </span>
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-[12px] font-semibold leading-snug text-white line-clamp-2">
            {course.title}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-[10px] text-white/40 line-through">{formatPEN(basePEN)}</span>
                <span className="text-[12px] font-semibold text-white">{formatPEN(finalPEN)}</span>
              </>
            ) : (
              <span className="text-[12px] font-semibold text-white">{formatPEN(finalPEN)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          DESKTOP (>= md): tu poster premium (muy similar)
         ================================================== */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-2 ring-indigo-500/25 opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative aspect-[4/5] w-full">
            <Image
              src={cover}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/5" />
          </div>

          {badge ? (
            <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white ring-1 ring-white/15 backdrop-blur">
              {badge}
            </div>
          ) : null}

          <div className="absolute left-4 bottom-4 z-10 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
              3 meses
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
              {lang}
            </span>
          </div>

          <div className="absolute bottom-4 right-4 z-10">
            <AddIconToCart slug={course.slug} />
          </div>
        </div>

        <div className="px-3 pt-4 pb-3 sm:px-4">
          <h3 className="truncate text-base font-semibold tracking-tight text-white">{course.title}</h3>

          {"shortDescription" in course && (course as any).shortDescription ? (
            <p className="mt-1 text-sm text-white/60 line-clamp-2">
              {(course as any).shortDescription}
            </p>
          ) : null}

          <div className="mt-3 flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm text-white/45 line-through">{formatPEN(basePEN)}</span>
                <span className="text-sm font-semibold text-white/90">{formatPEN(finalPEN)}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-white/90">{formatPEN(finalPEN)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
