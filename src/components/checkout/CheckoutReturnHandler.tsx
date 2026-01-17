// src/components/checkout/CheckoutReturnHandler.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeJsonParse(raw: string | null) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type SubmitPayload = {
  fullName: string;
  email: string;
  whatsApp: string;
  licenses: Record<string, string[]>;
  entitlements: Record<string, number>;
  totals: any;
  lines: any;
};

export function CheckoutReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "").trim();
  const orderId = (searchParams.get("orderId") ?? "").trim();

  // ✅ Para no re-ejecutar por re-render
  const didRunRef = useRef(false);

  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cleanUrl = useMemo(() => {
    if (!orderId) return null;

    // ✅ dejamos solo status + orderId (limpia el chorizo de query params de MP)
    const safeStatus = status || "success";
    return `/checkout?status=${encodeURIComponent(safeStatus)}&orderId=${encodeURIComponent(
      orderId
    )}`;
  }, [orderId, status]);

  useEffect(() => {
    if (!orderId) return;

    // ✅ Limpia la URL apenas se pueda (sin recargar)
    if (cleanUrl) {
      const current = window.location.pathname + window.location.search;
      if (current !== cleanUrl) router.replace(cleanUrl);
    }

    // ✅ Solo submit cuando SUCCESS
    if (status !== "success") return;

    // ✅ Evita doble submit
    if (didRunRef.current) return;
    didRunRef.current = true;

    (async () => {
      try {
        setSubmitting(true);
        setMessage("Procesando tu compra…");

        // 🔹 Recuperamos lo que se guardó antes de ir a Mercado Pago
        const rawPayload =
          typeof window !== "undefined"
            ? localStorage.getItem("cyborgti:checkoutPayload")
            : null;

        const payload = (safeJsonParse(rawPayload) ?? {
          fullName: "",
          email: "",
          whatsApp: "",
          licenses: {},
          entitlements: {},
          totals: null,
          lines: null,
        }) as SubmitPayload;

        const res = await fetch("/api/checkout/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            payload,
          }),
        });

        const text = await res.text().catch(() => "");
        const data = safeJsonParse(text);

        // 409 = aún no está pagado (webhook puede demorarse)
        if (res.status === 409) {
          setMessage(
            "✅ Recibimos tu retorno de pago. Estamos esperando confirmación (puede tardar unos segundos)."
          );
          return;
        }

        if (!res.ok) {
          setMessage(
            `Pago recibido, pero hubo un problema registrando tus datos. ${
              data?.error ? String(data.error) : ""
            }`
          );
          return;
        }

        // Limpieza opcional
        if (typeof window !== "undefined") {
          localStorage.removeItem("cyborgti:checkoutPayload");
        }

        setMessage(
          "✅ Pago confirmado. Te hemos enviado un correo con los detalles de tu compra."
        );
      } catch {
        setMessage("Pago recibido, pero ocurrió un error interno. Contáctanos por WhatsApp.");
      } finally {
        setSubmitting(false);
      }
    })();
  }, [orderId, status, cleanUrl, router]);

  if (!orderId) return null;

  // 🔹 SUCCESS
  if (status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-sm font-semibold text-white/95">Resultado del pago</div>
        <div className="mt-1 text-xs text-white/60">
          Orden: <span className="text-white/90">{orderId}</span>
        </div>
        <div className="mt-3 text-sm text-white/80">
          {message ?? (submitting ? "Procesando…" : "✅ Pago recibido.")}
        </div>
      </div>
    );
  }

  // 🔹 PENDING
  if (status === "pending") {
    return (
      <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-sm font-semibold text-white/95">Pago pendiente</div>
        <div className="mt-1 text-xs text-white/60">
          Orden: <span className="text-white/90">{orderId}</span>
        </div>
        <div className="mt-3 text-sm text-white/70">
          Cuando se confirme el pago, recibirás un correo automáticamente.
        </div>
      </div>
    );
  }

  // 🔹 FAILURE
  if (status === "failure") {
    return (
      <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
        <div className="text-sm font-semibold text-white/95">Pago rechazado</div>
        <div className="mt-1 text-xs text-white/60">
          Orden: <span className="text-white/90">{orderId}</span>
        </div>
        <div className="mt-3 text-sm text-white/70">
          Intenta nuevamente o contáctanos para ayudarte.
        </div>
      </div>
    );
  }

  return null;
}
