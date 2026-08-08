import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "salesmanpro.site";
const AUTH_DOMAIN = "auth.salesmanpro.site";

// Restored the array for cleaner route management
const PROTECTED_PATHS = [
  "/admin",
  "/clients",
  "/agents",
  "/users",
  "/dashboards",
  "/stores",
];

export const config = {
  // Restored your old matcher to properly ignore static assets and images
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default async function middleware(
  request: NextRequest,
  ev: NextFetchEvent,
) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // UNIVERSAL SESSION CHECK
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  const isProtectedRoute = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  // 1. PRESERVE CALLBACK URL FOR UNAUTHENTICATED USERS
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url); // Tracks original destination
    return NextResponse.redirect(signInUrl);
  }

  // 2. DYNAMIC ROUTING FOR ALREADY LOGGED-IN USERS
  if (session && (pathname === "/desktop-login" || pathname === "/signin")) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

    // If they have a destination waiting in the URL, send them there.
    // Otherwise, default to dashboards.
    const targetUrl = callbackUrl
      ? new URL(callbackUrl, request.url)
      : new URL("/dashboards", request.url);

    return NextResponse.redirect(targetUrl);
  }

  const host = request.headers.get("host")?.split(":")[0] || "";
  const fullHost = request.headers.get("host") || "";
  const isLocalHost =
    host === "localhost" || host === "127.0.0.1" || fullHost.endsWith(":3000");

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (host.startsWith("www.")) {
    return NextResponse.redirect(
      `https://${host.replace("www.", "")}${pathname}${request.nextUrl.search}`,
    );
  }

  if (host === PRIMARY_HOST || isLocalHost || host === AUTH_DOMAIN) {
    return NextResponse.next();
  }

  // Bypass rewrites for core web app paths
  if (
    isProtectedRoute ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup")
  ) {
    return NextResponse.next();
  }

  // Subdomain Routing (e.g. tenant.salesmanpro.site)
  if (host.endsWith(".salesmanpro.site")) {
    const subdomain = host.replace(".salesmanpro.site", "");
    if (subdomain && subdomain !== "www") {
      url.pathname =
        pathname === "/" || pathname === ""
          ? `/site/${subdomain}`
          : `/site/${subdomain}${pathname}`;

      const res = NextResponse.rewrite(url);
      // Restored your custom tenant headers for easier backend debugging
      res.headers.set("x-tenant-domain", host);
      res.headers.set("x-requested-subdomain", subdomain);
      res.headers.set("x-original-path", pathname);
      return res;
    }
  }

  // Custom Domain Tenant Routing (e.g. ghuba.shop)
  if (
    host &&
    host !== PRIMARY_HOST &&
    !host.endsWith(".salesmanpro.site") &&
    !isLocalHost
  ) {
    const normalizedHost = host.replace(/^www\./, "").toLowerCase();

    url.pathname =
      pathname === "/" || pathname === ""
        ? `/site/${normalizedHost}`
        : `/site/${normalizedHost}${pathname}`;

    const res = NextResponse.rewrite(url);
    res.headers.set("x-tenant-domain", normalizedHost);
    res.headers.set("x-requested-host", host);
    res.headers.set("x-original-path", pathname);
    return res;
  }

  return NextResponse.next();
}
