import type { Course } from "@/types/course";
import type { getActivePromos } from "@/data/promos/getActivePromos";
import { CourseCard } from "./CourseCard";

type ActivePromos = Awaited<ReturnType<typeof getActivePromos>>;

type Props = {
  courses: Course[];
  promos: ActivePromos;
};

export function CourseGrid({ courses, promos }: Props) {
  return (
    <div
      className="
        grid grid-cols-2 gap-3
        sm:grid-cols-2 sm:gap-5
        lg:grid-cols-3 lg:gap-6
      "
    >
      {courses.map((course) => (
        <div key={course.slug} className="min-w-0">
          <CourseCard course={course} promos={promos} />
        </div>
      ))}
    </div>
  );
}
