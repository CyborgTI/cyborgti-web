// src/app/api/mp/preference/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Body = {
  items: Array<{
    title: string;
    unit_price: number;
    quantity: number;
    currency_id?: "PEN";
  }>;
  email?: string;

  metadata?: Record<string, any>;
  external_reference?: string; // orderId
};

function getOriginFromHeaders(req: Request) {
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/**
 * En MP, back_urls + auto_return exigen URLs públicas (ideal https).
 * Prioriza APP_URL (o SITE_URL) y si no, usa headers.
 */
function getPublicBaseUrl(req: Request) {
  const envUrl = (process.env.APP_URL ?? process.env.SITE_URL ?? "").trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  return getOriginFromHeaders(req).replace(/\/$/, "");
}

function isHttpsUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * KV puede devolver null / string / number / object.
 * Para poder usar spread sin romper TS, convertimos a objeto seguro.
 */
function asObject(v: unknown): Record<string, any> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, any>;
  return {};
}

export async function POST(req: Request) {
  try {
    console.log("[MP preference] hit", new Date().toISOString());

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[MP preference] missing MP_ACCESS_TOKEN");
      return NextResponse.json(
        {
          ok: false,
          error:
            "Falta MP_ACCESS_TOKEN (si lo agregaste en .env.local, reinicia npm run dev).",
        },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body?.items?.length) {
      return NextResponse.json({ ok: false, error: "Faltan items" }, { status: 400 });
    }

    // Validación mínima
    for (const it of body.items) {
      if (!it || typeof it.title !== "string" || it.title.trim().length === 0) {
        return NextResponse.json({ ok: false, error: "Item inválido: title" }, { status: 400 });
      }
      if (
        typeof it.unit_price !== "number" ||
        !Number.isFinite(it.unit_price) ||
        it.unit_price <= 0
      ) {
        return NextResponse.json(
          { ok: false, error: "Item inválido: unit_price" },
          { status: 400 }
        );
      }
      if (typeof it.quantity !== "number" || !Number.isFinite(it.quantity) || it.quantity < 1) {
        return NextResponse.json(
          { ok: false, error: "Item inválido: quantity" },
          { status: 400 }
        );
      }
    }

    const baseUrl = getPublicBaseUrl(req);

    // ✅ orderId estable
    const orderId = body.external_reference ?? `cyborgti_${Date.now()}`;
    const orderKey = `order:${orderId}`;

    // ✅ Guardar “pending” en KV ANTES de crear preferencia
    await kv.set(orderKey, {
      status: "pending",
      createdAt: Date.now(),
      orderId,
      metadata: body.metadata ?? null,
      items: body.items,
    });

    // ✅ Webhook y back urls (con orderId)
    const notification_url = `${baseUrl}/api/mp/webhook`;

    const successUrl = `${baseUrl}/checkout?status=success&orderId=${encodeURIComponent(orderId)}`;
    const pendingUrl = `${baseUrl}/checkout?status=pending&orderId=${encodeURIComponent(orderId)}`;
    const failureUrl = `${baseUrl}/checkout?status=failure&orderId=${encodeURIComponent(orderId)}`;

    const back_urls = {
      success: successUrl,
      pending: pendingUrl,
      failure: failureUrl,
    };

    const preferencePayload: any = {
      items: body.items.map((it) => ({
        title: it.title,
        unit_price: it.unit_price,
        quantity: Math.floor(it.quantity),
        currency_id: "PEN",
      })),
      payer: body.email ? { email: body.email } : undefined,
      notification_url,
      back_urls,
      external_reference: orderId,
      metadata: body.metadata ?? undefined,
    };

    /**
     * ✅ FIX:
     * auto_return solo si successUrl es https.
     */
    if (isHttpsUrl(successUrl)) {
      preferencePayload.auto_return = "approved";
    } else {
      console.warn(
        "[MP preference] auto_return disabled because success URL is not https:",
        successUrl
      );
    }

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
      cache: "no-store",
    });

    const mpText = await mpRes.text();
    let mpData: any = null;
    try {
      mpData = mpText ? JSON.parse(mpText) : null;
    } catch {
      mpData = null;
    }

    if (!mpRes.ok) {
      console.error("[MP preference] rejected:", {
        status: mpRes.status,
        body: mpText,
        parsed: mpData,
      });

      const prev = asObject(await kv.get(orderKey));
      await kv.set(orderKey, {
        ...prev,
        status: "error",
        updatedAt: Date.now(),
        mp_status: mpRes.status,
        mp_error: mpData ?? mpText,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Mercado Pago rechazó la preferencia",
          mp_status: mpRes.status,
          mp_body: mpData ?? mpText,
          debug: {
            baseUrl,
            successUrl,
            notification_url,
            orderId,
          },
        },
        { status: 502 }
      );
    }

    const init_point = mpData?.init_point;
    const sandbox_init_point = mpData?.sandbox_init_point;

    if (!init_point && !sandbox_init_point) {
      console.error("[MP preference] missing init_point/sandbox_init_point:", mpData);

      const prev = asObject(await kv.get(orderKey));
      await kv.set(orderKey, {
        ...prev,
        status: "error",
        updatedAt: Date.now(),
        mp_error: mpData ?? mpText,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "MP respondió sin init_point/sandbox_init_point",
          mp_body: mpData ?? mpText,
          debug: { orderId, baseUrl },
        },
        { status: 502 }
      );
    }

    // ✅ Guardar el preference_id
    const prev = asObject(await kv.get(orderKey));
    await kv.set(orderKey, {
      ...prev,
      mp_preference_id: mpData?.id ?? null,
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        ok: true,
        orderId,
        id: mpData?.id,
        init_point,
        sandbox_init_point,
        external_reference: orderId,
        notification_url,
        origin_used: baseUrl,
        auto_return_enabled: !!preferencePayload.auto_return,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[MP preference] unexpected:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Error interno creando preferencia" },
      { status: 500 }
    );
  }
}
