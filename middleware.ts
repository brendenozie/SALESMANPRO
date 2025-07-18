// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import prisma  from "@/server/db/prismadb";           // your prisma client

// 1) Your primary host — update to your own production app domain:
const PRIMARY_HOST = "app.your-production-domain.com";

// 2) Paths requiring session-based auth
const protectedPaths = [
  // "/admin",
  // "/clients",
  // "/agents",
  // "/users",
  // "/shop/profile",
  // "/destinations",
  // "/addcity",
  // "/adddestination",
  // "/addhotel",
  "/addtravelstyle",
];

// 3) API key header name and secret env var
const API_KEY_HEADER = process.env.NEXT_PUBLIC_API_KEY_HEADER!;
const API_SECRET     = process.env.NEXT_PUBLIC_API_SECRET!;

export const config = {
  matcher: [
    // run on all API calls + protected app routes
    "/api/:path*",
    ...protectedPaths,
  ],
};

export default async function middleware(request: NextRequest, ev: NextFetchEvent) {
  const url     = request.nextUrl.clone();
  const pathname = url.pathname;
  const host     = request.headers.get("host")?.split(":")[0] || "";

  //
  // ---- CUSTOM DOMAIN RESOLUTION ----
  //
  if (host && host !== PRIMARY_HOST) {
    // Try to find a company by this custom domain
    const company = await prisma.company.findUnique({
      where: { domain: host },
      select: { id: true },
    });

    if (company) {
      // inject company ID for your pages / layouts / data loading
      const res = NextResponse.next();
      res.headers.set("x-company-id", company.id);
      return res;
    }
    // if no company, just fall through (404s or public pages will handle it)
  }

  //
  // ---- API KEY PROTECTION ----
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
  // ---- SESSION-BASED PROTECTION FOR APP ROUTES ----
  //
  if (protectedPaths.some((p) => pathname.startsWith(p))) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // redirect to sign-in
      url.pathname = "/signin";
      url.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(url);
    }

    // optional: role-based allow/deny
    const role = token.role?.toLowerCase();
    if (
      ["admin", "senior", "junior"].includes(role!) ||
      (role === "agent" && pathname.startsWith("/agents")) ||
      (role === "client" && pathname.startsWith("/clients"))
    ) {
      return NextResponse.next();
    }

    // forbidden
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  // Default: continue
  return NextResponse.next();
}
