// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllCourses } from "@/data/courses/getAll";
import { getActivePromos } from "@/data/promos/getActivePromos";
import type { Promo } from "@/data/promos/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cyborgti.com";
  const now = new Date();

  // Rutas estáticas (siempre existen)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cursos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/promociones`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Cursos (siempre existen porque vienen del catálogo local)
  const courses = getAllCourses();
  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${base}/cursos/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Promos ACTIVAS (evita URLs que den 404)
  const activePromos: Promo[] = await getActivePromos();
  const promoRoutes: MetadataRoute.Sitemap = activePromos.map((p) => ({
    url: `${base}/promociones/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...promoRoutes];
}
