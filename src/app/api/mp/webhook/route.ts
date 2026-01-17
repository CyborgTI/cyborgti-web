// src/app/api/mp/webhook/route.ts
export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

function getResendClient() {
  const key = (process.env.RESEND_API_KEY ?? "").trim();
  if (!key) return null;
  return new Resend(key);
}

function parseXSignature(xSignature: string) {
  const parts = xSignature.split(",").map((p) => p.trim());
  let ts = "";
  let v1 = "";

  for (const part of parts) {
    const [k, val] = part.split("=");
    if (!k || !val) continue;
    if (k.trim() === "ts") ts = val.trim();
    if (k.trim() === "v1") v1 = val.trim();
  }

  return { ts, v1 };
}

function timingSafeEqualHex(a: string, b: string) {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function asObject(v: unknown): Record<string, any> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, any>;
  return {};
}

function pickString(...vals: Array<unknown>) {
  for (const v of vals) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
}

function getDataIdFromRequest(url: URL, body: any) {
  const q1 = url.searchParams.get("data.id");
  const q2 = url.searchParams.get("id");

  const b1 = body?.data?.id;
  const b2 = body?.id;

  const id = q1 ?? q2 ?? (b1 != null ? String(b1) : null) ?? (b2 != null ? String(b2) : null);
  return id && String(id).trim().length ? String(id).trim() : null;
}

function getTopicFromRequest(url: URL, body: any) {
  const qTopic = url.searchParams.get("topic") || url.searchParams.get("type");
  const bTopic = body?.type || body?.topic;
  return (qTopic ?? bTopic ?? "").toString().trim();
}

async function fetchPayment(paymentId: string) {
  const token = (process.env.MP_ACCESS_TOKEN ?? "").trim();
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN");

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const txt = await res.text().catch(() => "");
  let data: any = null;

  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(`Error consultando pago ${paymentId}: ${res.status} ${txt}`);
  }

  return data;
}

function escapeHtml(s: string) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEmailFrom() {
  const from = (process.env.EMAIL_FROM ?? "").trim() || (process.env.RESEND_FROM ?? "").trim();
  return from || "CyborgTI <onboarding@resend.dev>";
}

function buildApprovedEmailHTML(params: {
  logoUrl: string;
  orderId: string;
  fullName: string;
  whatsapp: string;
  total: string;
  courses: string[];
}) {
  const { logoUrl, orderId, fullName, whatsapp, total, courses } = params;

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
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${escapeHtml(
                                          orderId
                                        )}</div>
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
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${escapeHtml(
                                          fullName || "Cliente"
                                        )}</div>
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
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${escapeHtml(
                                          whatsapp || "—"
                                        )}</div>
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
                                        <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;">${escapeHtml(
                                          total || "—"
                                        )}</div>
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
                      <a href="${FB_URL}" style="color:#cbd5e7;text-decoration:none;margin-left:10px;">Facebook</a>
                      <a href="${IG_URL}" style="color:#cbd5e7;text-decoration:none;margin-left:10px;">Instagram</a>
                      <a href="${WA_URL}" style="color:#cbd5e7;text-decoration:none;margin-left:10px;">WhatsApp</a>
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

async function sendApprovedEmails(payment: any, orderId: string) {
  const resend = getResendClient();
  if (!resend) return;

  const from = getEmailFrom();

  // 🔎 LOG para confirmar env en local
  console.log("[MP WEBHOOK] ENV", {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_FROM: process.env.RESEND_FROM,
    NODE_ENV: process.env.NODE_ENV,
  });

  // metadata de MP
  const metadata = asObject(payment?.metadata);
  const metaEntitlements = asObject(metadata.entitlements);

  // KV
  const orderKey = `order:${orderId}`;
  const order = asObject(await kv.get(orderKey));
  const orderCustomer = asObject(order.customer);
  const orderMeta = asObject(order.metadata);

  const fullName = pickString(
    metadata.fullName,
    orderCustomer.fullName,
    orderMeta.fullName,
    order.fullName,
    "Cliente"
  );

  const whatsapp = pickString(
    metadata.whatsApp,
    metadata.whatsapp,
    orderCustomer.whatsApp,
    orderCustomer.whatsapp,
    orderMeta.whatsApp,
    orderMeta.whatsapp,
    order.whatsApp,
    order.whatsapp
  );

  const orderEntitlements = asObject(order.entitlements);
  const entitlements =
    Object.keys(metaEntitlements).length > 0 ? metaEntitlements : orderEntitlements;
  const courses = Object.keys(entitlements);

  const orderEmail = pickString(orderCustomer.email, orderMeta.email, order.email);
  const metaEmail = pickString(metadata.email);
  const payerEmail = pickString(payment?.payer?.email);

  // ✅ buyer list
  const buyerRecipients = Array.from(
    new Set([orderEmail, metaEmail, payerEmail].map((x) => String(x ?? "").trim()).filter(Boolean))
  );

  const adminEmail = pickString(process.env.ADMIN_EMAIL);

  const total =
    payment?.transaction_amount != null
      ? `${String(payment?.currency_id ?? "PEN")} ${String(payment?.transaction_amount)}`
      : "";

  const baseUrl =
    (process.env.NEXT_PUBLIC_APP_URL ?? "").trim() ||
    (process.env.APP_URL ?? "").trim() ||
    "https://cyborgti.com";

  const logoUrl = `${baseUrl}/logo/cyborgti.svg`;

  const subject = "✅ Pago confirmado - CyborgTI";
  const html = buildApprovedEmailHTML({ logoUrl, orderId, fullName, whatsapp, total, courses });

  // ✅ Enviar al/los buyers
  for (const to of buyerRecipients) {
    await resend.emails.send({ from, to, subject, html });
  }

  // ✅ Enviar SIEMPRE al admin (si existe)
  if (adminEmail) {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `[ADMIN] ${subject} (${orderId})`,
      html,
    });
  } else {
    console.warn("[MP WEBHOOK] ADMIN_EMAIL no definido -> no se envio admin");
  }
}

