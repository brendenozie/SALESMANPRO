import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// Paths requiring session-based auth
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

// API key header name and secret env var
const API_KEY_HEADER = process.env.NEXT_PUBLIC_API_KEY_HEADER;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET_KEY!;

export const config = {
  // Apply middleware to all app routes and API routes
  matcher: [
    '/api/:path*',
    ...protectedPaths.map((p) => `${p}`),
  ],
};

export default async function middleware(request: NextRequest, ev: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // 1. API routes: enforce x-api-key
  // if (pathname.startsWith('/api/')) {
  //   if (!API_KEY_HEADER) {
  //     return new NextResponse(
  //       JSON.stringify({ error: 'Server misconfiguration: API key header not set' }),
  //       { status: 500, headers: { 'Content-Type': 'application/json' } }
  //     );
  //   }
  //   const apiKey = request.headers.get(API_KEY_HEADER as string);
  //   if (apiKey !== API_SECRET) {
  //     return new NextResponse(
  //       JSON.stringify({ error: 'Unauthorized' }),
  //       { status: 403, headers: { 'Content-Type': 'application/json' } }
  //     );
  //   }
  //   return NextResponse.next();
  // }

  // 2. Protected app routes: session-based
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    // Not signed in
    if (!token) {
      const url = new URL(`/signin`, request.url);
      url.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(url);
    }
    // Role-based rewrite
    const role = token.role?.toLocaleLowerCase();
    if (role === 'admin') {
      return NextResponse.next();
    }
    if (role === 'junior') {
      return NextResponse.next();
    }
    if (role === 'senior') {
      return NextResponse.next();
    }
    if (role === 'agent' && pathname.startsWith('/agents')) {
      return NextResponse.next();
    }
    if (role === 'client' && pathname.startsWith('/clients')) {
      return NextResponse.next();
    }
    // Forbidden
    return NextResponse.rewrite(new URL('/403', request.url));
  }

  // Default: continue
  return NextResponse.next();
}
