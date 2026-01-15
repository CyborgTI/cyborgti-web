// src/lib/email.ts
import { Resend } from "resend";

function getResendClient() {
  const key = (process.env.RESEND_API_KEY ?? "").trim();
  if (!key) return null;
  return new Resend(key);
}

function getEmailFrom() {
  // Soporta ambas vars (tú usas RESEND_FROM, pero si tienes EMAIL_FROM también vale)
  const from = (process.env.RESEND_FROM ?? process.env.EMAIL_FROM ?? "").trim();
  return from || "CyborgTI <onboarding@resend.dev>";
}

function getAppUrl() {
  const u = (process.env.APP_URL ?? "").trim();
  return u ? u.replace(/\/$/, "") : "https://cyborgti.com";
}

function escapeHtml(s: string) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPaymentApprovedEmailHtml(params: {
  fullName: string;
  orderId: string;
  courses: string[];
}) {
  const appUrl = getAppUrl();
  const logoUrl = `${appUrl}/logo/cyborgti.svg`;

  const safeName = escapeHtml(params.fullName?.trim() || "cliente");
  const safeOrderId = escapeHtml(params.orderId?.trim() || "N/A");
  const safeCourses = Array.isArray(params.courses) ? params.courses.filter(Boolean) : [];

  const coursesHtml = safeCourses.length
    ? `<ul style="margin:10px 0 0; padding-left:18px; color:#1f2937;">
        ${safeCourses.map((c) => `<li style="margin:6px 0;">${escapeHtml(String(c))}</li>`).join("")}
      </ul>`
    : `<p style="margin:10px 0 0; color:#6b7280;">(No se encontraron cursos en la orden)</p>`;

  const subjectLine = "Pago confirmado";

  return `
  <div style="background:#0b0f19; padding:24px 12px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid rgba(0,0,0,.08);">
      
      <div style="background:linear-gradient(135deg,#0ea5e9 0%,#7c3aed 55%,#111827 100%); padding:18px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="vertical-align:middle;">
              <img src="${logoUrl}" alt="CyborgTI" style="display:block; height:32px; width:auto;" />
            </td>
            <td style="vertical-align:middle; text-align:right;">
              <span style="display:inline-block; font-family:Arial,sans-serif; font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.85);">
                ${escapeHtml(subjectLine)}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:22px 20px; font-family:Arial,sans-serif; line-height:1.55;">
        <h2 style="margin:0 0 10px; font-size:18px; color:#111827;">
          Hola ${safeName},
        </h2>

        <p style="margin:0 0 14px; color:#374151;">
          Tu pago fue confirmado correctamente. Gracias por tu compra.
        </p>

        <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:14px 14px; margin:14px 0;">
          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.12em; margin-bottom:6px;">
            Detalle de la orden
          </div>
          <div style="color:#111827; font-size:14px;">
            <div><strong>Orden:</strong> ${safeOrderId}</div>
          </div>
        </div>

        <div style="margin-top:14px;">
          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.12em;">
            Cursos activados
          </div>
          ${coursesHtml}
        </div>

        <div style="margin-top:18px; padding:12px 14px; border-left:4px solid #7c3aed; background:#faf5ff; border-radius:10px;">
          <p style="margin:0; color:#4b5563; font-size:13px;">
            En breve recibirás la activación/acceso a tus cursos. Si necesitas ayuda, escríbenos por WhatsApp.
          </p>
        </div>

        <p style="margin:18px 0 0; color:#111827;">
          — Equipo CyborgTI
        </p>
      </div>

      <div style="background:#0b0f19; padding:16px 20px; font-family:Arial,sans-serif;">
        <div style="color:rgba(255,255,255,.78); font-size:12px; margin-bottom:10px;">
          Síguenos y contáctanos:
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="vertical-align:middle;">
              <a href="https://www.instagram.com/cyborg.ti/" style="color:#93c5fd; text-decoration:none; font-size:13px;">
                Instagram
              </a>
              <span style="color:rgba(255,255,255,.35); padding:0 10px;">•</span>
              <a href="https://www.facebook.com/CyborgTI" style="color:#93c5fd; text-decoration:none; font-size:13px;">
                Facebook
              </a>
              <span style="color:rgba(255,255,255,.35); padding:0 10px;">•</span>
              <a href="https://wa.me/51974126985" style="color:#93c5fd; text-decoration:none; font-size:13px;">
                WhatsApp
              </a>
            </td>
            <td style="vertical-align:middle; text-align:right;">
              <a href="${appUrl}" style="color:rgba(255,255,255,.7); text-decoration:none; font-size:12px;">
                ${escapeHtml(appUrl.replace(/^https?:\/\//, ""))}
              </a>
            </td>
          </tr>
        </table>

        <div style="margin-top:10px; color:rgba(255,255,255,.45); font-size:11px;">
          Este correo fue enviado automáticamente al confirmarse tu pago.
        </div>
      </div>

    </div>
  </div>
  `;
}

export async function sendPaymentApprovedEmail(params: {
  to: string;
  fullName: string;
  orderId: string;
  courses: string[];
}) {
  const resend = getResendClient();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing -> skip sendPaymentApprovedEmail", {
      to: params.to,
      orderId: params.orderId,
    });
    return { ok: false, skipped: true as const };
  }

  const to = (params.to ?? "").toString().trim();
  if (!to) {
    console.warn("[email] missing recipient -> skip sendPaymentApprovedEmail", {
      orderId: params.orderId,
    });
    return { ok: false, skipped: true as const };
  }

  const html = buildPaymentApprovedEmailHtml({
    fullName: params.fullName ?? "",
    orderId: params.orderId ?? "",
    courses: Array.isArray(params.courses) ? params.courses : [],
  });

  return resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "✅ Pago confirmado - CyborgTI",
    html,
  });
}
