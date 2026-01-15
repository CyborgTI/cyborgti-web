"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function isEmailValid(email: string) {
  const v = email.trim();
  return v.includes("@") && v.includes(".");
}

function normalizeWhatsAppDigits(input: string) {
  return input.replace(/\D/g, "");
}

function buildEntitlementsFromLines(lines: ReturnType<typeof computeCheckoutTotals>["lines"]) {
  const counts: Record<string, number> = {};

  for (const l of lines) {
    if (l.kind === "course") {
      counts[l.slug] = (counts[l.slug] ?? 0) + l.qty;
    } else {
      const q = l.qty ?? 1;
      for (const slug of l.includes) {
        counts[slug] = (counts[slug] ?? 0) + q;
      }
    }
  }

  return counts;
}

function safeJsonParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CheckoutClient({ basePriceBySlug, titleBySlug, promos }: Props) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const sp = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [whatsApp, setWhatsApp] = useState("");

  const [licenseEmails, setLicenseEmails] = useState<Record<string, string[]>>({});
  const [copyAllBySlug, setCopyAllBySlug] = useState<Record<string, boolean>>({});

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [mpReturnStatus, setMpReturnStatus] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const totals = useMemo(() => {
    return computeCheckoutTotals({
      items,
      basePriceBySlug,
      titleBySlug,
      promos,
    });
  }, [items, basePriceBySlug, titleBySlug, promos]);

  const entitlements = useMemo(() => {
    return buildEntitlementsFromLines(totals.lines);
  }, [totals.lines]);

  useEffect(() => {
    setLicenseEmails((prev) => {
      const next: Record<string, string[]> = { ...prev };

      for (const [slug, count] of Object.entries(entitlements)) {
        const current = next[slug] ?? [];
        if (current.length === count) continue;

        if (current.length < count) {
          next[slug] = [...current, ...Array.from({ length: count - current.length }, () => "")];
        } else {
          next[slug] = current.slice(0, count);
        }
      }

      for (const slug of Object.keys(next)) {
        if (!(slug in entitlements)) delete next[slug];
      }

      return next;
    });

    setCopyAllBySlug((prev) => {
      const next = { ...prev };
      for (const slug of Object.keys(next)) {
        if (!(slug in entitlements)) delete next[slug];
      }
      return next;
    });
  }, [entitlements]);

  const digits = normalizeWhatsAppDigits(whatsApp);
  const isWhatsAppValid = digits.length >= 8;
  const isNameValid = fullName.trim().length >= 3;

  const allEmailsValid = useMemo(() => {
    const slugs = Object.keys(entitlements);
    if (slugs.length === 0) return false;

    for (const slug of slugs) {
      const needed = entitlements[slug] ?? 0;
      const arr = licenseEmails[slug] ?? [];

      if (needed <= 0) return false;
      if (arr.length !== needed) return false;

      for (const email of arr) {
        if (!isEmailValid(email)) return false;
      }
    }

    return true;
  }, [entitlements, licenseEmails]);

  const canContinue = isNameValid && isWhatsAppValid && allEmailsValid;

  useEffect(() => {
    const status = (sp.get("status") ?? "").trim();
    if (!status) return;

    setMpReturnStatus(status);

    const extFromQuery = (sp.get("external_reference") ?? "").trim();
    const extFromLS =
      typeof window !== "undefined"
        ? (localStorage.getItem("cyborgti:lastOrderId") ?? "").trim()
        : "";

    const ext = extFromQuery || extFromLS;
    setOrderId(ext || null);

    if (status === "failure") setOrderStatus("failed");
  }, [sp]);

  useEffect(() => {
    if (!orderId) return;
    if (!mpReturnStatus) return;
    if (mpReturnStatus === "failure") return;

    const oid = orderId;
    let alive = true;
    let tries = 0;

    async function tick() {
      try {
        if (!alive) return;
        setPolling(true);

        const r = await fetch(`/api/order/status?orderId=${encodeURIComponent(oid)}`, {
          cache: "no-store",
        });

        const raw = await r.text().catch(() => "");
        const data = safeJsonParse(raw);

        if (!alive) return;

        const st = (data?.status ?? null) as string | null;
        setOrderStatus(st);

        if (st === "paid" || st === "rejected" || st === "failed") return;

        tries += 1;
        if (tries >= 90) return;
        setTimeout(tick, 2000);
      } catch {
        if (!alive) return;
        tries += 1;
        if (tries >= 90) return;
        setTimeout(tick, 2500);
      } finally {
        if (alive) setPolling(false);
      }
    }

    tick();
    return () => {
      alive = false;
    };
  }, [orderId, mpReturnStatus]);

  async function handlePayMercadoPago() {
    if (!canContinue || paying) return;

    setPayError(null);
    setPaying(true);

    try {
      const mpItems = totals.lines.map((l) => ({
        title: l.title,
        unit_price: l.unitPricePEN,
        quantity: l.qty,
        currency_id: "PEN" as const,
      }));

      const newOrderId = `cyborgti_${Date.now()}`;
      setOrderId(newOrderId);

      if (typeof window !== "undefined") {
        localStorage.setItem("cyborgti:lastOrderId", newOrderId);
      }

      const metadata = {
        orderId: newOrderId,
        fullName: fullName.trim(),
        whatsApp: whatsApp.trim(),
        licenses: licenseEmails,
        entitlements,
        totals: {
          subtotalPEN: totals.subtotalPEN,
          totalPEN: totals.totalPEN,
          discounts: totals.discounts,
        },
        lines: totals.lines,
      };

      const res = await fetch("/api/mp/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: mpItems,
          external_reference: newOrderId,
          metadata,
        }),
      });

      const raw = await res.text().catch(() => "");
      const data = safeJsonParse(raw);

      const isProd = process.env.NODE_ENV === "production";
      const url = isProd
        ? data?.init_point ?? data?.sandbox_init_point
        : data?.sandbox_init_point ?? data?.init_point;

      if (!res.ok || !url) {
        // eslint-disable-next-line no-console
        console.error(
          "MP preference error:",
          `HTTP ${res.status} ${res.statusText}\nRAW:\n${raw || "(vacío)"}`
        );

        setPayError(
          `No se pudo iniciar el pago (HTTP ${res.status}). Respuesta: ${
            raw ? raw.slice(0, 200) : "vacía"
          }`
        );
        return;
      }

      window.location.href = url;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setPayError("Ocurrió un error al conectar con Mercado Pago.");
    } finally {
      setPaying(false);
    }
  }

  async function handleSubmitAfterPaid() {
    if (!orderId) return;
    if (orderStatus !== "paid") return;
    if (submitBusy) return;

    setSubmitMsg(null);
    setSubmitBusy(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        whatsApp: whatsApp.trim(),
        licenses: licenseEmails,
        entitlements,
        totals,
        lines: totals.lines,
      };

      const r = await fetch("/api/checkout/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, payload }),
      });

      const raw = await r.text().catch(() => "");
      const data = safeJsonParse(raw);

      if (!r.ok) {
        setSubmitMsg(data?.error ? String(data.error) : "No se pudo enviar.");
        return;
      }

      setSubmitMsg(data?.already ? "Ya fue enviado anteriormente ✅" : "Enviado ✅");
    } catch {
      setSubmitMsg("Error enviando formulario.");
    } finally {
      setSubmitBusy(false);
    }
  }

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

  const showReturnBox = !!mpReturnStatus;
  const paid = orderStatus === "paid";

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-border/60 bg-white/5 p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white/95">Resumen</h2>

        <div className="mt-4 space-y-3">
          {totals.lines.map((l) => {
            if (l.kind === "bundle") {
              return (
                <div key={`bundle-${l.promoId}`} className="border-b border-border/40 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white/90 font-semibold">{l.title}</div>
                      <div className="text-sm text-white/60">
                        Incluye: {l.includes.join(" + ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/90">{formatPEN(l.unitPricePEN)}</div>
                      <div className="text-sm text-white/60">{formatPEN(l.lineTotalPEN)}</div>
                    </div>
                  </div>
                </div>
              );
            }

            const hasDiscount = l.unitPricePEN < l.baseUnitPricePEN;

            return (
              <div
                key={l.slug}
                className="flex items-start justify-between gap-4 border-b border-border/40 pb-3"
              >
                <div>
                  <div className="text-white/90">{l.title}</div>
                  <div className="text-sm text-white/60">Cantidad: {l.qty}</div>
                </div>

                <div className="text-right">
                  {hasDiscount ? (
                    <>
                      <div className="text-xs text-white/50 line-through">
                        {formatPEN(l.baseUnitPricePEN)}
                      </div>
                      <div className="text-white/90">{formatPEN(l.unitPricePEN)}</div>
                    </>
                  ) : (
                    <div className="text-white/90">{formatPEN(l.unitPricePEN)}</div>
                  )}
                  <div className="text-sm text-white/60">{formatPEN(l.lineTotalPEN)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Subtotal</span>
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
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-2">
            <span className="text-white/80">Total</span>
            <span className="text-white font-semibold text-lg">{formatPEN(totals.totalPEN)}</span>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-border/60 bg-white/5 p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white/95">Datos para activar tu acceso</h2>

        <p className="mt-2 text-sm text-white/70">
          Ingresa tus datos y los correos de NetAcad por cada licencia (máximo 5 por curso).
        </p>

        {showReturnBox ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/90">Estado del pago</div>
            <div className="mt-2 text-sm text-white/70">
              Retorno MP: <span className="text-white/90">{mpReturnStatus}</span>
            </div>
            <div className="mt-1 text-sm text-white/70">
              Orden: <span className="text-white/90">{orderId ?? "—"}</span>
            </div>
            <div className="mt-1 text-sm text-white/70">
              Verificación:{" "}
              <span className="text-white/90">
                {orderStatus ?? (polling ? "verificando..." : "—")}
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-white/60">
              Nombres completos
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-brand-500/50"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-white/60">WhatsApp</label>
            <input
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
              placeholder="Ej: +51 999 999 999"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-brand-500/50"
            />
            <p className="mt-2 text-xs text-white/45">
              * Enviaremos por WhatsApp el link de clases grabadas.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/90">Licencias (NetAcad)</div>
          <p className="mt-2 text-sm text-white/70">
            Debe ser el correo con el que accedes a NetAcad. Puedes repetir correos si aplica.
          </p>

          <div className="mt-4 space-y-4">
            {Object.entries(entitlements).map(([slug, count]) => {
              const title = titleBySlug[slug] ?? slug;
              const emails = licenseEmails[slug] ?? [];
              const copyOn = !!copyAllBySlug[slug];

              return (
                <div key={slug} className="rounded-xl border border-white/10 bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/90">{title}</div>
                    <div className="text-xs text-white/50">
                      {count} licencia{count === 1 ? "" : "s"}
                    </div>
                  </div>

                  {count > 1 ? (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-white/45">Tip: activa para llenar más rápido.</span>

                      <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={copyOn}
                          onChange={(e) => {
                            const nextChecked = e.target.checked;

                            setCopyAllBySlug((prev) => ({ ...prev, [slug]: nextChecked }));

                            if (nextChecked) {
                              setLicenseEmails((prev) => {
                                const current = prev[slug]
                                  ? [...prev[slug]]
                                  : Array.from({ length: count }, () => "");
                                const first = (current[0] ?? "").trim();
                                const filled = current.map(() => first);
                                return { ...prev, [slug]: filled };
                              });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        Copiar Licencia 1 a todas
                      </label>
                    </div>
                  ) : null}

                  <div className="mt-3 space-y-2">
                    {Array.from({ length: count }).map((_, idx) => {
                      const value = emails[idx] ?? "";
                      const invalid = value.length > 0 && !isEmailValid(value);

                      return (
                        <div key={`${slug}-${idx}`}>
                          <label className="text-xs uppercase tracking-[0.25em] text-white/50">
                            Licencia {idx + 1} — correo NetAcad
                          </label>
                          <input
                            value={value}
                            onChange={(e) => {
                              const v = e.target.value;

                              setLicenseEmails((prev) => {
                                const current = prev[slug] ? [...prev[slug]] : [];
                                const nextArr = [...current];
                                nextArr[idx] = v;

                                if ((copyAllBySlug[slug] ?? false) && idx === 0) {
                                  for (let j = 1; j < count; j++) nextArr[j] = v;
                                }

                                return { ...prev, [slug]: nextArr };
                              });
                            }}
                            placeholder="Ej: tucorreo@dominio.com"
                            className={[
                              "mt-2 w-full rounded-xl border bg-black/25 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35",
                              invalid
                                ? "border-red-500/50 focus:border-red-500/60"
                                : "border-white/10 focus:border-brand-500/50",
                            ].join(" ")}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {count > 1 ? (
                    <p className="mt-3 text-[12px] text-white/45">
                      Si estás comprando para otras personas, coloca el correo de NetAcad de cada una.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/90">Pago</div>
          <p className="mt-2 text-sm text-white/70">
            Serás redirigido a Mercado Pago para completar tu compra.
          </p>

          {payError ? <p className="mt-3 text-xs text-red-300/90">{payError}</p> : null}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full bg-brand-500 hover:bg-brand-500/90 disabled:opacity-50"
            disabled={!canContinue || paying}
            title={!canContinue ? "Completa tus datos para continuar" : "Pagar con Mercado Pago"}
            onClick={handlePayMercadoPago}
          >
            {paying ? "Redirigiendo..." : "Pagar con Mercado Pago"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-brand-500/40 text-white hover:bg-brand-500/10 disabled:opacity-50"
            onClick={handleSubmitAfterPaid}
            disabled={!paid || submitBusy}
            title={!paid ? "Se habilita cuando el webhook confirme el pago" : "Enviar"}
          >
            {submitBusy ? "Enviando..." : "Enviar"}
          </Button>

          {submitMsg ? <p className="text-xs text-white/70">{submitMsg}</p> : null}

          <Button
            variant="outline"
            className="w-full border-brand-500/40 text-white hover:bg-brand-500/10"
            onClick={clear}
            disabled={paying}
          >
            Vaciar carrito
          </Button>

          <Link href="/carrito" className="block">
            <Button
              variant="outline"
              className="w-full border-white/15 text-white/90 hover:bg-white/5"
              disabled={paying}
            >
              Volver al carrito
            </Button>
          </Link>
        </div>

        {!canContinue ? (
          <p className="mt-3 text-xs text-white/45">
            Completa nombre, WhatsApp válido y todos los correos NetAcad por licencia para continuar.
          </p>
        ) : null}
      </aside>
    </section>
  );
}
