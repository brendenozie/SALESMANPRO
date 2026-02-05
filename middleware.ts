// // middleware.ts
// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// Your app’s main host
const PRIMARY_HOST = "salesmanpro.site";
const AUTH_DOMAIN = "auth.salesmanpro.site"; // Central auth domain

// Protected paths that require authentication
const protectedPaths = [
  "/admin",
  "/clients",
  "/agents",
  "/users",
  "/dashboards",
  "/stores",
];

// Middleware config
export const config = {
  matcher: [
    "/((?!_next/|.*\\..*).*)", // all paths except _next/* and static assets
  ],
};

export default async function middleware(request: NextRequest, ev: NextFetchEvent) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  // const host = request.headers.get("host")?.split(":")[0] || "";
  // const origin = request.headers.get("origin");
  
// const url = request.nextUrl.clone();
//   const { pathname } = url;
  const userAgent = request.headers.get("user-agent") || "";
  
  // 1. Detect if it's our Desktop App
  const isDesktop = userAgent.includes("SalesmanProDesktop");

  // 2. Check for Next-Auth Session
  // const session = await getToken({ req: request });

  // We explicitly pass the secret and handle both secure and non-secure cookie names
  const session = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // This ensures it works on both localhost (http) and production (https)
    cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
  });

  // 1. PREVENT REDIRECT LOOPS
  // Only redirect to login if we are NOT already there and NOT in an auth API call
  const isAuthPage = pathname.startsWith("/desktop-login") || pathname.startsWith("/api/auth");
  
  if (isDesktop && !session && !isAuthPage) {
    return NextResponse.redirect(new URL("/desktop-login", request.url));
  }

  // 2. ESCAPE FROM LOGIN PAGE
  // If we are on the desktop, have a session, and are sitting on the login page -> Go to Dashboard
  if (isDesktop && session && pathname === "/desktop-login") {
    return NextResponse.redirect(new URL("/dashboards", request.url));
  }
  // 3. DESKTOP REDIRECT LOGIC
  // If user is on desktop, NOT logged in, and NOT already on the desktop-login page
  // Only redirect if NOT already on the desktop-login page
  // if (isDesktop && !session && pathname !== "/desktop-login") {
  //   return NextResponse.redirect(new URL("/desktop-login", request.url));
  // }

  // // 🔥 FIX 2: If logged in on desktop, don't stay on the login page
  // if (isDesktop && session && pathname === "/desktop-login") {
  //   return NextResponse.redirect(new URL("/dashboards", request.url));
  // }

  // ---- REST OF YOUR EXISTING MIDDLEWARE LOGIC ----
  const host = request.headers.get("host")?.split(":")[0] || "";
    
  // ---- 1. API & CORS HANDLING ----
   if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // if (pathname.startsWith("/api/")) {
  //   const responseHeaders = new Headers();
  //   if (origin) {
  //     // Allow any subdomain of salesmanpro.site or any origin
  //     responseHeaders.set("Access-Control-Allow-Origin", origin);
  //   }
  //   responseHeaders.set("Access-Control-Allow-Credentials", "true");
  //   responseHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  //   responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  //   // Preflight request
  //   if (request.method === "OPTIONS") {
  //     return new NextResponse(null, { status: 204, headers: responseHeaders });
  //   }

  //   // Attach headers to the final response
  //   const res = NextResponse.next();
  //   responseHeaders.forEach((value, key) => res.headers.set(key, value));
  //   return res;
  // }

  // ---- 2. WWW REDIRECT ----
  if (host.startsWith("www.")) {
    return NextResponse.redirect(`https://${host.replace("www.", "")}${pathname}`);
  }

  // ---- 3. PRIMARY HOST & LOCALHOST HANDLING ----
  // Serve salesmanpro.site and localhost:3000 requests normally
  if (
    host === PRIMARY_HOST ||
    host === "127.0.0.1" ||
    host === "localhost"
  ) {
    const fullHost = request.headers.get("host");

    // Local dev (localhost:3000) or Main app (salesmanpro.site)
    if (fullHost === "127.0.0.1:3000" || fullHost === "localhost:3000" || host === PRIMARY_HOST) {
      return NextResponse.next();
    }
  }

  if(pathname.startsWith("/signin") || pathname.startsWith("/signup") || pathname.startsWith("/dashboards") || pathname.startsWith("/stores") || pathname.startsWith("/admin")){
    return NextResponse.next();
  }
  
  // ---- 4. AUTH DOMAIN HANDLING ----
  // Allow auth.salesmanpro.site to resolve normally
  if (host === AUTH_DOMAIN) {
    return NextResponse.next();
  }
  
  // ---- 5. SUBDOMAIN HANDLING (slug.salesmanpro.site) ----
  if (host.endsWith(".salesmanpro.site") || host.endsWith(".test")) {
    const subdomain = host
      .replace(".salesmanpro.site", "")
      .replace(".test", "");

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

  // ---- 6. CUSTOM DOMAIN TENANT HANDLING (flourishhub.co.ke) ----
  // This is the correct logic for your custom domains.
  if (
    host &&
    host !== PRIMARY_HOST &&
    !host.endsWith(".salesmanpro.site") &&
    !host.startsWith("127.0.0.1") &&
    !host.startsWith("localhost")
  ) {
    // Normalize host
    const normalizedHost = host.replace(/^www\./, "").toLowerCase();

    // Derive tenant slug (first part before first dot)

    const identifier = host; // e.g. "flourishhub.co.ke"

    url.pathname = pathname === "/" || pathname === ""
        ? `/site/${identifier}`
        : `/site/${identifier}${pathname}`;


    const res = NextResponse.rewrite(url);
    res.headers.set("x-requested-host", host);
    res.headers.set("x-original-path", pathname);
    res.headers.set("x-rewritten-slug", normalizedHost);
    
    return res;
  }
  
  // ---- 7. DEFAULT ----
  // All other requests
  return NextResponse.next();
}
