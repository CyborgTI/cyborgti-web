"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatPEN } from "@/lib/money";
import { useCartStore } from "@/features/cart/store";
import type { Promo } from "@/data/promos/schema";
import { computeCheckoutTotals } from "@/data/promos/applyPromo";

type Props = {
  basePriceBySlug: Record<string, number>;
  titleBySlug: Record<string, string>;
  promos: Promo[];
};

const MAX_QTY_PER_COURSE = 5;

export function CartClient({ basePriceBySlug, titleBySlug, promos }: Props) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const totals = useMemo(() => {
    return computeCheckoutTotals({
      items,
      basePriceBySlug,
      titleBySlug,
      promos,
    });
  }, [items, basePriceBySlug, titleBySlug, promos]);

  const hasBundleApplied = totals.lines.some((l) => l.kind === "bundle");

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white/5 p-8 shadow-card">
        <p className="text-white/80">Tu carrito está vacío.</p>
        <div className="mt-4">
          <Link href="/cursos">
            <Button className="bg-brand-500 hover:bg-brand-500/90">Explorar cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-border/60 bg-white/5 p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white/95">Carrito</h2>

          <button
            onClick={clear}
            className="text-sm text-white/60 hover:text-white transition-cyborg"
          >
            Vaciar
          </button>
        </div>

        {hasBundleApplied ? (
          <div className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white/95">
                  Pack 2x1 aplicado automáticamente ✅
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Si tienes CCNA + CyberOps en el carrito, se convierte en el pack de promoción.
                </div>
              </div>

              <Link href="/promociones/2x1-ccna-cyberops" className="shrink-0">
                <Button className="bg-brand-500 hover:bg-brand-500/90">Ver promo</Button>
              </Link>
            </div>

            <div className="mt-3 text-[12px] text-white/55">
              * El 10% se aplica solo a cursos sueltos. El pack no recibe descuento adicional.
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {totals.lines.map((l) => {
            if (l.kind === "bundle") {
              return (
                <div
                  key={`bundle-${l.promoId}`}
                  className="rounded-xl border border-brand-500/25 bg-brand-500/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white/95 font-semibold">{l.title}</div>
                      <div className="mt-1 text-sm text-white/70">
                        Pack aplicado automáticamente
                      </div>
                      <div className="mt-2 text-sm text-white/70">
                        Incluye: <span className="text-white/85">{l.includes.join(" + ")}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white/95 font-semibold">{formatPEN(l.unitPricePEN)}</div>
                      <div className="text-sm text-white/70">{formatPEN(l.lineTotalPEN)}</div>
                    </div>
                  </div>
                </div>
              );
            }

            const hasDiscount = l.unitPricePEN < l.baseUnitPricePEN;
            const decDisabled = l.qty <= 1;
            const incDisabled = l.qty >= MAX_QTY_PER_COURSE;

            return (
              <div
                key={l.slug}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-[0.08em] uppercase text-white/90">
                    {l.title}
                  </div>

                  <div className="mt-1 text-sm text-white/60">
                    {hasDiscount ? (
                      <>
                        <span className="line-through text-white/45">
                          {formatPEN(l.baseUnitPricePEN)}
                        </span>
                        <span className="mx-2 text-white/35">→</span>
                        <span className="text-white/85">{formatPEN(l.unitPricePEN)}</span>
                        <span className="ml-2 text-xs text-white/50">(se aplica en checkout)</span>
                      </>
                    ) : (
                      <span className="text-white/75">{formatPEN(l.unitPricePEN)} c/u</span>
                    )}
                  </div>

                  <div className="mt-2 text-[12px] text-white/45">
                    Máximo {MAX_QTY_PER_COURSE} licencias por curso.
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="flex items-center gap-2">
                    <button
                      className="h-10 w-10 rounded-md border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-cyborg disabled:opacity-40 disabled:hover:bg-white/5"
                      onClick={() => setQty(l.slug, l.qty - 1)}
                      aria-label="Disminuir"
                      disabled={decDisabled}
                      title={decDisabled ? "Mínimo 1" : "Disminuir"}
                    >
                      −
                    </button>

                    <div className="min-w-10 text-center text-white">{l.qty}</div>

                    <button
                      className="h-10 w-10 rounded-md border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-cyborg disabled:opacity-40 disabled:hover:bg-white/5"
                      onClick={() => setQty(l.slug, l.qty + 1)}
                      aria-label="Aumentar"
                      disabled={incDisabled}
                      title={incDisabled ? `Máximo ${MAX_QTY_PER_COURSE}` : "Aumentar"}
                    >
                      +
                    </button>
                  </div>

                  <div className="w-28 text-right text-sm font-semibold text-white">
                    {formatPEN(l.lineTotalPEN)}
                  </div>

                  <button
                    className="text-sm text-white/60 hover:text-white transition-cyborg"
                    onClick={() => removeItem(l.slug)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Subtotal (base)</span>
            <span className="text-white/95 font-semibold">{formatPEN(totals.subtotalPEN)}</span>
          </div>

          {totals.discounts.length ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/90">Descuentos</div>
              <div className="mt-2 space-y-1">
                {totals.discounts.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">{d.label}</span>
                    <span className="text-white/90">- {formatPEN(d.amountPEN)}</span>
                  </div>
                ))}
              </div>

              {!hasBundleApplied ? (
                <div className="mt-3 text-[12px] text-white/55">
                  * El 10% se aplica solo a cursos sueltos. El pack no recibe descuento adicional.
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-2">
            <span className="text-white/80">Total</span>
            <span className="text-white font-semibold text-lg">{formatPEN(totals.totalPEN)}</span>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-border/60 bg-white/5 p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white/95">Siguiente paso</h2>

        <p className="mt-2 text-sm text-white/70">
          Mercado Pago se conectará en la siguiente etapa. Por ahora esto es un checkout demo.
        </p>

        <div className="mt-6 space-y-3">
          <Link href="/checkout" className="block">
            <Button className="w-full bg-brand-500 hover:bg-brand-500/90">
              Continuar al checkout
            </Button>
          </Link>

          <Link href="/cursos" className="block">
            <Button
              variant="outline"
              className="w-full border-white/15 text-white/90 hover:bg-white/5"
            >
              Seguir comprando
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full border-brand-500/40 text-white hover:bg-brand-500/10"
            onClick={clear}
          >
            Vaciar carrito
          </Button>
        </div>
      </aside>
    </section>
  );
}
