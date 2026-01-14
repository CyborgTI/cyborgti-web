"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { useCartStore } from "@/features/cart/store";
import { cartCount } from "@/features/cart/selectors";

const NAV_LINKS = [
  { href: "/cursos", label: "Todos los cursos" },
  { href: "/promociones", label: "Promociones" },
] as const;

const PAY_LOGOS = [
  { src: "/pagos/visa.svg", alt: "Visa" },
  { src: "/pagos/mastercard.svg", alt: "Mastercard" },
  { src: "/pagos/yape.svg", alt: "Yape" },
  { src: "/pagos/googlepay.svg", alt: "Google Pay" },
] as const;

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function Navbar() {
  const items = useCartStore((s) => s.items);
  const count = useMemo(() => cartCount(items), [items]);

  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ✅ altura real del ticker (banner)
  const [tickerH, setTickerH] = useState(0);
  // ✅ cuando ya pasaste el ticker con scroll => navbar sube a top-0
  const [pastTicker, setPastTicker] = useState(false);

  // micro-interacción: pulse cuando el carrito aumenta
  const prevCountRef = useRef<number>(count);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (count > prev) {
      setCartPulse(true);
      const t = window.setTimeout(() => setCartPulse(false), 260);
      return () => window.clearTimeout(t);
    }
  }, [count]);

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const openBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // ✅ medir ticker + escuchar cambios de tamaño (si cambia texto/alto)
  useEffect(() => {
    const el = document.getElementById("top-ticker");
    if (!el) {
      setTickerH(0);
      return;
    }

    const update = () => setTickerH(el.getBoundingClientRect().height || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ✅ scroll: compactar navbar + detectar si ya pasaste el ticker
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // cuando el scroll pasa la altura del ticker, el navbar sube a top 0
      setPastTicker(y >= Math.max(0, tickerH - 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tickerH]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll cuando menú está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => closeBtnRef.current?.focus());
  }, [open]);

  // ESC para cerrar
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        openBtnRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const headerH = scrolled ? 72 : 84;

  // ✅ top dinámico: debajo del ticker al inicio, luego top-0
  const topOffset = pastTicker ? 0 : tickerH;

  return (
    <>
      <header
        className={cx(
          "fixed left-0 right-0 z-[70] w-full border-b border-white/10 backdrop-blur",
          "transition-[top] duration-200 ease-out",
          scrolled
            ? "bg-neutral-950/80 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            : "bg-neutral-950/70"
        )}
        style={{ top: topOffset }}
      >
        <div
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 ease-out"
          style={{ height: headerH }}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center" aria-label="Ir al inicio">
            <span className="relative block h-10 w-[180px] md:h-11 md:w-[210px] overflow-visible">
              <Image
                src="/logo/cyborgti.svg"
                alt="CyborgTI"
                fill
                priority
                sizes="(max-width: 768px) 180px, 210px"
                className={cx(
                  "pointer-events-none object-contain object-left select-none origin-left transition-transform duration-300 ease-out",
                  scrolled ? "scale-[2.75] md:scale-[4.15]" : "scale-[3.0] md:scale-[4.55]"
                )}
              />
            </span>
          </Link>

          {/* Center: Aceptamos (desktop) */}
          <div className="hidden items-center justify-center md:flex">
            <div
              className={cx(
                "flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4",
                scrolled ? "py-1.5" : "py-2"
              )}
            >
              <span className="text-xs text-white/70">Aceptamos</span>
              <div className="flex items-center gap-2">
                {PAY_LOGOS.map((p) => (
                  <span
                    key={p.src}
                    className={cx(
                      "relative inline-flex items-center justify-center rounded-full bg-white/95 ring-1 ring-black/10",
                      scrolled ? "h-6 w-6" : "h-7 w-7"
                    )}
                    title={p.alt}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      className="p-1.5 object-contain"
                      sizes="28px"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 md:gap-5">
            <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación">
              {NAV_LINKS.map((l) => {
                const active = pathname?.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cx(
                      "transition-cyborg",
                      active ? "text-white" : "text-white/70 hover:text-white"
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <motion.div
              animate={cartPulse ? { scale: 1.06 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
              className="relative"
            >
              <Link
                href="/carrito"
                className={cx(
                  "relative inline-flex h-14 w-14 items-center justify-center rounded-xl",
                  "bg-brand-500/25 ring-1 ring-brand-500/40 transition-cyborg",
                  "hover:bg-brand-500/35 hover:glow-brand-soft"
                )}
                aria-label="Carrito"
              >
                <FiShoppingCart className="text-white text-2xl" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.6, opacity: 0, y: -2 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 700, damping: 22 }}
                      className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white shadow-brand"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            <button
              ref={openBtnRef}
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90 transition-cyborg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="mobile-menu-fullscreen"
            >
              <FiMenu className="text-2xl" />
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Spacer: evita que el navbar fixed tape el contenido */}
      <div aria-hidden="true" style={{ height: headerH }} />

      {/* FULLSCREEN MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu-fullscreen"
            className="fixed inset-0 z-[9999] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-neutral-950"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_0%,rgba(29,0,209,0.22),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_30%)]" />
            </div>

            <motion.div
              className="relative flex h-full flex-col"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              id="mobile-menu-fullscreen"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div className="flex flex-col">
                  <span className="text-xs tracking-[0.35em] text-white/70">MENÚ</span>
                  <span className="mt-1 text-[11px] text-white/40">CyborgTI</span>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openBtnRef.current?.focus();
                  }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-white/90 transition-cyborg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  aria-label="Cerrar menú"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-thin">
                <motion.nav
                  className="flex flex-col gap-3"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
                  }}
                  aria-label="Navegación móvil"
                >
                  {NAV_LINKS.map((l) => {
                    const active = pathname?.startsWith(l.href);
                    return (
                      <motion.div
                        key={l.href}
                        variants={{
                          hidden: { y: 12, opacity: 0 },
                          show: { y: 0, opacity: 1, transition: { duration: 0.25 } },
                        }}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className={cx(
                            "group relative flex items-center justify-between rounded-2xl px-5 py-4 ring-1 transition-cyborg",
                            active
                              ? "bg-white/10 ring-white/15 text-white"
                              : "bg-white/5 ring-white/10 text-white/90 hover:bg-white/10"
                          )}
                        >
                          <span className="text-[18px] font-medium tracking-wide">{l.label}</span>
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/30 ring-1 ring-white/10 transition-cyborg group-hover:bg-black/40" aria-hidden="true">
                            <span className="text-white/60 text-xl">›</span>
                          </span>
                          <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-cyborg glow-brand-soft" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                <div className="mt-7 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-[0.25em] text-white/60">ACEPTAMOS</span>
                    <span className="text-xs text-white/35">Pagos</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {PAY_LOGOS.map((p) => (
                      <span
                        key={p.src}
                        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-black/10"
                        title={p.alt}
                      >
                        <Image src={p.src} alt={p.alt} fill className="p-2 object-contain" sizes="48px" />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <Link
                    href="/cursos"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-2xl bg-brand-500/30 ring-1 ring-brand-500/40 px-5 py-4 text-white font-semibold transition-cyborg hover:bg-brand-500/38 hover:glow-brand-soft focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  >
                    Ver cursos
                  </Link>
                </div>

                <div className="h-10" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
