import type { CourseDTO } from "@/data/courses/schema";

const course: CourseDTO = {
  slug: "devnet",
  title: "Cisco DevNet • Associate",
  shortDescription:
    "Acceso oficial Cisco NetAcad por 3 meses + automatización, APIs y fundamentos DevNet.",
  longDescription:
    "Ruta oficial para automatización de redes y APIs. Ideal si apuntas a NetDevOps y productividad operando redes.",
  pricePEN: 200,
  level: "Intermedio",
  durationWeeks: 6,
  includes: [
    "Acceso oficial por 3 meses (renovable sin perder avance).",
    "Certificados oficiales Cisco NetAcad.",
    "Insignias digitales.",
    "Voucher de descuento para examen internacional (según especialidad).",
    "Clases grabadas (link compartido por WhatsApp).",
  ],
  tags: ["Cisco", "DevNet", "Automatización"],
  cover: "/cursos/devnet.png",
};

export default course;
