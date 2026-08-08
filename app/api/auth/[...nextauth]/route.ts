import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// CORRECTED: App Router expects the second argument to be a context object (ctx), not res
async function handler(req: NextRequest, ctx: { params: any }) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";

  // Instantiate the dynamic auth handler, then execute it with the App Router arguments
  const authHandler = NextAuth(authOptions(host));
  return authHandler(req, ctx);
}

export { handler as GET, handler as POST };
