import Link from "next/link";
import { FiX, FiFilter } from "react-icons/fi";

import { getAllCourses } from "@/data/courses/getAll";
import { getActivePromos } from "@/data/promos/getActivePromos";
import type { CourseDTO } from "@/data/courses/schema";

import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseSidebar } from "@/components/course/CourseSidebar";

export const revalidate = 60;

type CategoryValue = "all" | "networking" | "cybersecurity" | "it" | "programacion";

type SearchParams = {
  cat?: string;
};

function normalize(s: unknown) {
  return String(s ?? "").trim().toLowerCase();
}

const ALLOWED_CATS: CategoryValue[] = ["all", "networking", "cybersecurity", "it", "programacion"];

const CATEGORY_LABEL: Record<CategoryValue, string> = {
  all: "Cursos",
  networking: "Networking",
  cybersecurity: "Ciberseguridad",
  it: "Tecnología de la información",
  programacion: "Programación",
};

function getCourseCategory(course: CourseDTO): Exclude<CategoryValue, "all"> {
  const slug = normalize(course.slug);

  if (slug.includes("python")) return "programacion";
  if (slug.includes("devnet")) return "programacion";
  if (slug.includes("cyberops")) return "cybersecurity";
  if (slug.includes("it-essentials")) return "it";

  return "networking";
}

function parseCat(catRaw: unknown): CategoryValue {
  const raw = normalize(catRaw);
  if (!raw) return "all";
  return (ALLOWED_CATS.includes(raw as CategoryValue) ? raw : "all") as CategoryValue;
}

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cat = parseCat(sp?.cat);

  const courses = getAllCourses() as CourseDTO[];
  const promos = await getActivePromos();

  const filtered = cat === "all" ? courses : courses.filter((c) => getCourseCategory(c) === cat);

  const counts: Record<CategoryValue, number> = {
    all: courses.length,
    networking: 0,
    cybersecurity: 0,
    it: 0,
    programacion: 0,
  };

  courses.forEach((c) => {
    counts[getCourseCategory(c)] += 1;
  });

  const showingText =
    cat === "all"
      ? `Mostrando ${filtered.length} cursos`
      : `Mostrando ${filtered.length} cursos en ${CATEGORY_LABEL[cat]}`;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
      <header className="mb-6 sm:mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Cursos Cisco NetAcad
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Acceso oficial por <span className="font-semibold text-white/85">3 meses</span> (renovable).
          Multilenguaje excepto <span className="font-semibold text-white/85">CCNP</span> y{" "}
          <span className="font-semibold text-white/85">DevNet</span> (solo inglés).
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10 lg:items-start">
        <CourseSidebar active={cat} counts={counts} />

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-full max-w-full items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur sm:w-auto">
              <FiFilter className="h-4 w-4 text-white/60" />
              <span className="text-white/70">{showingText}</span>
            </div>

            {cat !== "all" ? (
              <Link
                href="/cursos"
                className="
                  inline-flex w-full items-center justify-center gap-2 rounded-full
                  bg-white/5 px-4 py-2 text-xs text-white
                  ring-1 ring-white/10 backdrop-blur
                  transition-all duration-200
                  hover:bg-white/10 hover:ring-white/20
                  active:scale-[0.98]
                  sm:w-auto
                "
              >
                <FiX className="h-4 w-4 text-white/60" />
                <span>Ver todos</span>
              </Link>
            ) : null}
          </div>

          <CourseGrid courses={filtered} promos={promos} />
        </div>
      </section>
    </main>
  );
}
