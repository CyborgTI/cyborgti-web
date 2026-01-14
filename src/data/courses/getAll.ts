import type { CourseDTO } from "./schema";
import { allCourses } from "@/content/courses/_index";

export function getAllCourses(): CourseDTO[] {
  return [...allCourses].sort((a, b) => a.title.localeCompare(b.title));
}
