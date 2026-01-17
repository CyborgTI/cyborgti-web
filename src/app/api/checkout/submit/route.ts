// src/app/api/checkout/submit/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Body = {
  orderId: string;
  payload: {
    fullName: string;
    email: string;
    whatsApp: string;
    licenses: Record<string, string[]>;
    entitlements: Record<string, number>;
    totals: any;
    lines: any;
  };
};

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function isEmailValid(email: string) {
  const v = email.trim();
  return v.includes("@") && v.includes(".");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;

  const orderId = cleanStr(body?.orderId);
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "Falta orderId" }, { status: 400 });
  }

  const payload = body?.payload ?? null;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Falta payload" }, { status: 400 });
  }

  const fullName = cleanStr(payload.fullName);
  const email = cleanStr(payload.email);
  const whatsApp = cleanStr(payload.whatsApp);

  if (!fullName) {
    return NextResponse.json({ ok: false, error: "Falta fullName" }, { status: 400 });
  }
  if (!email || !isEmailValid(email)) {
    return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 });
  }

  const orderKey = `order:${orderId}`;
  const order = (await kv.get<Record<string, any>>(orderKey)) || null;

  if (!order) {
    return NextResponse.json({ ok: false, error: "Orden no existe en KV" }, { status: 404 });
  }

  // ✅ Si ya se envió una vez, no duplicar (idempotencia)
  if (order.submittedAt) {
    return NextResponse.json({ ok: true, already: true }, { status: 200 });
  }

  // ✅ Guardamos SIEMPRE los datos del formulario, aunque la orden siga pending.
  // El webhook se encargará de enviar el email cuando el estado pase a "paid".
  await kv.set(orderKey, {
    ...order,
    submittedAt: Date.now(),
    customer: {
      fullName,
      email,
      // guardamos ambas variantes por compatibilidad
      whatsApp,
      whatsapp: whatsApp,
    },
    entitlements: payload.entitlements ?? order.entitlements ?? {},
    licenses: payload.licenses ?? order.licenses ?? {},
    totals: payload.totals ?? order.totals ?? null,
    lines: payload.lines ?? order.lines ?? null,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
