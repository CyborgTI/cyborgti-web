"use client";

import { FiShoppingCart } from "react-icons/fi";
import { useCartStore } from "@/features/cart/store";

export function AddIconToCart({ slug }: { slug: string }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      type="button"
      onClick={(e) => {
        // ✅ evita que un <Link> padre navegue
        e.preventDefault();
        e.stopPropagation();

        addItem(slug, 1);
      }}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/25 ring-1 ring-brand-500/40 transition-cyborg hover:bg-brand-500/35 hover:glow-brand-soft"
      aria-label="Agregar al carrito"
    >
      <FiShoppingCart className="text-white text-lg" />
    </button>
  );
}
