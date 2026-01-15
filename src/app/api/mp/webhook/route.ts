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

function getDataIdFromRequest(url: URL, body: any) {
  const q1 = url.searchParams.get("data.id");
  const q2 = url.searchParams.get("id");

  const b1 = body?.data?.id;
  const b2 = body?.id;

  const id = q1 ?? q2 ?? (b1 != null ? String(b1) : null) ?? (b2 != null ? String(b2) : null);
  return id && String(id).trim().length ? String(id).trim() : null;
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

function normalizeEmailsShape(v: unknown): Record<string, string[]> {
  const o = asObject(v);
  const out: Record<string, string[]> = {};
  for (const [k, val] of Object.entries(o)) {
    if (Array.isArray(val)) out[k] = val.map((x) => String(x ?? "")).filter(Boolean);
  }
  return out;
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
  const from =
    (process.env.EMAIL_FROM ?? "").trim() || (process.env.RESEND_FROM ?? "").trim();
  return from || "CyborgTI <onboarding@resend.dev>";
}

async function sendApprovedEmails(payment: any, orderId: string) {
  const resend = getResendClient();
  if (!resend) return;

  const from = getEmailFrom();
  if (!from) return;

  const metadata = asObject(payment?.metadata);

  const fullName = String(metadata.fullName ?? "Cliente");
  const whatsapp = String(metadata.whatsApp ?? "");
  const entitlements = asObject(metadata.entitlements);
  const licenseEmails = normalizeEmailsShape(metadata.licenses);

  const payerEmail = String(payment?.payer?.email ?? "").trim();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim();

  const toBuyer = payerEmail.length ? payerEmail : null;
  const toAdmin = adminEmail.length ? adminEmail : null;

  const courses = Object.keys(entitlements);
  const coursesText = courses.length ? courses.join(", ") : "—";

  const subject = "✅ Pago confirmado - CyborgTI";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5">
      <h2>Pago confirmado</h2>
      <p><strong>Orden:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(fullName)}</p>
      ${whatsapp ? `<p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>` : ""}
      <p><strong>Cursos:</strong> ${escapeHtml(coursesText)}</p>

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />

      <p><strong>Licencias (NetAcad) por curso</strong></p>
      <pre style="background:#111;color:#eee;padding:12px;border-radius:8px;overflow:auto">${escapeHtml(
        JSON.stringify(licenseEmails, null, 2)
      )}</pre>

      <p style="color:#666;font-size:12px;margin-top:14px">
        Este correo fue enviado automáticamente al confirmarse el pago.
      </p>
    </div>
  `;

  if (toBuyer) {
    await resend.emails.send({ from, to: toBuyer, subject, html });
  }

  if (toAdmin) {
    await resend.emails.send({
      from,
      to: toAdmin,
      subject: `[ADMIN] ${subject} (${orderId})`,
      html,
    });
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

  if (!xSignature || !xRequestId || !dataId) {
    return NextResponse.json(
      { ok: false, error: "Faltan headers o id (x-signature, x-request-id, data.id)" },
      { status: 400 }
    );
  }

  const { ts, v1 } = parseXSignature(xSignature);
  if (!ts || !v1) {
    return NextResponse.json({ ok: false, error: "x-signature inválido" }, { status: 401 });
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const computed = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  if (!timingSafeEqualHex(computed, v1)) {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
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
      return NextResponse.json(
        { ok: true, approved, note: "No external_reference" },
        { status: 200 }
      );
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
        // no romper webhook
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
