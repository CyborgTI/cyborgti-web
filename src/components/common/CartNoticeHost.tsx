"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { useCartNoticeStore } from "@/features/cart/noticeStore";

export function CartNoticeHost() {
  const router = useRouter();
  const { open, title, href, nonce, kind, close } = useCartNoticeStore();

  // Para animación de entrada/salida sin librerías
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const closeAnimated = () => {
    setVisible(false);
    window.setTimeout(() => {
      close();
      setMounted(false);
    }, 180);
  };

  // Montaje + animación entrada cada vez que se dispara (nonce cambia)
  useEffect(() => {
    if (!open) return;

    setMounted(true);
    // siguiente tick para transición
    requestAnimationFrame(() => setVisible(true));
  }, [open, nonce]);

  // Auto-cierre
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeAnimated(), 4500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nonce]);

  if (!mounted) return null;

  const heading = kind === "promo" ? "Promoción agregada" : "Agregado al carrito";
  const subtitle = title?.trim()?.length ? title : "Listo para comprar cuando quieras.";

  const goCart = () => {
    closeAnimated();
    router.push(href || "/carrito");
  };

  return (
    <div
      className={[
        "fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2",
        "md:left-auto md:right-6 md:translate-x-0",
        "transition-all duration-200 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-white/10 bg-background/90 backdrop-blur shadow-2xl">
        <div className="flex gap-3 p-4">
          <FiCheckCircle className="mt-0.5 shrink-0 text-green-400" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{heading}</p>
            <p className="mt-1 truncate text-xs text-white/65">{subtitle}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={goCart}
                className="flex-1 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-black shadow-brand transition hover:brightness-110"
              >
                Ir al carrito
              </button>

              <button
                type="button"
                onClick={closeAnimated}
                className="flex-1 rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-xs text-white/80 transition hover:bg-white/5"
              >
                Seguir viendo
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAnimated}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/25 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
}
