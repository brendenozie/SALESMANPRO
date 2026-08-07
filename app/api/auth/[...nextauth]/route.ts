import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> | { nextauth: string[] } },
) {
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") || "";

  return NextAuth(req, ctx as any, authOptions(host));
}

export { handler as GET, handler as POST };
