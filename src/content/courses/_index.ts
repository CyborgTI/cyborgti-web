import type { CourseDTO } from "@/data/courses/schema";

import ccna from "./ccna-200-301";
import ccnp from "./ccnp-enterprise";
import cyberops from "./cyberops-associate";
import devnet from "./devnet";
import itess from "./it-essentials";
import python from "./python-fundamentos";

export const allCourses: CourseDTO[] = [ccna, ccnp, cyberops, devnet, itess, python];
