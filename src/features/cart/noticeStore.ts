"use client";

import { create } from "zustand";

type CartNoticeKind = "course" | "promo";

type CartNoticeState = {
  open: boolean;
  kind: CartNoticeKind;
  title?: string;
  href?: string;
  nonce: number;

  show: (payload: { kind?: CartNoticeKind; title?: string; href?: string }) => void;
  close: () => void;
};

export const useCartNoticeStore = create<CartNoticeState>((set) => ({
  open: false,
  kind: "course",
  title: undefined,
  href: "/carrito",
  nonce: 0,

  show: ({ kind = "course", title, href = "/carrito" }) =>
    set((s) => ({
      open: true,
      kind,
      title,
      href,
      nonce: s.nonce + 1,
    })),

  close: () => set({ open: false }),
}));
