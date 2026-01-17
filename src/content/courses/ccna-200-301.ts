import type { CourseDTO } from "@/data/courses/schema";

const course: CourseDTO = {
  slug: "ccna-200-301",
  title: "CCNA 200-301 • Associate",
  shortDescription:
    "Acceso oficial Cisco NetAcad por 3 meses + 3 módulos CCNA (ITN, SRWE, ENSA).",
  longDescription:
    "Preparación completa para el examen internacional CCNA 200-301 con el roadmap oficial de Cisco NetAcad. Ideal para iniciar y construir bases sólidas en redes.",
  pricePEN: 200,
  level: "Inicial",
  durationWeeks: 6,
  includes: [
    "Acceso oficial por 3 meses (renovable sin perder avance).",
    "Certificados oficiales Cisco NetAcad.",
    "Insignias digitales.",
    "Voucher 58% de descuento para examen internacional CCNA 200-301.",
    "Clases grabadas (link compartido por WhatsApp).",
  ],
tags: ["Cisco", "Redes", "CCNA"],
  cover: "/cursos/ccna.png",
};

export default course;
