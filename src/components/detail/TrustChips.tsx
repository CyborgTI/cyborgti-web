export function TrustChips({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  if (!items?.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 text-xs ${className}`}>
      {items.map((x) => (
        <span
          key={x}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70"
        >
          {x}
        </span>
      ))}
    </div>
  );
}
