import type { CourseDTO } from "@/data/courses/schema";

const course: CourseDTO = {
  slug: "it-essentials",
  title: "IT Essentials • v7 & v8",
  shortDescription:
    "Acceso oficial Cisco NetAcad por 3 meses + IT Essentials v7 y v8 (soporte TI y troubleshooting).",
  longDescription:
    "Base sólida para iniciar en TI con la ruta oficial de Cisco NetAcad. Ideal para soporte técnico / helpdesk.",
  pricePEN: 200,
  level: "Inicial",
  durationWeeks: 5,
  includes: [
    "Acceso oficial por 3 meses (renovable sin perder avance).",
    "Certificados oficiales Cisco NetAcad.",
    "Insignias digitales.",
    "Voucher de descuento para examen internacional (según especialidad).",
    "Clases grabadas (link compartido por WhatsApp).",
  ],
  tags: ["Soporte", "IT", "Fundamentos"],
  cover: "/cursos/it_essentials.png",
};

export default course;
