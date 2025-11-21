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
  const host = request.headers.get("host")?.split(":")[0] || "";
  const origin = request.headers.get("origin");
  

  // ---- 1. API & CORS HANDLING ----
  if (pathname.startsWith("/api/")) {
    const responseHeaders = new Headers();
    if (origin) {
      // Allow any subdomain of salesmanpro.site or any origin
      responseHeaders.set("Access-Control-Allow-Origin", origin);
    }
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    responseHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    // Preflight request
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: responseHeaders });
    }

    // Attach headers to the final response
    const res = NextResponse.next();
    responseHeaders.forEach((value, key) => res.headers.set(key, value));
    return res;
  }

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
    // "flourishhub.co.ke" -> "flourishhub"
    const slug = normalizedHost.split(".")[0]; 

    // Build the internal rewrite path for Next.js
    
    if (pathname === "/" || pathname === "") {
      url.pathname = `/site/${slug}`;
    } else {
      // "/publicspeaking/id" -> "/site/flourishhub/publicspeaking/id"
      url.pathname = `/site/${slug}/${pathname}`;
    }

    const res = NextResponse.rewrite(url);
    res.headers.set("x-requested-host", host);
    res.headers.set("x-original-path", pathname);
    res.headers.set("x-rewritten-slug", slug);
    
    return res;
  }
  
  // ---- 7. DEFAULT ----
  // All other requests
  return NextResponse.next();
}
// import { getToken } from "next-auth/jwt";
// import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// // Your app’s main host
// const PRIMARY_HOST = "salesmanpro.site";//app.your-production-domain.com
// const AUTH_DOMAIN = "auth.salesmanpro.site"; // Central auth domain

// // Protected paths that require authentication
// const protectedPaths = [
//   "/admin",
//   "/clients",
//   "/agents",
//   "/users",
// ];

// // API key protection
// const API_KEY_HEADER = process.env.NEXT_PUBLIC_API_KEY_HEADER!;
// const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET!;

// // Middleware config

// // Match everything except Next internals (_next) and static files
// export const config = {
//   matcher: [
//     "/((?!_next/|.*\\..*).*)", // all paths except _next/* and static assets
//   ],
// };

// export default async function middleware(request: NextRequest, ev: NextFetchEvent) {
//   // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   const url = request.nextUrl.clone();
//   const pathname = url.pathname;
//   const host = request.headers.get("host")?.split(":")[0] || "";
//   const origin = request.headers.get("origin");

//   // Try to get token from cookies
//   // const token = req.cookies.get("session-token")?.value;

//   // // If token passed in URL (after login)
//   // const tokenFromQuery = searchParams.get("token");
//   // if (tokenFromQuery) {
//   //   const response = NextResponse.redirect(new URL("/", req.url));
//   //   response.cookies.set("session-token", tokenFromQuery, {
//   //     httpOnly: true,
//   //     secure: true,
//   //     path: "/",
//   //     sameSite: "lax",
//   //   });
//   //   return response;
//   // }

//   // // Verify the token if available
//   // if (token) {
//   //   const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET! });
//   //   if (decoded) return NextResponse.next();
//   // }

//   // ✅ 1. Handle CORS preflight requests
//   // Allow public routes
//   // if (
//   //     pathname.startsWith("/_next") ||
//   //     pathname.startsWith("/api") ||
//   //     pathname.startsWith("/auth") ||
//   //     pathname.startsWith("/public") ||
//   //     pathname.startsWith("/site") ||
//   //     pathname === "/"
//   //   ) {
//   //     return NextResponse.next();
//   //   }

//     // If not signed in, redirect to centralized auth page
//     // if (!token) {
//     //   const callbackUrl = encodeURIComponent(origin + pathname);
//     //   return NextResponse.redirect(
//     //     `https://auth.salesmanpro.site/auth/signin?callback=${callbackUrl}`
//     //   );
//     // }

  
//   if (pathname.startsWith("/api/")) {
//     const responseHeaders = new Headers();
//     if (origin) {
//       // Allow any subdomain of salesmanpro.site automatically
//       // if (
//       //   origin.endsWith(".salesmanpro.site") //||
//       //   // allowedOrigins.includes(origin)
//       // ) {
//         responseHeaders.set("Access-Control-Allow-Origin", origin);
//       // }
//     }

//     responseHeaders.set("Access-Control-Allow-Credentials", "true");
//     responseHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//     responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

