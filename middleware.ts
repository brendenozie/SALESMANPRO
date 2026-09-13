import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { AUTH_HOST, classifyHost } from "@/lib/auth/domain";
import { canAccessDashboard } from "@/lib/auth/authorization";
import { attachAuthContextFromRequest } from "@/lib/auth/context";
import { getTrustedHost, getTrustedProtocol } from "@/lib/requestIdentity";

const PRIMARY_HOST_NAME = "salesmanpro.site";

export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

function tokenCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

const PUBLIC_AUTH_PATHS = [
  "/signin",
  "/signup",
  "/verify-email",
  "/unauthorized",
  "/logout",
  "/desktop-login",
  "/api/auth",
  "/api/register",
];

function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith("/api/auth"),
  );
}

const OPERATOR_PREFIXES = [
  "/dashboards",
  "/stores",
  "/admin",
  "/clients",
  "/agents",
  "/users",
];

function isOperatorPath(pathname: string) {
  return OPERATOR_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default async function middleware(
  request: NextRequest,
  ev: NextFetchEvent,
) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const userAgent = request.headers.get("user-agent") || "";

  const isDesktop =
    userAgent.includes("SalesmanProDesktop") ||
    userAgent.includes("SalesmanProAndroid");

  const host = getTrustedHost(request);
  const fullHost = request.headers.get("host") || host;
  const proto = getTrustedProtocol(request);
  const isLocalHost =
    host === "localhost" || host === "127.0.0.1" || fullHost.endsWith(":3000");

  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    const res = NextResponse.next();
    await attachAuthContextFromRequest(request, res);
    return res;
  }

  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-requested-host", host);
    requestHeaders.set("x-forwarded-proto", proto);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (host.startsWith("www.")) {
    return NextResponse.redirect(
      `https://${host.replace("www.", "")}${pathname}${url.search}`,
    );
  }

  let session = null;
  const needsToken =
    isDesktop ||
    isOperatorPath(pathname) ||
    (classifyHost(host).kind === "hub" && pathname === "/");

  if (needsToken) {
    session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET!,
      cookieName: tokenCookieName(),
    });
  }

  const isAuthPage =
    pathname.startsWith("/desktop-login") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes("_next") ||
    pathname.includes("favicon.ico");

  if (isDesktop && !session && !isAuthPage) {
    return NextResponse.redirect(new URL("/desktop-login", request.url));
  }

  if (isDesktop && session && pathname === "/desktop-login") {
    return NextResponse.redirect(new URL("/dashboards", request.url));
  }

  const classified = classifyHost(host);
  const isHub = classified.kind === "hub" || isLocalHost || host === AUTH_HOST;

  if (isHub && isOperatorPath(pathname) && !isPublicAuthPath(pathname)) {
    if (!session) {
      if (isLocalHost && pathname.includes("/website-builder")) {
        return NextResponse.next();
      }
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      const canonicalCallbackUrl = isLocalHost
        ? request.url
        : `${proto}://${host}${pathname}${url.search}`;
      authUrl.searchParams.set("callbackUrl", canonicalCallbackUrl);
      return NextResponse.redirect(authUrl);
    }
    if (session.emailVerified === false) {
      const verifyUrl = new URL("/verify-email", request.url);
      verifyUrl.searchParams.set("email", String(session.email || ""));
      return NextResponse.redirect(verifyUrl);
    }
    if (session.isActive === false) {
      return NextResponse.redirect(new URL("/unauthorized?reason=forbidden", request.url));
    }
    if (
      !pathname.startsWith("/stores") &&
      !canAccessDashboard({
        role: session.role as string,
        companyId: session.companyId as string | undefined,
        emailVerified: session.emailVerified as boolean | null,
        isActive: session.isActive as boolean | null,
        hasTenantAccess: session.hasTenantAccess as boolean | undefined,
      })
    ) {
      return NextResponse.redirect(new URL("/unauthorized?reason=forbidden", request.url));
    }
  }

  if (
    isHub &&
    pathname === "/" &&
    session &&
    canAccessDashboard({
      role: session.role as string,
      companyId: session.companyId as string | undefined,
      emailVerified: session.emailVerified as boolean | null,
      isActive: session.isActive as boolean | null,
      hasTenantAccess: session.hasTenantAccess as boolean | undefined,
    })
  ) {
    return NextResponse.redirect(new URL("/dashboards", request.url));
  }

  if (host === PRIMARY_HOST_NAME || isLocalHost || host === AUTH_HOST) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/dashboards") ||
    pathname.startsWith("/stores") ||
    pathname === "/admin"
  ) {
    if (pathname.startsWith("/stores")) {
      return NextResponse.redirect(
        new URL(`https://${PRIMARY_HOST_NAME}${pathname}${url.search}`),
      );
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (host.endsWith(".salesmanpro.site")) {
    const subdomain = host.replace(".salesmanpro.site", "");
    if (subdomain && subdomain !== "www") {
      if (!pathname.startsWith("/site/")) {
        url.pathname =
          pathname === "/" || pathname === ""
            ? `/site/${subdomain}`
            : `/site/${subdomain}${pathname}`;
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-requested-subdomain", subdomain);
      requestHeaders.set("x-requested-host", host);

      const res = NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
      res.headers.set("x-requested-subdomain", subdomain);
      res.headers.set("x-requested-host", host);
      return res;
    }
  }

  if (
    host &&
    host !== PRIMARY_HOST_NAME &&
    !host.endsWith(".salesmanpro.site") &&
    !isLocalHost
  ) {
    const normalizedHost = host.replace(/^www\./, "").toLowerCase();

    if (!pathname.startsWith("/site/")) {
      url.pathname =
        pathname === "/" || pathname === ""
          ? `/site/${normalizedHost}`
          : `/site/${normalizedHost}${pathname}`;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-requested-host", host);
    requestHeaders.set("x-rewritten-slug", normalizedHost);

    const res = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    res.headers.set("x-requested-host", host);
    res.headers.set("x-rewritten-slug", normalizedHost);
    return res;
  }

  return NextResponse.next();
}
