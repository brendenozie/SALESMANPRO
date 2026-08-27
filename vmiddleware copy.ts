// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

const PRIMARY_HOST = "salesmanpro.site";
const AUTH_DOMAIN = "auth.salesmanpro.site";

const SECONDARY_HOSTS = [
  "519c-102-135-172-117.ngrok-free.app",
];

const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

const PROTECTED_PATHS = [
  "/admin",
  "/clients",
  "/agents",
  "/users",
  "/dashboards",
  "/stores",
];

const RATE_LIMITS = {
  api: { windowMs: 60_000, max: 60 },        // 60 req/min
  auth: { windowMs: 60_000, max: 10 },       // 10 req/min
  general: { windowMs: 60_000, max: 120 },   // 120 req/min
};

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

/* -------------------------------------------------------------------------- */
/*                                 UTILITIES                                  */
/* -------------------------------------------------------------------------- */

function getHost(request: NextRequest) {
  return request.headers.get("host")?.split(":")[0] ?? "";
}

function getFullHost(request: NextRequest) {
  return request.headers.get("host") ?? "";
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isLocalHost(host: string, fullHost: string) {
  return (
    LOCAL_HOSTS.includes(host) ||
    fullHost.endsWith(":3000")
  );
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Reset window
  if (!entry || entry.expiresAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return { allowed: true, remaining: limit - 1 };
  }

  // Limit exceeded
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Increment
  entry.count += 1;
  rateLimitStore.set(key, entry);

  return { allowed: true, remaining: limit - entry.count };
}

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith("/api/auth")) return RATE_LIMITS.auth;
  if (pathname.startsWith("/api")) return RATE_LIMITS.api;
  return RATE_LIMITS.general;
}

/* -------------------------------------------------------------------------- */
/*                                 MATCHER                                    */
/* -------------------------------------------------------------------------- */

export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

export default async function middleware(
  request: NextRequest,
  _ev: NextFetchEvent
) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const host = getHost(request);
  const fullHost = getFullHost(request);
  const userAgent = request.headers.get("user-agent") || "";

  /* ---------------------------------------------------------------------- */
  /* 1️⃣ AUTH / DESKTOP DETECTION                                             */
  /* ---------------------------------------------------------------------- */

  const isDesktop = userAgent.includes("SalesmanProDesktop");
  const isAuthPage =
    pathname.startsWith("/desktop-login") ||
    pathname.startsWith("/api/auth");

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  // Desktop → not logged in → redirect to desktop login
  if (isDesktop && !session && !isAuthPage) {
    return NextResponse.redirect(new URL("/desktop-login", request.url));
  }

  // Desktop → logged in → prevent staying on login page
  if (isDesktop && session && pathname === "/desktop-login") {
    return NextResponse.redirect(new URL("/dashboards", request.url));
  }

  /* ---------------------------------------------------------------------- */
/* 🚦 RATE LIMITING (PER IP)                                               */
/* ---------------------------------------------------------------------- */

const clientIp = getClientIp(request);
const { windowMs, max } = getRateLimitConfig(pathname);

const rateKey = `${clientIp}:${pathname.split("/")[1] || "root"}`;
const result = rateLimit(rateKey, max, windowMs);

if (!result.allowed) {
  return new NextResponse(
    JSON.stringify({
      error: "Too many requests",
      retryAfter: windowMs / 1000,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(windowMs / 1000),
      },
    }
  );
}

/* ---------------------------------------------------------------------- */
/* 🚦 RATE LIMITING (IP + USER + BURST + SLIDING WINDOW)                   */
/* ---------------------------------------------------------------------- */

// const clientIp = getClientIp(request);
// const userId = getUserIdFromSession(session);

// // Combine identity safely
// const identity =
//   userId
//     ? `user:${userId}`
//     : `ip:${clientIp}`;

// const limiters = selectLimiters(pathname);

// // Apply ALL limiters (sliding + burst)
// for (const limiter of limiters) {
//   const result = await limiter.limit(identity);

