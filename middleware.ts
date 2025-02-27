// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPaths = ["/XDH4U3IJKE20","/hotels","/cities","/users","/destinations","/addcity","/adddestination","/addhotel","/addtravelstyle"];
  const matchesProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  if (matchesProtectedPath) {
    const token = await getToken({ req: request });
    if (!token) {
      const url = new URL(`/signin`, request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    if (token.role !== "admin") {
      const url = new URL(`/403`, request.url);
      return NextResponse.rewrite(url);
    }
    if (token.role === "admin") {
      const url = new URL(`/admin`, request.url);
      return NextResponse.rewrite(url);
    }
    
    if (token.role === "agent") {
      const url = new URL(`/agent`, request.url);
      return NextResponse.rewrite(url);
    }
    
    if (token.role === "clients") {
      const url = new URL(`/clients`, request.url);
      return NextResponse.rewrite(url);
    }

  }
  return NextResponse.next();
}