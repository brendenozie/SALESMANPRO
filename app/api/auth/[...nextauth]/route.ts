import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, ctx: { params: any }) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";

  // In App Router, calling NextAuth with just options returns a route handler function
  const authHandler = NextAuth(authOptions(host));

  // Execute the handler with the correct App Router arguments
  return await authHandler(req, ctx);
}

export { handler as GET, handler as POST };