//     // If it's a preflight request — respond immediately
//     if (request.method === "OPTIONS") {
//       return new NextResponse(null, { status: 204, headers: responseHeaders });
//     }

//     // Otherwise, continue and attach headers to the final response
//     const res = NextResponse.next();
//     responseHeaders.forEach((value, key) => res.headers.set(key, value));
//     return res;
//   }

//   if (host.startsWith("www.")) {
//     return NextResponse.redirect(`https://${host.replace("www.", "")}${pathname}`);
//   }

//   //
//   // ---- 3. API KEY PROTECTION ----
//   //
//   // if (pathname.startsWith("/api/")) {
//   //   if (!API_KEY_HEADER) {
//   //     return new NextResponse(
//   //       JSON.stringify({ error: "Server misconfiguration: API key header not set" }),
//   //       { status: 500, headers: { "Content-Type": "application/json" } }
//   //     );
//   //   }

//   //   const apiKey = request.headers.get(API_KEY_HEADER);
//   //   if (apiKey !== API_SECRET) {
//   //     return new NextResponse(
//   //       JSON.stringify({ error: "Unauthorized" }),
//   //       { status: 403, headers: { "Content-Type": "application/json" } }
//   //     );
//   //   }

//   //   return NextResponse.next();
//   // }


//   //
//   // ---- 1. CUSTOM DOMAIN HANDLING ----
//   //
//   // Corrected Logic to meet your stated goals:
//   // PRIMARY_HOST does NOT rewrite to /site, but local hosts DO.

//   // 1. PRIMARY HOST HANDLING (Routes to root /)
  
//   // if (
//   //   host === PRIMARY_HOST ||
//   //   host === "127.0.0.1" ||
//   //   host === "localhost"
//   // ) {
//   //   // If the local request includes a port, handle it too.
//   //   const fullHost = request.headers.get("host");
//   //   if (fullHost === "127.0.0.1:3000" || fullHost === "localhost:3000") {
//   //       // Local dev host paths resolve natively (e.g., 127.0.0.1:3000/ goes to /)
//   //       return NextResponse.next();
//   //   }

//   //   // Primary host paths resolve natively.
//   //   return NextResponse.next();
//   // }

//   // ---- 1. PRIMARY HOST & LOCALHOST HANDLING ----
//   if (
//     host === PRIMARY_HOST ||
//     host === "127.0.0.1" ||
//     host === "localhost"
//   ) {
//     const fullHost = request.headers.get("host");

//     // Local dev (localhost:3000) → serve as-is
//     if (fullHost === "127.0.0.1:3000" || fullHost === "localhost:3000") {
//       return NextResponse.next();
//     }

//     // Main production app (salesmanpro.site) → serve normally
//     return NextResponse.next();
//   }

//   // ---- 2. CUSTOM DOMAIN TENANT HANDLING (fully dynamic) ----
//   // Handles any custom domain: e.g. flourishhub.co.ke, ghuba.shop, brightacademy.org, etc.
//   if (
//     host &&
//     host !== PRIMARY_HOST &&
//     !host.endsWith(".salesmanpro.site") &&
//     !host.startsWith("127.0.0.1") &&
//     !host.startsWith("localhost") && 
//     !pathname.startsWith("/api/")
//   ) {
//     // Normalize host
//     const normalizedHost = host.replace(/^www\./, "").toLowerCase();

//     // Derive tenant slug (first part before first dot)
//     const slug = normalizedHost.split(".")[0];

//     // Build the internal rewrite path for Next.js
//     if (pathname === "/" || pathname === "") {
//       url.pathname = `/site/${slug}`;
//     } else {
//       url.pathname = `/site/${slug}${pathname}`;
//     }

//     // Create the rewrite response
//     const res = NextResponse.rewrite(url);

//     // Attach helpful debugging headers
//     res.headers.set("x-requested-host", host);
//     res.headers.set("x-original-path", pathname);
//     res.headers.set("x-rewritten-slug", slug);

//     return res;
//   }

