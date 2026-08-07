import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, res: unknown) {
  const headerList = await headers();
  const host = headerList.get("host") || "";

  // @ts-ignore - NextAuth App Router dynamic wrapper compatibility
  return await NextAuth(req, res, authOptions(host));
}

export { handler as GET, handler as POST };
