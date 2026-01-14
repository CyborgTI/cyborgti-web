"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/store";
import { useCartNoticeStore } from "@/features/cart/noticeStore";
import { Button } from "@/components/ui/button";
import { FiShoppingCart } from "react-icons/fi";

export function AddPromoToCartButton({
  slugs,
  redirectTo = "/carrito",
  label = "Comprar promoción",
}: {
  slugs: string[];
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const showNotice = useCartNoticeStore((s) => s.show);

  const validSlugs = useMemo(
    () => (Array.isArray(slugs) ? slugs.map(String).filter(Boolean) : []),
    [slugs]
  );

  const alreadyCount = useMemo(() => {
    const set = new Set(validSlugs);
    return items.filter((i) => set.has(i.slug)).length;
  }, [items, validSlugs]);

  const addMany = () => {
    if (validSlugs.length === 0) return;

    // ✅ PRO (como pidió el usuario): si clickea varias veces, suma más.
    validSlugs.forEach((slug) => addItem(slug, 1));

    // ✅ si rediriges, no toast
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    showNotice({
      kind: "promo",
      title:
        alreadyCount > 0
          ? `${label} • cantidad actualizada en el carrito`
          : `${label} agregada al carrito`,
      href: "/carrito",
    });
  };

  const primaryLabel = alreadyCount > 0 ? "AÑADIR OTRA" : label;

  return (
    <Button onClick={addMany} className="bg-brand-500 hover:bg-brand-500/90">
      <FiShoppingCart className="mr-2 h-4 w-4" />
      {primaryLabel}
    </Button>
  );
}
