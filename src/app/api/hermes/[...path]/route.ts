import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function getHermesBaseUrl(): URL | null {
  const configuredUrl = process.env.HERMES_API_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

async function proxyHermes(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const baseUrl = getHermesBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Hermes no está configurado en este entorno." },
      { status: 503 },
    );
  }

  if (!ALLOWED_METHODS.has(request.method)) {
    return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
  }

  const { path } = await context.params;
  if (!path.length || path.some((segment) => !/^[A-Za-z0-9_-]+$/.test(segment))) {
    return NextResponse.json({ error: "Ruta Hermes inválida." }, { status: 400 });
  }
  const target = new URL(baseUrl);
  const basePath = target.pathname.replace(/\/+$/, "");
  target.pathname = `${basePath}/${path.map(encodeURIComponent).join("/")}`;
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", request.headers.get("accept") || "application/json");

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
    responseHeaders.set("cache-control", "no-store");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con Hermes." },
      { status: 502 },
    );
  }
}

export const GET = proxyHermes;
export const POST = proxyHermes;
export const PUT = proxyHermes;
export const PATCH = proxyHermes;
export const DELETE = proxyHermes;
