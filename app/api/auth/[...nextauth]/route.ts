import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// 1. Add the context parameter here
async function createHandler(request: NextRequest, context: { params: any }) {
  // Gather the headers available in the App Router environment so we can
  // pass the dynamic context into authOptions (host, cookie header, request URL).
  const headerList = await headers();
  const rawHost = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const host = rawHost.split(":")[0].trim().toLowerCase();
  const rawProto = headerList.get("x-forwarded-proto");
  const proto = rawProto || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const cookieHeader = headerList.get("cookie") || "";

  // Dynamically set NEXTAUTH_URL so OAuth providers receive the exact matching redirect_uri for the active tenant host
  if (host) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }

  const options = authOptions({
    host,
    cookieHeader,
    requestUrl: request.url,
  });

  // NextAuth(...) returns a handler compatible with the App Router that accepts
  // the incoming Request and returns a Response. We construct it per-request so
  // authOptions can use the dynamic context.
  const handler = NextAuth(options as any);

  // 2. Pass context as the second argument
  return handler(request, context);
}

// 3. Receive the context parameter from Next.js in the GET and POST handlers
export async function GET(request: NextRequest, context: { params: any }) {
  return createHandler(request, context);
}

export async function POST(request: NextRequest, context: { params: any }) {
  return createHandler(request, context);
}
