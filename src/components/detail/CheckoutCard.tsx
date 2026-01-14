import type { ReactNode } from "react";

export function CheckoutCard({
  title = "CHECKOUT",
  rightSlot,
  children,
}: {
  title?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -right-24 h-[520px] w-[520px] rounded-full bg-brand-500/12 blur-[160px]" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.35em] text-white/55">
              {title}
            </div>
            {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </aside>
  );
}
