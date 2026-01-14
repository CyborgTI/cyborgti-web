// src/app/api/checkout/submit/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Body = {
  orderId: string;
  payload: {
    fullName: string;
    whatsApp: string;
    licenses: Record<string, string[]>;
    entitlements: Record<string, number>;
    totals: any;
    lines: any;
  };
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;

  const orderId = (body?.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "Falta orderId" }, { status: 400 });
  }

  const orderKey = `order:${orderId}`;
  const order = await kv.get<Record<string, any>>(orderKey);

  if (!order) {
    return NextResponse.json({ ok: false, error: "Orden no existe en KV" }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { ok: false, error: "Aún no está pagado", status: order.status },
      { status: 409 }
    );
  }

  if (order.submittedAt) {
    return NextResponse.json({ ok: true, already: true }, { status: 200 });
  }

  // ✅ marca como enviado (anti-duplicado)
  await kv.set(orderKey, {
    ...order,
    submittedAt: Date.now(),
    customer: body?.payload ?? null,
  });

  // ✅ AQUÍ llamas a Resend (placeholder)
  // await resend.emails.send({ ... })

  return NextResponse.json({ ok: true }, { status: 200 });
}
