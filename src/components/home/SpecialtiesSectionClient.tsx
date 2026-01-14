"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useAnimationFrame, type Variants } from "framer-motion";
import { FiZap } from "react-icons/fi";

import { AddIconToCart } from "@/components/course/AddIconToCart";
import { CourseMiniCard } from "@/components/course/CourseMiniCard";
import { formatPEN } from "@/lib/money";
import type { DisplayPrice } from "@/data/promos/applyPromo";

type CardUI = {
  slug: string;
  title: string;
  subtitle: string;
  cover: string;
  language: "Multilenguaje" | "Inglés";
  price: DisplayPrice;
};

const SPECIALTIES = ["CCNA", "CCNP", "CyberOps", "IT Essentials", "Python", "DevNet"] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function SpecialtiesSectionClient({ cards }: { cards: CardUI[] }) {
  return (
    <section className="w-full pt-12 pb-14">
      <MarqueeRow />

      <div className="mx-auto max-w-7xl px-4">
        {/* Título de sección (corto) */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Especialidades destacadas
          </h2>
          <div className="hidden sm:block h-px flex-1 bg-white/10" />
          <span className="hidden md:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Acceso oficial 3 meses
          </span>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map((c) => {
            const base = c.price.basePricePEN;
            const final = c.price.finalPricePEN;
            const hasDiscount = final < base;

            return (
              <motion.article
                key={c.slug}
                variants={cardItem}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group"
              >
                {/* Imagen */}
                <CourseMiniCard
                  href={`/cursos/${c.slug}`}
                  title={c.title}
                  cover={c.cover}
                  className="block"
                  cta=" "
                />

                {/* SOLO precio + carrito (sin textos extra) */}
                <div className="mt-4 flex items-end justify-between gap-4 px-1">
                  <div className="min-w-0">
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm text-white/40 line-through">{formatPEN(base)}</span>
                        <span className="text-sm font-semibold text-white/90">
                          {formatPEN(final)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-white/85">{formatPEN(base)}</div>
                    )}

                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/45">
                      Cisco NetAcad
                    </div>
                  </div>

                  <div className="shrink-0">
                    <AddIconToCart slug={c.slug} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/cursos"
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-10 py-3 text-sm font-semibold text-white shadow-brand transition-cyborg hover:glow-brand-soft"
          >
            Ver todos los cursos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function MarqueeRow() {
  const [contentWidth, setContentWidth] = useState(0);
  const [x, setX] = useState(0);

  const speed = 150;
  const base = useMemo(() => [...SPECIALTIES], []);

  useEffect(() => {
    const el = document.getElementById("cyborg-marquee-measure");
    if (!el) return;

    const update = () => setContentWidth(el.getBoundingClientRect().width);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!contentWidth) return;
    const px = (speed * delta) / 1000;

    setX((prev) => {
      const next = prev - px;
      return next <= -contentWidth ? 0 : next;
    });
  });

  return (
    <div className="relative w-full overflow-x-clip">
      <div className="relative left-1/2 w-[100vw] -translate-x-1/2 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-neutral-950 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-neutral-950 to-transparent" />

        <div className="border-y border-white/10 bg-white/[0.02]">
          <motion.div className="flex w-max items-center gap-10 py-3" style={{ x }}>
            <div id="cyborg-marquee-measure" className="flex items-center gap-10 pl-6">
              {base.map((t) => (
                <MarqueeItem key={`a-${t}`} label={t} />
              ))}
            </div>

            <div className="flex items-center gap-10 pr-6">
              {base.map((t) => (
                <MarqueeItem key={`b-${t}`} label={t} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MarqueeItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="select-none text-[34px] font-bold tracking-widest text-white/95 md:text-[52px]">
        {label}
      </span>
      <FiZap className="text-brand-500 text-2xl md:text-3xl" />
    </div>
  );
}
