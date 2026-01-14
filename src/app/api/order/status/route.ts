// src/app/api/order/status/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = (searchParams.get("orderId") ?? "").trim();

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "Falta orderId" }, { status: 400 });
  }

  const data = await kv.get<Record<string, any>>(`order:${orderId}`);
  if (!data) {
    // puede pasar si aún no se guardó o si el webhook no llegó
    return NextResponse.json({ ok: true, exists: false, status: "missing" }, { status: 200 });
  }

  return NextResponse.json(
    {
      ok: true,
      exists: true,
      status: data.status ?? "unknown",
      updatedAt: data.updatedAt ?? null,
      submittedAt: data.submittedAt ?? null,
    },
    { status: 200 }
  );
}
