import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getActivePromos } from "@/data/promos/getActivePromos";
import { getCourseBySlug } from "@/data/courses/getBySlug";

import { DetailShell } from "@/components/detail/DetailShell";
import { PromoBuyPanel } from "@/components/promo/PromoBuyPanel";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailSection } from "@/components/detail/DetailSection";
import { CourseMiniCard } from "@/components/course/CourseMiniCard";
import { PromoMetaBadges } from "@/components/promo/PromoMetaBadges";

export const revalidate = 60;

const BASE_URL = "https://cyborgti.com";
const SITE_NAME = "CyborgTI";
const DEFAULT_OG = "/opengraph-image.png";

function uniqueStrings(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const v = String(x ?? "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function trimToMeta(s: string, max = 155) {
  const v = String(s ?? "").replace(/\s+/g, " ").trim();
  if (!v) return "";
  return v.length > max ? `${v.slice(0, max - 1).trim()}…` : v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const promos = await getActivePromos();
  const promo = promos.find((p) => p.id === id);

  if (!promo) {
    return {
      title: "Promoción no encontrada | CyborgTI",
      robots: { index: false, follow: false },
    };
  }

  const title = `${promo.title} | ${SITE_NAME}`;
  const description = trimToMeta(
    promo.subtitle ||
      "Promoción por tiempo limitado. Accede a más de una especialidad con precio especial."
  );

  const url = `${BASE_URL}/promociones/${promo.id}`;
  const image = promo.image || DEFAULT_OG;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: "es_PE",
      images: [{ url: image, width: 1200, height: 630, alt: promo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PromoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const promos = await getActivePromos();
  const promo = promos.find((p) => p.id === id) ?? null;

  if (!promo) return notFound();
  if (promo.type !== "bundle") return notFound();
  if (!promo.href) return notFound();

  const slugs = promo.courses ?? [];
  if (!slugs.length) return notFound();

  const courses = slugs
    .map((slug) => ({ slug, course: getCourseBySlug(slug) }))
    .filter(
      (x): x is { slug: string; course: NonNullable<ReturnType<typeof getCourseBySlug>> } =>
        !!x.course
    );

  if (!courses.length) return notFound();

  const mergedIncludes = uniqueStrings(courses.flatMap((c) => c.course.includes ?? []));
  const packExtras = uniqueStrings([
    "Precio único por bundle (mejor que comprar por separado)",
    "Acceso inmediato al contenido al completar el pago",
  ]);
  const includes = uniqueStrings([...mergedIncludes, ...packExtras]);

  // JSON-LD para Bundle (Offer) + ItemList (cursos incluidos)
  const bundleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: promo.title,
    url: `${BASE_URL}/promociones/${promo.id}`,
    priceCurrency: "PEN",
    price: String(promo.bundlePricePEN),
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: "https://www.facebook.com/CyborgTI",
      url: BASE_URL,
    },
    itemOffered: {
      "@type": "ItemList",
      itemListElement: courses.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${BASE_URL}/cursos/${c.slug}`,
        name: c.course.title,
      })),
    },
  };

  return (
    <DetailShell backHref="/promociones" backLabel="Volver a promociones">
      {/* JSON-LD */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://cyborgti.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Promociones",
          item: "https://cyborgti.com/promociones",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: promo.title,
          item: `https://cyborgti.com/promociones/${promo.id}`,
        },
      ],
    }),
  }}
/>


      <DetailHeader
        badges={
          <PromoMetaBadges
            type="Bundle"
            activeFrom={promo.activeFrom}
            activeTo={promo.activeTo}
            coursesCount={slugs.length}
            extraBadge={promo.badge ?? null}
          />
        }
        title={promo.title}
        subtitle={
          promo.subtitle ??
          "Llévate más de una especialidad con un precio único por tiempo limitado."
        }
      />

      <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* CONTENIDO */}
        <div className="min-w-0 space-y-10">
          <DetailSection
            kicker="INCLUYE"
            kickerClassName="text-[11px] uppercase tracking-[0.35em] text-brand-500"
          >
            <ul className="grid gap-3 text-sm text-white/70">
              {includes.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-brand-500/70" />
                  <span className="flex-1">{x}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection kicker="CURSOS INCLUIDOS">
            <div className="grid gap-5 sm:grid-cols-2">
              {courses.map(({ slug, course }) => (
                <CourseMiniCard
                  key={slug}
                  href={`/cursos/${slug}`}
                  title={course.title}
                  cover={course.cover ?? null}
                />
              ))}
            </div>
          </DetailSection>
        </div>

        {/* CHECKOUT */}
        <PromoBuyPanel pricePEN={promo.bundlePricePEN} slugs={slugs} />
      </section>
    </DetailShell>
  );
}
