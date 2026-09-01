import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

async function createHandler(request: Request) {
  // Gather the headers available in the App Router environment so we can
  // pass the dynamic context into authOptions (host, cookie header, request URL).
  const headerList = headers();
  const host = headerList.get("host") || "";
  const cookieHeader = headerList.get("cookie") || "";

  const options = authOptions({
    host,
    cookieHeader,
    requestUrl: request.url,
  });

  // NextAuth(...) returns a handler compatible with the App Router that accepts
  // the incoming Request and returns a Response. We construct it per-request so
  // authOptions can use the dynamic context.
  const handler = NextAuth(options as any);
  // Call the handler with the current Request.
  return handler(request);
}

export async function GET(request: Request) {
  return createHandler(request);
}

export async function POST(request: Request) {
  return createHandler(request);
}
