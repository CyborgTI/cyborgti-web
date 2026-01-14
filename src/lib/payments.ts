import { kv } from "@vercel/kv";

export async function markPaymentAsProcessed(paymentId: string, data: any) {
  await kv.set(`payment:${paymentId}`, data);
}

export async function isPaymentProcessed(paymentId: string) {
  return kv.get(`payment:${paymentId}`);
}
