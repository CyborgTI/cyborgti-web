import { Badge } from "@/components/ui/badge";

export function PromoMetaBadges({
  type = "Bundle",
  activeFrom,
  activeTo,
  coursesCount,
  extraBadge,
  className = "",
}: {
  type?: string; // ej: "Bundle"
  activeFrom?: string | null;
  activeTo?: string | null;
  coursesCount?: number | null;
  extraBadge?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {type ? <Badge variant="secondary">{type}</Badge> : null}

      {activeFrom && activeTo ? (
        <Badge variant="outline">
          Vigencia: {activeFrom} → {activeTo}
        </Badge>
      ) : null}

      {typeof coursesCount === "number" ? (
        <Badge variant="secondary">{coursesCount} cursos incluidos</Badge>
      ) : null}

      {extraBadge ? <Badge variant="outline">{extraBadge}</Badge> : null}
    </div>
  );
}
