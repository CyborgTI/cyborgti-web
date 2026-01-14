// src/lib/email.ts
import { Resend } from "resend";

function getResendClient() {
  const key = (process.env.RESEND_API_KEY ?? "").trim();
  if (!key) return null;
  return new Resend(key);
}

function getEmailFrom() {
  const from = (process.env.EMAIL_FROM ?? "").trim();
  // Fallback seguro (Resend permite onboarding@resend.dev sin dominio verificado)
  return from || "CyborgTI <onboarding@resend.dev>";
}

export async function sendPaymentApprovedEmail(params: {
  to: string;
  fullName: string;
  orderId: string;
  courses: string[];
}) {
  const { to, fullName, orderId, courses } = params;

  const resend = getResendClient();

  // ✅ No romper build / no romper webhook si falta env (solo log)
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing -> skip sendPaymentApprovedEmail", {
      to,
      orderId,
    });
    return { ok: false, skipped: true };
  }

  // Sanitiza datos mínimos
  const safeName = (fullName ?? "").toString().trim() || "cliente";
  const safeOrderId = (orderId ?? "").toString().trim() || "N/A";
  const safeCourses = Array.isArray(courses) ? courses.filter(Boolean) : [];

  return resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "✅ Pago confirmado - CyborgTI",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hola ${safeName},</h2>

        <p>Tu pago fue confirmado correctamente.</p>

        <p><strong>Orden:</strong> ${safeOrderId}</p>

        <p><strong>Cursos activados:</strong></p>
        ${
          safeCourses.length
            ? `<ul>${safeCourses.map((c) => `<li>${String(c)}</li>`).join("")}</ul>`
            : `<p>(No se encontraron cursos en la orden)</p>`
        }

        <p>En breve recibirás el acceso a tus cursos.</p>

        <p>— Equipo CyborgTI</p>
      </div>
    `,
  });
}
