import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, ctx: { params: any }) {
  const headerList = await headers();
  const host = headerList.get("host") || "";

  // Instantiate the auth handler dynamically with the host, then invoke with App Router arguments
  const authHandler = NextAuth(authOptions(host));
  return authHandler(req, ctx);
}

export { handler as GET, handler as POST };