//   if (!result.success) {
//     return new NextResponse(
//       JSON.stringify({
//         error: "Too many requests",
//         limit: result.limit,
//         remaining: result.remaining,
//         reset: result.reset,
//       }),
//       {
//         status: 429,
//         headers: {
//           "Content-Type": "application/json",
//           "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
//         },
//       }
//     );
//   }
// }

  /* ---------------------------------------------------------------------- */
  /* 2️⃣ API ROUTES (BYPASS)                                                  */
  /* ---------------------------------------------------------------------- */

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  /* ---------------------------------------------------------------------- */
  /* 3️⃣ WWW REDIRECT                                                        */
  /* ---------------------------------------------------------------------- */

  if (host.startsWith("www.")) {
    return NextResponse.redirect(
      `https://${host.replace("www.", "")}${pathname}`
    );
  }

  /* ---------------------------------------------------------------------- */
  /* 4️⃣ LOCALHOST / PRIMARY HOST                                            */
  /* ---------------------------------------------------------------------- */

  if (host === PRIMARY_HOST || isLocalHost(host, fullHost)) {
    return NextResponse.next();
  }

  /* ---------------------------------------------------------------------- */
  /* 5️⃣ AUTH DOMAIN                                                         */
  /* ---------------------------------------------------------------------- */

  if (host === AUTH_DOMAIN) {
    return NextResponse.next();
  }

  /* ---------------------------------------------------------------------- */
  /* 6️⃣ PLATFORM ROUTES (GLOBAL PAGES)                                      */
  /* ---------------------------------------------------------------------- */

  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/dashboards") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  /* ---------------------------------------------------------------------- */
  /* 7️⃣ SUBDOMAIN TENANTS (*.salesmanpro.site)                              */
  /* ---------------------------------------------------------------------- */

  if (host.endsWith(".salesmanpro.site") || host.endsWith(".test")) {
    const subdomain = host
      .replace(".salesmanpro.site", "")
      .replace(".test", "");

    if (subdomain && subdomain !== "www") {
      url.pathname =
        pathname === "/" ? `/site/${subdomain}` : `/site/${subdomain}${pathname}`;

      const res = NextResponse.rewrite(url);
      res.headers.set("x-tenant-type", "subdomain");
      res.headers.set("x-tenant-slug", subdomain);
      return res;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 8️⃣ CUSTOM DOMAIN TENANTS (flourishhub.co.ke)                           */
  /* ---------------------------------------------------------------------- */

  if (
    host &&
    host !== PRIMARY_HOST &&
    !host.endsWith(".salesmanpro.site") &&
    !LOCAL_HOSTS.includes(host) &&
    !SECONDARY_HOSTS.includes(host)
  ) {
    const normalizedHost = host.replace(/^www\./, "").toLowerCase();

    url.pathname =
      pathname === "/"
        ? `/site/${normalizedHost}`
        : `/site/${normalizedHost}${pathname}`;

    const res = NextResponse.rewrite(url);
    res.headers.set("x-tenant-type", "custom-domain");
    res.headers.set("x-tenant-slug", normalizedHost);
    return res;
  }

  /* ---------------------------------------------------------------------- */
  /* 9️⃣ SECONDARY / DEV HOSTS (NGROK, PREVIEW)                              */
  /* ---------------------------------------------------------------------- */

  if (SECONDARY_HOSTS.includes(host)) {
    if (pathname.startsWith("/site/")) {
      return NextResponse.next();
    }

    const defaultSlug = "duka-yangu";
    url.pathname =
      pathname === "/"
        ? `/site/${defaultSlug}`
        : `/site/${defaultSlug}${pathname}`;

    return NextResponse.rewrite(url);
  }

  /* ---------------------------------------------------------------------- */
  /* 🔟 FALLBACK                                                            */
  /* ---------------------------------------------------------------------- */

  return NextResponse.next();
}