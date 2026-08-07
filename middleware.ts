import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "salesmanpro.site";
const AUTH_DOMAIN = "auth.salesmanpro.site";
const SECONDARY_HOSTS = ["519c-102-135-172-117.ngrok-free.app"];

const PROTECTED_PATHS = [
  "/admin",
  "/clients",
  "/agents",
  "/users",
  "/dashboards",
  "/stores",
];

const PUBLIC_EXEMPT_PATHS = [
  "/signin",
  "/signup",
  "/desktop-login",
  "/failure",
  "/api/auth",
];

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0].toLowerCase();
  const userAgent = request.headers.get("user-agent") || "";

  const isDesktop =
    userAgent.includes("SalesmanProDesktop") ||
    userAgent.includes("SalesmanProAndroid");

  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName,
  });

  const isPublicRoute = PUBLIC_EXEMPT_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  const isProtectedRoute = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  // 1. DESKTOP APP SPECIFIC ROUTING
  if (isDesktop) {
    if (!token && !isPublicRoute) {
      return NextResponse.redirect(new URL("/desktop-login", request.url));
    }
    if (token && pathname === "/desktop-login") {
      return NextResponse.redirect(new URL("/dashboards", request.url));
    }
  }

  // 2. GENERAL WEB PROTECTED ROUTE ENFORCEMENT
  if (!token && isProtectedRoute) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 3. WWW REDIRECT
  if (host.startsWith("www.")) {
    const cleanHost = host.replace(/^www\./, "");
    return NextResponse.redirect(
      `https://${cleanHost}${pathname}${request.nextUrl.search}`,
    );
  }

  // 4. API ROUTE PASS-THROUGH
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 5. PRIMARY HOST & LOCALHOST HANDLING
  const isLocalHost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    hostHeader.endsWith(":3000");

  if (host === PRIMARY_HOST || isLocalHost || host === AUTH_DOMAIN) {
    return NextResponse.next();
  }

  // Prepare request rewrite target
  const rewriteUrl = request.nextUrl.clone();

  // 6. SUBDOMAIN TENANT HANDLING (*.salesmanpro.site)
  if (host.endsWith(".salesmanpro.site") || host.endsWith(".test")) {
    const subdomain = host
      .replace(".salesmanpro.site", "")
      .replace(".test", "");

    if (subdomain && subdomain !== "www") {
      rewriteUrl.pathname =
        pathname === "/" || pathname === ""
          ? `/site/${subdomain}`
          : `/site/${subdomain}${pathname}`;

      const res = NextResponse.rewrite(rewriteUrl);
      res.headers.set("x-tenant-domain", host);
      res.headers.set("x-requested-subdomain", subdomain);
      res.headers.set("x-original-path", pathname);
      return res;
    }
  }

  // 7. CUSTOM DOMAIN TENANT HANDLING (e.g. company.co.ke)
  if (
    host &&
    host !== PRIMARY_HOST &&
    !host.endsWith(".salesmanpro.site") &&
    !SECONDARY_HOSTS.includes(host)
  ) {
    const normalizedHost = host.replace(/^www\./, "").toLowerCase();

    rewriteUrl.pathname =
      pathname === "/" || pathname === ""
        ? `/site/${normalizedHost}`
        : `/site/${normalizedHost}${pathname}`;

    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set("x-tenant-domain", normalizedHost);
    res.headers.set("x-requested-host", host);
    res.headers.set("x-original-path", pathname);
    return res;
  }

  // 8. DEVELOPMENT TUNNELS (e.g. Ngrok)
  if (SECONDARY_HOSTS.includes(host)) {
    if (pathname.startsWith("/site/")) {
      return NextResponse.next();
    }
    const defaultSlug = "duka-yangu";
    rewriteUrl.pathname = `/site/${defaultSlug}${pathname === "/" ? "" : pathname}`;

    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set("x-tenant-domain", defaultSlug);
    return res;
  }

  return NextResponse.next();
}
