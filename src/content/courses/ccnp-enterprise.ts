import type { CourseDTO } from "@/data/courses/schema";

const course: CourseDTO = {
  slug: "ccnp-enterprise",
  title: "CCNP Enterprise • Core & Advanced",
  shortDescription:
    "Acceso oficial Cisco NetAcad por 3 meses + módulos Core Networking y Advanced Routing.",
  longDescription:
    "Ruta oficial Cisco NetAcad para redes enterprise. Recomendado si ya dominas CCNA o tienes experiencia administrando redes.",
  pricePEN: 300,
  level: "Avanzado",
  durationWeeks: 8,
  includes: [
    "Acceso oficial por 3 meses (renovable sin perder avance).",
    "Certificados oficiales Cisco NetAcad.",
    "Insignias digitales.",
    "Voucher de descuento para examen internacional (según especialidad).",
    "Clases grabadas (link compartido por WhatsApp).",
  ],
tags: ["Cisco", "Enterprise", "CCNP"],
  cover: "/cursos/ccnp.png",
};

export default course;
