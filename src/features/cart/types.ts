export type CartItem = {
  slug: string;
  qty: number;
};

export type CartState = {
  items: CartItem[];

  addItem: (slug: string, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;

  /** Útil si quieres “hidratar” desde server selectors */
  setItems: (items: CartItem[]) => void;
};
