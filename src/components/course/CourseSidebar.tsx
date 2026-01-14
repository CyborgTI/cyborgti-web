import Link from "next/link";
import { FiX, FiFilter } from "react-icons/fi";
import { cn } from "@/lib/utils";

type CategoryValue = "all" | "networking" | "cybersecurity" | "it" | "programacion";

const CATEGORIES: { label: string; value: CategoryValue }[] = [
  { label: "Cursos", value: "all" },
  { label: "Networking", value: "networking" },
  { label: "Ciberseguridad", value: "cybersecurity" },
  { label: "Tecnología de la información", value: "it" },
  { label: "Programación", value: "programacion" },
];

function hrefFor(value: CategoryValue) {
  return value === "all" ? "/cursos" : `/cursos?cat=${value}`;
}

export function CourseSidebar({
  active = "all",
  counts,
}: {
  active?: CategoryValue;
  counts: Record<CategoryValue, number>;
}) {
  const drawerId = "course-filter-drawer";

  return (
    <aside className="w-full lg:max-w-[260px] lg:shrink-0">
      {/* ===========================
          MOBILE: App Bar (sticky) + Chips (wrap) + Drawer
      ============================ */}
      <div className="lg:hidden">
        <div className="sticky top-[72px] z-30 w-full max-w-full pt-3 pb-2">
          <div
            className={cn(
              "w-full max-w-full min-w-0 overflow-hidden",
              "rounded-2xl border border-white/10 bg-background/65 backdrop-blur-md",
              "shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
            )}
          >
            <div className="flex min-w-0 items-center justify-between gap-3 px-3.5 pt-3">
              <div className="min-w-0 text-sm font-semibold tracking-tight text-white/90">
                Categorías
              </div>

              <label
                htmlFor={drawerId}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium",
                  "bg-white/5 text-white ring-1 ring-white/10",
                  "transition-all hover:bg-white/10 hover:ring-white/20 active:scale-[0.98]",
                  "cursor-pointer select-none"
                )}
              >
                <FiFilter className="h-4 w-4 text-white/70" />
                <span className="text-white/90">Filtrar</span>
              </label>
            </div>

            {/* ✅ Chips con WRAP (si no cabe, baja de línea) */}
            <nav
              className={cn(
                "mt-2 w-full max-w-full min-w-0",
                "flex flex-wrap items-center gap-2 px-3.5 pb-3"
              )}
              aria-label="Categorías rápidas"
            >
              {CATEGORIES.map((c) => {
                const isActive = active === c.value;
                const href = hrefFor(c.value);
                const count = counts[c.value] ?? 0;

                return (
                  <Link
                    key={c.value}
                    href={href}
                    prefetch={false}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px]",
                      "ring-1 backdrop-blur transition-all",
                      // permite que el chip se acomode bien en líneas
                      "max-w-full",
                      isActive
                        ? "bg-brand-500/20 text-white ring-brand-500/35"
                        : "bg-white/5 text-white/80 ring-white/10 hover:bg-white/10 hover:ring-white/20",
                      "active:scale-[0.98]"
                    )}
                  >
                    <span className="whitespace-nowrap">{c.label}</span>

                    <span
                      className={cn(
                        "ml-1 inline-flex min-w-[22px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] leading-none",
                        isActive
                          ? "bg-brand-500/20 text-white/90 ring-1 ring-brand-500/30"
                          : "bg-black/20 text-white/70 ring-1 ring-white/10"
                      )}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Drawer trigger */}
        <input id={drawerId} type="checkbox" className="peer hidden" />

        {/* Backdrop */}
        <label
          htmlFor={drawerId}
          className="fixed inset-0 z-40 hidden bg-black/60 backdrop-blur-sm peer-checked:block"
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className="
            fixed bottom-0 left-0 right-0 z-50
            translate-y-full peer-checked:translate-y-0
            transition-transform duration-200 ease-out
          "
        >
          <div className="rounded-t-2xl bg-background ring-1 ring-white/10">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90">Filtrar por categoría</div>
                  <div className="mt-1 text-xs text-white/60">
                    Elige una categoría para ver cursos disponibles.
                  </div>
                </div>

                <label
                  htmlFor={drawerId}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs",
                    "bg-white/5 text-white ring-1 ring-white/10 backdrop-blur",
                    "transition-all hover:bg-white/10 hover:ring-white/20 active:scale-[0.98]",
                    "cursor-pointer select-none"
                  )}
                >
                  <FiX className="h-4 w-4 text-white/60" />
                  Cerrar
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                {CATEGORIES.map((c) => {
                  const isActive = active === c.value;
                  const href = hrefFor(c.value);
                  const count = counts[c.value] ?? 0;

                  return (
                    <Link
                      key={c.value}
                      href={href}
                      prefetch={false}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors",
                        "ring-1 ring-white/10 bg-white/5 hover:bg-white/10 hover:ring-white/20",
                        isActive && "bg-brand-500/15 ring-brand-500/25"
                      )}
                    >
                      <span className={cn(isActive ? "text-white" : "text-white/85")}>{c.label}</span>
                      <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-white/70 ring-1 ring-white/10">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* ===========================
          DESKTOP
      ============================ */}
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl bg-white/3 ring-1 ring-white/10 p-4">
          <div className="mb-3 text-sm font-semibold">Categorías</div>

          <nav className="space-y-1">
            {CATEGORIES.map((c) => {
              const isActive = active === c.value;
              const href = hrefFor(c.value);
              const count = counts[c.value] ?? 0;

              return (
                <Link
                  key={c.value}
                  href={href}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    isActive && "bg-white/7 text-foreground"
                  )}
                >
                  <span>{c.label}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 h-px w-full bg-white/10" />
          <p className="mt-4 text-xs text-muted-foreground">Filtra el catálogo por categoría.</p>
        </div>
      </div>
    </aside>
  );
}
