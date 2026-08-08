import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "salesmanpro.site";
const AUTH_DOMAIN = "auth.salesmanpro.site";

export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

export default async function middleware(
  request: NextRequest,
  ev: NextFetchEvent,
) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // UNIVERSAL SESSION CHECK: No longer restricted to SalesmanProDesktop/Android
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  const isAuthPage =
    pathname.startsWith("/desktop-login") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes("_next") ||
    pathname.includes("favicon.ico");

  const isProtectedRoute =
    pathname.startsWith("/dashboards") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/admin");

  // Protect internal routes universally
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Redirect authenticated users away from login pages
  if (session && (pathname === "/desktop-login" || pathname === "/signin")) {
    return NextResponse.redirect(new URL("/dashboards", request.url));
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
      `https://${host.replace("www.", "")}${pathname}`,
    );
  }

  if (host === PRIMARY_HOST || isLocalHost || host === AUTH_DOMAIN) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/dashboards") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/admin")
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
      res.headers.set("x-requested-subdomain", subdomain);
      res.headers.set("x-requested-host", host);
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
    res.headers.set("x-requested-host", host);
    res.headers.set("x-rewritten-slug", normalizedHost);
    return res;
  }

  return NextResponse.next();
}