//   // 2. LOCAL HOST HANDLING (Rewrites to /site)
//   if (
//     host === "127.0.0.1" ||
//     host === "127.0.0.1:3000" ||
//     host === "localhost" ||
//     host === "localhost:3000"
//   ) {
//     // Logic from your provided code is kept for local hosts:
//     if (!pathname.startsWith("/site")) {
//       if (pathname === "/" || pathname === "") {
//         url.pathname = `/site`; // local.com/ → /site
//       } else {
//         url.pathname = `/site${pathname}`; // local.com/about → /site/about
//       }
//       return NextResponse.rewrite(url);
//     }
//     else {
//       return NextResponse.next();
//     }
//   }

  
//   //other domain name
//   // ---- CUSTOM DOMAIN HANDLING (PASS HOST, NO REWRITE) ----
//   // ---- CUSTOM DOMAIN HANDLING: rewrite into /site/[slug] but pass original host ----
//   if (
//     host &&
//     host !== PRIMARY_HOST &&
//     !host.endsWith(".salesmanpro.site") &&
//     host !== "127.0.0.1" &&
//     host !== "localhost" &&
//     host !== "localhost:3000"
//   ) {
//     // Normalize host for use in path (avoid colons/ports)
//     const normalizedHost = host.replace(/^www\./, "").toLowerCase();

//     // We rewrite to /site/<normalizedHost> so the request lands in /site/[slug]
//     // The layout will prioritize x-requested-host when resolving the tenant.
//     if (pathname === "/" || pathname === "") {
//         url.pathname = `/site/${normalizedHost}`;
//     } else {
//       // keep inner path after the root — /about -> /site/ghuba.shop/about
//       url.pathname = `/site/${normalizedHost}${pathname}`;
//     }

//     const res = NextResponse.rewrite(url);

//     // Important: pass original host so layout can resolve tenant from domain
//     res.headers.set("x-requested-host", host);
//     // Also useful: the original path requested on the custom domain
//     res.headers.set("x-original-path", pathname);
//     // Optional: expose the rewritten slug (for debugging/logging)
//     res.headers.set("x-rewritten-slug", normalizedHost);

//     return res;
//   }


//   // if (host && host !== PRIMARY_HOST && !host.endsWith(".salesmanpro.site") && host !== "127.0.0.1" && host !== "localhost" && host !== "localhost:3000") {
//   //   url.pathname = `/site/${pathname}`;
//   //   const res = NextResponse.rewrite(url);
//   //   res.headers.set("x-requested-host", host);
//   //   res.headers.set("x-original-path", pathname);
//   //   return res;
//   // }

//   // ---- 2. SUBDOMAIN HANDLING (slug.salesmanpro.site OR slug.localhost) ----
//   if (
//     host.endsWith(".salesmanpro.site") ||
//     // host.endsWith(".localhost") ||
//     // host.endsWith(".127.0.0.1") ||
//     host.endsWith(".test")
//   ) {
    
//     if (host === AUTH_DOMAIN) {
//         // Allow /auth/signin and other auth routes to resolve natively
//         return NextResponse.next();
//     }

//     const subdomain = host
//       .replace(".salesmanpro.site", "")
//       // .replace(".localhost", "")
//       // .replace(".127.0.0.1", "")
//       .replace(".test", "");

//       // If accessing just subdomain root → redirect to /site/[slug]
//     if (subdomain && subdomain !== "www") {
//       if (pathname === "/" || pathname === "") {
//         url.pathname = `/site/${subdomain}`;
//       } else {
//         url.pathname = `/site/${subdomain}${pathname}`;
//       }

//       const res = NextResponse.rewrite(url);
//       res.headers.set("x-requested-subdomain", subdomain);
//       res.headers.set("x-original-path", pathname);
//       res.headers.set("x-requested-host", host);
//       return res;
//     }
//   }

//   //
//   // ---- 4. SESSION-BASED PROTECTION ----
//   //
//   // if (protectedPaths.some((p) => pathname.startsWith(p))) {
//   //   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//   //   if (!token) {
//   //     url.pathname = "/signin";
//   //     url.searchParams.set("callbackUrl", request.url);
//   //     return NextResponse.redirect(url);
//   //   }

//   //   const role = token.role?.toLowerCase();
//   //   if (
//   //     ["admin", "senior", "junior"].includes(role!) ||
//   //     (role === "agent" && pathname.startsWith("/agents")) ||
//   //     (role === "client" && pathname.startsWith("/clients"))
//   //   ) {
//   //     return NextResponse.next();
//   //   }

//   //   url.pathname = "/403";
//   //   return NextResponse.rewrite(url);
//   // }

//   //
//   // ---- 5. DEFAULT ----
//   //

//   return NextResponse.next();
// }
