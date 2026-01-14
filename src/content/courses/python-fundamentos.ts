import type { CourseDTO } from "@/data/courses/schema";

const course: CourseDTO = {
  slug: "python-fundamentos",
  title: "Python • Essentials I & II",
  shortDescription:
    "Acceso oficial Cisco NetAcad por 3 meses + Python Essentials I y II.",
  longDescription:
    "Aprende Python desde cero con la ruta oficial. Ideal para automatización, scripts y base para DevNet/NetDevOps.",
  pricePEN: 180,
  level: "Inicial",
  durationWeeks: 5,
  includes: [
    "Acceso oficial por 3 meses (renovable sin perder avance).",
    "Certificados oficiales Cisco NetAcad.",
    "Insignias digitales.",
    "Voucher de descuento para examen internacional (según especialidad).",
    "Clases grabadas (link compartido por WhatsApp).",
  ],
  tags: ["Python", "Programación", "Automatización"],
  cover: "/cursos/python.png",
};

export default course;
