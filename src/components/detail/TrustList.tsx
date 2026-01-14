export function TrustList({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  if (!items?.length) return null;

  return (
    <div className={`flex flex-col gap-2 text-sm text-white/70 ${className}`}>
      {items.map((x) => (
        <span key={x}>✔ {x}</span>
      ))}
    </div>
  );
}
