import type { CourseDTO } from "@/data/courses/schema";

const course: CourseDTO = {
  slug: "cyberops-associate",
  title: "Cisco CyberOps Associate",
  shortDescription:
    "Acceso oficial Cisco NetAcad por 3 meses + base SOC para monitoreo, detección y respuesta.",
  longDescription:
    "Enfoque práctico orientado a rol SOC: detección, análisis y respuesta a incidentes con la ruta oficial de Cisco NetAcad.",
  pricePEN: 200,
  level: "Intermedio",
  durationWeeks: 6,
  includes: [
    "Acceso oficial por 3 meses (renovable sin perder avance).",
    "Certificados oficiales Cisco NetAcad.",
    "Insignias digitales.",
    "Voucher de descuento para examen internacional CyberOps 200-201.",
    "Clases grabadas (link compartido por WhatsApp).",
  ],
  tags: ["Ciberseguridad", "SOC", "CyberOps", "Multilenguaje"],
  cover: "/cursos/cyberops.png",
};

export default course;
