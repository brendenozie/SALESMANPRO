import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_HOST,
  classifyHost,
  hostFromUrl,
  isStaticallyAllowedReturnHost,
  normalizeHost,
  parseAbsoluteUrl,
} from "./domain";
import {
  AUTH_CONTEXT_COOKIE,
  encodeAuthContext,
  readAuthContextFromCookieHeader,
  cookieOptions,
  type AuthFlowContext,
} from "./context-cookie";

export {
  AUTH_CONTEXT_COOKIE,
  encodeAuthContext,
  decodeAuthContext,
  readAuthContextFromCookieHeader,
  cookieOptions,
  type AuthFlowContext,
} from "./context-cookie";

export async function resolveReturnContext(callbackUrl: string | null | undefined): Promise<AuthFlowContext | null> {
  let url = parseAbsoluteUrl(callbackUrl);
  if (!url) return null;

  // If callbackUrl is a handover URL pointing to auth host, extract the inner target!
  if (normalizeHost(url.hostname) === AUTH_HOST) {
    const innerTarget = url.searchParams.get("target");
    if (innerTarget) {
      const unwrapped = parseAbsoluteUrl(innerTarget);
      if (unwrapped) {
        url = unwrapped;
      }
    }
  }

  const host = normalizeHost(url.hostname);
  if (!host) return null;

  const classified = classifyHost(host);

  // If the target is still the auth host, default to the Hub dashboards
  if (classified.kind === "auth") {
    return {
      kind: "hub",
      returnHost: "salesmanpro.site",
      returnUrl: "https://salesmanpro.site/dashboards",
      tenantSlug: null,
      issuedAt: Date.now(),
    };
  }

  if (classified.kind === "custom_domain") {
    const allowed = await isAllowedReturnUrl(url.toString());
    if (!allowed) return null;
  } else if (!isStaticallyAllowedReturnHost(host)) {
    return null;
  }

  return {
    kind: classified.kind === "unknown" ? "custom_domain" : classified.kind,
    returnHost: host,
    returnUrl: `${url.origin}${url.pathname === "/signin" || url.pathname === "/signup" ? "/" : url.pathname}${url.search}`,
    tenantSlug: classified.slug,
    issuedAt: Date.now(),
  };
}

export async function applyAuthContextCookie(res: NextResponse, ctx: AuthFlowContext | null) {
  if (!ctx) return res;
  const token = await encodeAuthContext(ctx);
  res.cookies.set(AUTH_CONTEXT_COOKIE, token, cookieOptions());
  return res;
}

export async function attachAuthContextFromRequest(request: NextRequest, res: NextResponse) {
  const callbackUrl =
    request.nextUrl.searchParams.get("callbackUrl") ||
    request.nextUrl.searchParams.get("target");
  const ctx = await resolveReturnContext(callbackUrl);
  if (ctx) await applyAuthContextCookie(res, ctx);
  return ctx;
}

export async function isAllowedReturnUrl(raw: string | null | undefined): Promise<boolean> {
  const url = parseAbsoluteUrl(raw);
  if (!url) return false;

  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    if (normalizeHost(url.hostname) !== "localhost" && normalizeHost(url.hostname) !== "127.0.0.1") {
      return false;
    }
  }

  const host = normalizeHost(url.hostname);
  if (isStaticallyAllowedReturnHost(host)) return true;

  try {
    const { fetchWithCache } = await import("../cache");
    const cacheKey = `allowed_return_host:${host}`;

    return await fetchWithCache(
      cacheKey,
      async () => {
        const prisma = (await import("../../server/db/prismadb")).default;
        const classified = classifyHost(host);
        const company = await prisma.company.findFirst({
          where: {
            OR: [
              { domain: host },
              { domain: `www.${host}` },
              { domain: url.hostname.toLowerCase() },
              ...(classified.slug ? [{ slug: classified.slug }, { domain: classified.slug }] : []),
            ],
          },
          select: { id: true },
        });
        return !!company;
      },
      { ttlSeconds: 300 },
    );
  } catch {
    return false;
  }
}

export function contextFromHostFallback(host: string): AuthFlowContext {
  const classified = classifyHost(host);
  if (classified.kind === "auth" || classified.kind === "unknown" || !classified.host) {
    return {
      kind: "hub",
      returnHost: "salesmanpro.site",
      returnUrl: "https://salesmanpro.site/dashboards",
      tenantSlug: null,
      issuedAt: Date.now(),
    };
  }
  return {
    kind: classified.kind,
    returnHost: classified.host,
    returnUrl: classified.kind === "hub" ? "https://salesmanpro.site" : `https://${classified.host}`,
    tenantSlug: classified.slug,
    issuedAt: Date.now(),
  };
}

export function hostFromCallbackParam(callbackUrl?: string | null): string {
  return hostFromUrl(callbackUrl);
}
