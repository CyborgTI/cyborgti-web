// src/app/api/email/test/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(s: string) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBaseUrl(req: Request) {
  const env = (process.env.APP_URL ?? "").trim();
  if (env) return env.replace(/\/$/, "");

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function buildClientEmailHtml(
  req: Request,
  data: {
    orderId: string;
    fullName: string;
    whatsapp?: string;
    courses: string[];
    totalPEN?: number;
  }
) {
  const baseUrl = getBaseUrl(req);
  const logoUrl = `${baseUrl}/logo/cyborgti.svg`;

  const orderId = escapeHtml(data.orderId);
  const fullName = escapeHtml(data.fullName);
  const whatsapp = data.whatsapp ? escapeHtml(data.whatsapp) : "";
  const courses = data.courses ?? [];
  const total = typeof data.totalPEN === "number" ? `S/ ${data.totalPEN.toFixed(2)}` : "";

  const coursesHtml = courses.length
    ? courses
        .map(
          (c) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);color:#e5e7eb;font-size:14px;">
                ${escapeHtml(c)}
              </td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td style="padding:10px 0;color:#cbd5e1;font-size:14px;">—</td>
      </tr>
    `;

  const IG_URL = "https://www.instagram.com/cyborg.ti/";
  const FB_URL = "https://www.facebook.com/CyborgTI";
  const WA_URL = "https://wa.me/51974126985";

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>CyborgTI - Pago confirmado</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0f14;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#0f172a;border:1px solid rgba(255,255,255,.10);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:18px 20px;background:linear-gradient(135deg,rgba(34,197,94,.22),rgba(59,130,246,.18));border-bottom:1px solid rgba(255,255,255,.10);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" style="padding:0;">
                      <div style="color:#cbd5e1;font-size:12px;letter-spacing:.16em;text-transform:uppercase;">
                        CyborgTI
                      </div>
                      <div style="margin-top:8px;color:#ffffff;font-size:22px;font-weight:800;line-height:1.2;">
                        ✅ Pago confirmado
                      </div>
                      <div style="margin-top:6px;color:#cbd5e1;font-size:13px;line-height:1.5;">
                        Gracias por tu compra. Ya estamos procesando tu acceso.
                      </div>
                    </td>
                    <td align="right" valign="top" style="padding:0;">
                      <img
                        src="${logoUrl}"
                        width="44"
                        height="44"
                        alt="CyborgTI"
                        style="display:block;border:0;outline:none;text-decoration:none;opacity:.95"
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:0 0 10px 0;">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="background:#0b1224;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;">
                                        <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Orden</div>
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${orderId}</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <td style="width:12px;"></td>
                                <td style="padding:0 0 10px 0;">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="background:#0b1224;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;">
                                        <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Cliente</div>
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${fullName}</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:0;">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="background:#0b1224;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;">
                                        <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">WhatsApp</div>
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${
                                          whatsapp || "—"
                                        }</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <td style="width:12px;"></td>
                                <td style="padding:0;">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="background:#0b1224;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;">
                                        <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Total</div>
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${
                                          total || "—"
                                        }</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>

                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;background:#0b1224;border:1px solid rgba(255,255,255,.10);border-radius:12px;">
                  <tr>
                    <td style="padding:14px 14px 8px 14px;">
                      <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Cursos</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 14px 10px 14px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${coursesHtml}
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:#0b1224;border:1px solid rgba(255,255,255,.10);border-radius:12px;">
                  <tr>
                    <td style="padding:14px;">
                      <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Siguiente paso</div>
                      <div style="margin-top:8px;color:#e5e7eb;font-size:14px;line-height:1.6;">
                        Te contactaremos para activar tus accesos y confirmar las licencias.
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:14px;color:#94a3b8;font-size:12px;line-height:1.5;">
                  Si no reconoces esta compra, responde a este correo.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 20px;background:#0b0f14;border-top:1px solid rgba(255,255,255,.10);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#94a3b8;font-size:12px;line-height:1.5;">
                      © ${new Date().getFullYear()} CyborgTI
                    </td>
                    <td align="right" style="font-size:12px;line-height:1.5;">
                      <a href="${FB_URL}" style="color:#cbd5e1;text-decoration:none;margin-left:10px;">Facebook</a>
                      <a href="${IG_URL}" style="color:#cbd5e1;text-decoration:none;margin-left:10px;">Instagram</a>
                      <a href="${WA_URL}" style="color:#cbd5e1;text-decoration:none;margin-left:10px;">WhatsApp</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function GET(req: Request) {
  const key = (process.env.RESEND_API_KEY ?? "").trim();
  if (!key) return NextResponse.json({ ok: false, error: "Falta RESEND_API_KEY" }, { status: 500 });

  const from = (process.env.EMAIL_FROM ?? process.env.RESEND_FROM ?? "").trim();
  if (!from) {
    return NextResponse.json({ ok: false, error: "Falta EMAIL_FROM o RESEND_FROM" }, { status: 500 });
  }

  const url = new URL(req.url);
  const to = (url.searchParams.get("to") ?? "").trim() || (process.env.ADMIN_EMAIL ?? "").trim();
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Pasa ?to=tuemail o define ADMIN_EMAIL" },
      { status: 400 }
    );
  }

  const resend = new Resend(key);

  const html = buildClientEmailHtml(req, {
    orderId: "cyborgti_TEST_123456",
    fullName: "Juan Pérez",
    whatsapp: "+51 999 999 999",
    courses: ["CCNA 200-301", "CyberOps Associate"],
    totalPEN: 299,
  });

  const r = await resend.emails.send({
    from,
    to,
    subject: "🧪 TEST - Pago confirmado (CyborgTI)",
    html,
  });

  return NextResponse.json({ ok: true, result: r }, { status: 200 });
}
