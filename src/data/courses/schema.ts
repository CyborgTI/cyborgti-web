import { z } from "zod";

export const CourseSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  shortDescription: z.string().min(2),
  longDescription: z.string().min(2),

  pricePEN: z.number().int().nonnegative(),

  level: z.enum(["Inicial", "Intermedio", "Avanzado"]),
  durationWeeks: z.number().int().positive(),

  includes: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),

  cover: z.string().optional(),
});

export type CourseDTO = z.infer<typeof CourseSchema>;
export type CourseInput = z.input<typeof CourseSchema>;
