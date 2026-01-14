import { getAllCourses } from "./getAll";

export function getCourseBySlug(slug: string) {
  return getAllCourses().find((c) => c.slug === slug) ?? null;
}
