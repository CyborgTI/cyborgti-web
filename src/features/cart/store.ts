"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartState } from "./types";

const STORAGE_KEY = "cyborgti-cart";
const MAX_QTY_PER_COURSE = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clampQty(qty: number) {
  const n = Math.floor(Number(qty) || 0);
  return Math.max(0, Math.min(MAX_QTY_PER_COURSE, n));
}

function normalizeItems(input: unknown): CartItem[] {
  if (!input) return [];

  // Forma actual: CartItem[]
  if (Array.isArray(input)) {
    return input
      .map((x: unknown) => {
        if (!isRecord(x)) return null;
        const slug = String(x.slug ?? "");
        const qty = clampQty(Number(x.qty ?? 0));
        return { slug, qty };
      })
      .filter((x): x is CartItem => !!x && x.slug.length > 0 && x.qty > 0);
  }

  // Formas antiguas: { items: [...] } o { cart: [...] }
  if (isRecord(input)) {
    const items = input.items;
    const cart = input.cart;

    if (Array.isArray(items)) return normalizeItems(items);
    if (Array.isArray(cart)) return normalizeItems(cart);
  }

  return [];
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (slug, qty = 1) => {
        const cleanSlug = String(slug);
        const addQty = Math.max(1, clampQty(qty)); // mínimo 1, máximo 5

        set((state) => {
          const found = state.items.find((i) => i.slug === cleanSlug);

          if (!found) {
            return { items: [...state.items, { slug: cleanSlug, qty: addQty }] };
          }

          const nextQty = clampQty(found.qty + addQty);
          // Si ya está en 5, se queda en 5
          return {
            items: state.items.map((i) =>
              i.slug === cleanSlug ? { ...i, qty: Math.max(1, nextQty) } : i
            ),
          };
        });
      },

      removeItem: (slug) => {
        const cleanSlug = String(slug);
        set((state) => ({ items: state.items.filter((i) => i.slug !== cleanSlug) }));
      },

      setQty: (slug, qty) => {
        const cleanSlug = String(slug);
        const nextQty = clampQty(qty);

        set((state) => {
          if (nextQty === 0) return { items: state.items.filter((i) => i.slug !== cleanSlug) };

          return {
            items: state.items.map((i) =>
              i.slug === cleanSlug ? { ...i, qty: nextQty } : i
            ),
          };
        });
      },

      clear: () => set({ items: [] }),

      setItems: (items) => set({ items: normalizeItems(items) }),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        if (isRecord(persistedState)) {
          const items = normalizeItems(
            (persistedState.items ?? persistedState.cart ?? persistedState) as unknown
          );
          return { ...persistedState, items };
        }
        return { items: [] };
      },
    }
  )
);
