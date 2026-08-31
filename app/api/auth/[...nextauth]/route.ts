import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, res: any) {
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const cookieHeader = headerList.get("cookie") || "";

  return await NextAuth(
    req,
    res,
    authOptions({
      host,
      cookieHeader,
      requestUrl: req.url,
    }),
  );
}

export { handler as GET, handler as POST };
