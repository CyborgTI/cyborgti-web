export type CourseLevel = "Inicial" | "Intermedio" | "Avanzado";

export type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;

  pricePEN: number;

  level: CourseLevel;
  durationWeeks: number;

  includes: string[];
  tags: string[];

  cover?: string; // luego: /images/courses/xxx.jpg
};
