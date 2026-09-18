import { NextRequest, NextResponse } from "next/server";
import {
  validateAttributionIntent,
  validateAttributionReference,
} from "@/lib/attribution/schema.mjs";
import { toHermesContactIntent } from "@/lib/attribution/hermes-contract.mjs";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8_192;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestsByClient = new Map<string, { count: number; resetAt: number }>();

function json(payload: object, status: number) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const configured = (process.env.ATTRIBUTION_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return origin === request.nextUrl.origin || configured.includes(origin);
}

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(request: NextRequest) {
  const now = Date.now();
  if (requestsByClient.size > 1_000) {
    requestsByClient.forEach((value, key) => {
      if (value.resetAt <= now) requestsByClient.delete(key);
    });
  }
  const key = clientKey(request);
  const current = requestsByClient.get(key);
  if (!current || current.resetAt <= now) {
    requestsByClient.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function hermesIntentUrl() {
  const configured = process.env.HERMES_API_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (!new Set(["http:", "https:"]).has(url.protocol)) return null;
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/advertising/contact-intents`;
    url.search = "";
    return url;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  if (isRateLimited(request)) return json({ error: "Demasiadas solicitudes." }, 429);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Contenido no permitido." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: "Solicitud demasiado grande." }, 413);

  let input: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json({ error: "Solicitud demasiado grande." }, 413);
    }
    input = JSON.parse(raw);
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const validation = validateAttributionIntent(input);
  if (!validation.ok) return json({ error: "Solicitud inválida." }, 400);

  const target = hermesIntentUrl();
  const integrationKey = process.env.HERMES_ATTRIBUTION_KEY?.trim();
  if (!target || !integrationKey) return json({ error: "Atribución no disponible." }, 503);

  const timeout = Math.min(
    Math.max(Number(process.env.ATTRIBUTION_REQUEST_TIMEOUT_MS) || 2_500, 500),
    8_000,
  );

  try {
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const upstream = await fetch(target, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: origin,
        "X-Hermes-Attribution-Key": integrationKey,
      },
      body: JSON.stringify(toHermesContactIntent(validation.value, origin)),
      cache: "no-store",
      signal: AbortSignal.timeout(timeout),
    });

    if (!upstream.ok) return json({ error: "Atribución no disponible." }, 502);
    const result = validateAttributionReference(await upstream.json().catch(() => null));
    if (!result) return json({ error: "Respuesta de atribución inválida." }, 502);
    return json(result, 201);
  } catch {
    return json({ error: "Atribución no disponible." }, 502);
  }
}