export async function POST(req: Request) {
  const secret = (process.env.MP_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Falta MP_WEBHOOK_SECRET" }, { status: 500 });
  }

  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const url = new URL(req.url);
  const dataId = getDataIdFromRequest(url, body);
  const topic = getTopicFromRequest(url, body);

  const isPayment = topic === "payment" || topic === "payments";
  if (topic && !isPayment) {
    return NextResponse.json({ ok: true, ignored: true, topic }, { status: 200 });
  }

  if (!dataId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "no data.id" }, { status: 200 });
  }

  if (xSignature && xRequestId) {
    const { ts, v1 } = parseXSignature(xSignature);
    if (!ts || !v1) {
      return NextResponse.json({ ok: false, error: "x-signature inválido" }, { status: 401 });
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const computed = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

    if (!timingSafeEqualHex(computed, v1)) {
      return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
    }
  }

  try {
    const payment = await fetchPayment(dataId);

    const status = payment?.status as string | undefined;
    const paymentId = String(payment?.id ?? dataId);
    const orderId = String(payment?.external_reference ?? "").trim() || null;

    const approved = status === "approved";
    const rejected = status === "rejected" || status === "cancelled";
    const pending = status === "pending" || status === "in_process";

    if (!orderId) {
      return NextResponse.json({ ok: true, approved, note: "No external_reference" }, { status: 200 });
    }

    const eventKey = `mp:payment:${paymentId}`;
    const already = await kv.get(eventKey);
    if (already) {
      return NextResponse.json({ ok: true, approved, dedup: true }, { status: 200 });
    }

    await kv.set(eventKey, { seenAt: Date.now(), orderId, status });
    await kv.expire(eventKey, 60 * 60 * 24 * 7);

    const orderKey = `order:${orderId}`;
    const prev = asObject(await kv.get(orderKey));
    const prevStatus = typeof prev.status === "string" ? prev.status : null;

    const nextStatus = approved ? "paid" : rejected ? "rejected" : pending ? "pending" : "unknown";

    await kv.set(orderKey, {
      ...prev,
      status: nextStatus,
      updatedAt: Date.now(),
      mp: {
        ...asObject(prev.mp),
        paymentId,
        paymentStatus: status ?? null,
        statusDetail: payment?.status_detail ?? null,
        transaction_amount: payment?.transaction_amount ?? null,
        currency_id: payment?.currency_id ?? null,
        payer_email: payment?.payer?.email ?? null,
        raw: process.env.MP_DEBUG === "1" ? payment : undefined,
      },
    });

    const sentKey = `order:${orderId}:email_sent`;
    const alreadySent = await kv.get(sentKey);

    if (nextStatus === "paid" && prevStatus !== "paid" && !alreadySent) {
      try {
        await sendApprovedEmails(payment, orderId);
        await kv.set(sentKey, { at: Date.now(), paymentId });
        await kv.expire(sentKey, 60 * 60 * 24 * 30);
      } catch (e) {
        console.error("[MP WEBHOOK] email send failed:", e);
      }
    }

    return NextResponse.json({ ok: true, approved, orderId, status: nextStatus }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error validando pago" },
      { status: 500 }
    );
  }
}
