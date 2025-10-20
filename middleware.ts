// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// Your app’s main host
const PRIMARY_HOST = "salesmanpro.site";//app.your-production-domain.com

// Protected paths that require authentication
const protectedPaths = [
  "/admin",
  "/clients",
  "/agents",
  "/users",
];

// API key protection
const API_KEY_HEADER = process.env.NEXT_PUBLIC_API_KEY_HEADER!;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET!;

// Middleware config

// Match everything except Next internals (_next) and static files
export const config = {
  matcher: [
    "/((?!_next/|.*\\..*).*)", // all paths except _next/* and static assets
  ],
};

export default async function middleware(request: NextRequest, ev: NextFetchEvent) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const host = request.headers.get("host")?.split(":")[0] || "";

  if (host.startsWith("www.")) {
    return NextResponse.redirect(`https://${host.replace("www.", "")}${pathname}`);
  }

  //
  // ---- 3. API KEY PROTECTION ----
  //
  // if (pathname.startsWith("/api/")) {
  //   if (!API_KEY_HEADER) {
  //     return new NextResponse(
  //       JSON.stringify({ error: "Server misconfiguration: API key header not set" }),
  //       { status: 500, headers: { "Content-Type": "application/json" } }
  //     );
  //   }

  //   const apiKey = request.headers.get(API_KEY_HEADER);
  //   if (apiKey !== API_SECRET) {
  //     return new NextResponse(
  //       JSON.stringify({ error: "Unauthorized" }),
  //       { status: 403, headers: { "Content-Type": "application/json" } }
  //     );
  //   }

  //   return NextResponse.next();
  // }


  //
  // ---- 1. CUSTOM DOMAIN HANDLING ----
  //
  // Corrected Logic to meet your stated goals:
  // PRIMARY_HOST does NOT rewrite to /site, but local hosts DO.

  // 1. PRIMARY HOST HANDLING (Routes to root /)
  if (host === PRIMARY_HOST) {
      // If we're on the primary host, we do nothing in the middleware
      // and let the request naturally resolve (to / for root, /path for others).
      // The request for PRIMARY_HOST/ will resolve to /
      return NextResponse.next();
  }

  // 2. LOCAL HOST HANDLING (Rewrites to /site)
  if (
    host === "127.0.0.1" ||
    host === "127.0.0.1:3000" ||
    host === "localhost" ||
    host === "localhost:3000"
  ) {
    // Logic from your provided code is kept for local hosts:
    if (!pathname.startsWith("/site")) {
      if (pathname === "/" || pathname === "") {
        url.pathname = `/site`; // local.com/ → /site
      } else {
        url.pathname = `/site${pathname}`; // local.com/about → /site/about
      }
      return NextResponse.rewrite(url);
    }
    else {
      return NextResponse.next();
    }
  }

// ... rest of the SUBDOMAIN and CUSTOM DOMAIN logic
  // ---- 1. PRIMARY/LOCAL HOST HANDLING (If host is primary, local, or specific local dev hosts) ----
  // if (
  //   host === PRIMARY_HOST ||
  //   host === "127.0.0.1" ||
  //   host === "127.0.0.1:3000" ||
  //   host === "localhost" ||
  //   host === "localhost:3000"
  // ) {
  //   // Logic to redirect the primary host or local host to /site or /site/*
  //   if (!pathname.startsWith("/site")) {
  //     if (pathname === "/" || pathname === "") {
  //       url.pathname = `/site`; // primary_host.com/ → /site
  //     } else {
  //       url.pathname = `/site${pathname}`; // primary_host.com/about → /site/about
  //     }
  //     return NextResponse.rewrite(url);
  //   }
  // }
  // if (
  //   host === PRIMARY_HOST ||
  //   host === "127.0.0.1" ||
  //   host === "127.0.0.1:3000" ||
  //   host === "localhost" ||
  //   host === "localhost:3000"
  // ) {
  //   // ✅ Prevent double /site/site/*
  //   if (!pathname.startsWith("/site")) {
  //     // ✅ Handle root cleanly → redirect to /site
  //     if (pathname === "/" || pathname === "") {
  //       url.pathname = `/site`;
  //     } else {
  //       url.pathname = `/site${pathname}`;
  //     }
  //     return NextResponse.rewrite(url);
  //   }
  // }


  // if (host && host === PRIMARY_HOST && !host.endsWith(".salesmanpro.site") || host === "127.0.0.1:3000" || host === "localhost:3000" ) {
  //   // Instead of Prisma query, forward host for lookup later
  //   // if (pathname === "/") {
  //   //   url.pathname = `/404`;
  //   //   return NextResponse.rewrite(url);
  //   // }

  //   url.pathname = `/site/${pathname}`;
  //   const res = NextResponse.rewrite(url);
  //   res.headers.set("x-requested-host", host);
  //   res.headers.set("x-original-path", pathname); 
  //   return res;
  // }

  //
  // ---- 2. SUBDOMAIN HANDLING (slug.salesmanpro.site OR slug.localhost) ----
  if (
    host.endsWith(".salesmanpro.site") ||
    // host.endsWith(".localhost") ||
    // host.endsWith(".127.0.0.1") ||
    host.endsWith(".test")
  ) {
    const subdomain = host
      .replace(".salesmanpro.site", "")
      // .replace(".localhost", "")
      // .replace(".127.0.0.1", "")
      .replace(".test", "");

      // If accessing just subdomain root → redirect to /site/[slug]
    if (subdomain && subdomain !== "www") {
      if (pathname === "/" || pathname === "") {
        url.pathname = `/site/${subdomain}`;
      } else {
        url.pathname = `/site/${subdomain}${pathname}`;
      }

      const res = NextResponse.rewrite(url);
      res.headers.set("x-requested-subdomain", subdomain);
      res.headers.set("x-original-path", pathname);
      res.headers.set("x-requested-host", host);
      return res;
    }
  }

  //other domain name
  if (host && host !== PRIMARY_HOST && !host.endsWith(".salesmanpro.site") && host !== "127.0.0.1" && host !== "localhost" && host !== "localhost:3000") {
    url.pathname = `/site/${pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("x-requested-host", host);
    res.headers.set("x-original-path", pathname);
    return res;
  }

  //
  // ---- 4. SESSION-BASED PROTECTION ----
  //
  // if (protectedPaths.some((p) => pathname.startsWith(p))) {
  //   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  //   if (!token) {
  //     url.pathname = "/signin";
  //     url.searchParams.set("callbackUrl", request.url);
  //     return NextResponse.redirect(url);
  //   }

  //   const role = token.role?.toLowerCase();
  //   if (
  //     ["admin", "senior", "junior"].includes(role!) ||
  //     (role === "agent" && pathname.startsWith("/agents")) ||
  //     (role === "client" && pathname.startsWith("/clients"))
  //   ) {
  //     return NextResponse.next();
  //   }

  //   url.pathname = "/403";
  //   return NextResponse.rewrite(url);
  // }

  //
  // ---- 5. DEFAULT ----
  //

  return NextResponse.next();
}
