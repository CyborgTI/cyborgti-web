import { Badge } from "@/components/ui/badge";

type Level = "Inicial" | "Intermedio" | "Avanzado";
type Language = "Multilenguaje" | "Inglés";

function languageForSlug(slug: string): Language {
  // Regla negocio: CCNP y DevNet solo inglés
  if (slug === "ccnp-enterprise" || slug === "devnet") return "Inglés";
  return "Multilenguaje";
}

export function CourseMetaBadges({
  slug,
  level,
  extraBadge,
}: {
  slug: string;
  level: Level;
  extraBadge?: string | null;
}) {
  const lang = languageForSlug(slug);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Nivel */}
      <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
        {level}
      </Badge>

      {/* Acceso */}
      <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
        Acceso 3 meses
      </Badge>

      {/* Idioma */}
      <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
        {lang}
      </Badge>

      {/* Promo */}
      {extraBadge ? (
        <Badge className="bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/25">
          {extraBadge}
        </Badge>
      ) : null}
    </div>
  );
}
