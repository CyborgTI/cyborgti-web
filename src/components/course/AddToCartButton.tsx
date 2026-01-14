"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store";
import { useCartNoticeStore } from "@/features/cart/noticeStore";
import { FiMinus, FiPlus, FiShoppingCart, FiShare2 } from "react-icons/fi";

const MAX_QTY_PER_COURSE = 5;

function clampQty(n: number) {
  const v = Math.floor(Number(n) || 0);
  return Math.max(1, Math.min(MAX_QTY_PER_COURSE, v));
}

export function AddToCartButton({
  slug,
  title,
  redirectTo,
  label = "ADQUIRIR",
  showShare = true,
  variant = "default",
}: {
  slug: string;
  title?: string;
  redirectTo?: string;
  label?: string;
  showShare?: boolean;
  variant?: "default" | "ecom";
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const showNotice = useCartNoticeStore((s) => s.show);

  const [qty, setQty] = useState(1);

  const inCartQty = useMemo(() => {
    const found = items.find((i) => i.slug === slug);
    return found?.qty ?? 0;
  }, [items, slug]);

  // Cuánto falta para llegar al máximo
  const availableToAdd = useMemo(() => {
    return Math.max(0, MAX_QTY_PER_COURSE - inCartQty);
  }, [inCartQty]);

  // En el selector local, no dejes elegir más de lo que falta (ni más de 5)
  const maxSelectable = useMemo(() => {
    // Si ya tiene 5, igual mostramos 1 como selector mínimo (pero no se podrá agregar)
    return Math.max(1, Math.min(MAX_QTY_PER_COURSE, availableToAdd));
  }, [availableToAdd]);

  const safeQty = useMemo(() => {
    // qty nunca puede exceder lo que falta para llegar a 5
    return Math.min(clampQty(qty), maxSelectable);
  }, [qty, maxSelectable]);

  const atMax = inCartQty >= MAX_QTY_PER_COURSE;
  const incDisabled = safeQty >= maxSelectable || atMax;
  const decDisabled = safeQty <= 1;

  const onAdd = () => {
    if (atMax || availableToAdd <= 0) {
      const name = title?.trim() ? title : "Curso";
      showNotice({
        kind: "course",
        title: `${name} • ya alcanzaste el máximo (${MAX_QTY_PER_COURSE})`,
        href: "/carrito",
      });
      return;
    }

    // Solo agrega lo permitido
    const qtyToAdd = Math.min(safeQty, availableToAdd);

    addItem(slug, qtyToAdd);

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    const name = title?.trim() ? title : "Curso";
    showNotice({
      kind: "course",
      title:
        inCartQty > 0
          ? `${name} • cantidad actualizada en el carrito`
          : `${name} agregado al carrito`,
      href: "/carrito",
    });
  };

  const onShare = async () => {
    const url = window.location.href;
    const shareTitle = title ?? "CyborgTI";

    const nav = navigator as Navigator & {
      share?: (data: { title?: string; url?: string; text?: string }) => Promise<void>;
    };

    try {
      if (typeof nav.share === "function") {
        await nav.share({ title: shareTitle, url });
        return;
      }
    } catch {
      // noop
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // noop
    }
  };

  const isEcom = variant === "ecom";
  const primaryLabel = inCartQty > 0 ? "AÑADIR OTRA" : label;

  if (!isEcom) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-[11px] uppercase tracking-[0.35em] text-white/55">LICENCIAS</div>

          <div className="flex items-center gap-2">
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-brand-500/30 bg-black/30 text-white/80 transition-cyborg hover:bg-brand-500/10 disabled:opacity-40 disabled:hover:bg-black/30"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Disminuir"
              type="button"
              disabled={decDisabled}
              title={decDisabled ? "Mínimo 1" : "Disminuir"}
            >
              <FiMinus />
            </button>

            <div className="min-w-6 text-center text-white">{safeQty}</div>

            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-brand-500/30 bg-black/30 text-white/80 transition-cyborg hover:bg-brand-500/10 disabled:opacity-40 disabled:hover:bg-black/30"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Aumentar"
              type="button"
              disabled={incDisabled}
              title={atMax ? `Máximo ${MAX_QTY_PER_COURSE}` : "Aumentar"}
            >
              <FiPlus />
            </button>
          </div>

          <div className="ml-2 hidden text-[11px] text-white/50 md:block">
            {atMax
              ? `Ya tienes ${MAX_QTY_PER_COURSE} en el carrito`
              : inCartQty > 0
                ? `En carrito: ${inCartQty} • máx ${MAX_QTY_PER_COURSE}`
                : `Máx ${MAX_QTY_PER_COURSE} por curso`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="bg-brand-500 shadow-brand hover:glow-brand-soft flex items-center gap-2 disabled:opacity-50"
            onClick={onAdd}
            disabled={atMax}
            title={atMax ? `Máximo ${MAX_QTY_PER_COURSE} licencias por curso` : "Agregar al carrito"}
          >
            {primaryLabel} <FiShoppingCart />
          </Button>

          {showShare ? (
            <button
              onClick={onShare}
              type="button"
              className="inline-flex items-center gap-2 text-xs text-white/55 transition-cyborg hover:text-white/80"
              aria-label="Compartir"
              title="Compartir"
            >
              <FiShare2 /> SHARE
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.35em] text-white/55">LICENCIAS</div>

        <div className="flex items-center gap-2">
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/25 text-white/85 transition-cyborg hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/25"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Disminuir"
            type="button"
            disabled={decDisabled}
            title={decDisabled ? "Mínimo 1" : "Disminuir"}
          >
            <FiMinus />
          </button>

          <div className="min-w-6 text-center text-white">{safeQty}</div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/25 text-white/85 transition-cyborg hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/25"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Aumentar"
            type="button"
            disabled={incDisabled}
            title={atMax ? `Máximo ${MAX_QTY_PER_COURSE}` : "Aumentar"}
          >
            <FiPlus />
          </button>
        </div>
      </div>

      {inCartQty > 0 ? (
        <div className="mt-2 text-xs text-white/55">
          {atMax
            ? `Ya tienes ${MAX_QTY_PER_COURSE} en el carrito (máximo).`
            : `Ya tienes ${inCartQty} en el carrito • máximo ${MAX_QTY_PER_COURSE}.`}
        </div>
      ) : (
        <div className="mt-2 text-xs text-white/45">Máximo {MAX_QTY_PER_COURSE} licencias por curso.</div>
      )}

      <Button
        className="mt-4 w-full h-12 bg-brand-500 shadow-brand hover:glow-brand-soft flex items-center justify-center gap-2 text-base disabled:opacity-50"
        onClick={onAdd}
        disabled={atMax}
        title={atMax ? `Máximo ${MAX_QTY_PER_COURSE} licencias por curso` : "Agregar al carrito"}
      >
        {primaryLabel} <FiShoppingCart />
      </Button>
    </div>
  );
}
