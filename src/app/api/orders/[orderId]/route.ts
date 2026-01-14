import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function GET(_: Request, { params }: { params: { orderId: string } }) {
  const order = await kv.get(`order:${params.orderId}`);
  return NextResponse.json({ ok: true, order });
}
