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
  const origin = request.headers.get("origin");

  // ✅ 1. Handle CORS preflight requests
  if (pathname.startsWith("/api/")) {
    const responseHeaders = new Headers();
    if (origin) {
      // Allow any subdomain of salesmanpro.site automatically
      // if (
      //   origin.endsWith(".salesmanpro.site") //||
      //   // allowedOrigins.includes(origin)
      // ) {
        responseHeaders.set("Access-Control-Allow-Origin", origin);
      // }
    }

    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    responseHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    // If it's a preflight request — respond immediately
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: responseHeaders });
    }

    // Otherwise, continue and attach headers to the final response
    const res = NextResponse.next();
    responseHeaders.forEach((value, key) => res.headers.set(key, value));
    return res;
  }

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
  
  if (
    host === PRIMARY_HOST ||
    host === "127.0.0.1" ||
    host === "localhost"
  ) {
    // If the local request includes a port, handle it too.
    const fullHost = request.headers.get("host");
    if (fullHost === "127.0.0.1:3000" || fullHost === "localhost:3000") {
        // Local dev host paths resolve natively (e.g., 127.0.0.1:3000/ goes to /)
        return NextResponse.next();
    }

    // Primary host paths resolve natively.
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

  
  //other domain name
  // ---- CUSTOM DOMAIN HANDLING (PASS HOST, NO REWRITE) ----
if (
  host &&
  host !== PRIMARY_HOST &&
  !host.endsWith(".salesmanpro.site") &&
  host !== "127.0.0.1" &&
  host !== "localhost" &&
  host !== "localhost:3000"
) {
  // Simply pass through the request but include identifying headers
  const res = NextResponse.next();

  // Pass host and original path so the app can resolve tenant dynamically
  res.headers.set("x-requested-host", host);
  res.headers.set("x-original-path", pathname);

  return res;
}

  // if (host && host !== PRIMARY_HOST && !host.endsWith(".salesmanpro.site") && host !== "127.0.0.1" && host !== "localhost" && host !== "localhost:3000") {
  //   url.pathname = `/site/${pathname}`;
  //   const res = NextResponse.rewrite(url);
  //   res.headers.set("x-requested-host", host);
  //   res.headers.set("x-original-path", pathname);
  //   return res;
  // }

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
