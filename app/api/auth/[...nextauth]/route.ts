import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

<<<<<<< HEAD
// CORRECTED: App Router expects the second argument to be a context object (ctx), not res
=======
>>>>>>> 6d91d730 (updated auth)
async function handler(req: NextRequest, ctx: { params: any }) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";

<<<<<<< HEAD
  // Instantiate the dynamic auth handler, then execute it with the App Router arguments
=======
  // Instantiate the auth handler dynamically with the host, then invoke with App Router arguments
>>>>>>> 6d91d730 (updated auth)
  const authHandler = NextAuth(authOptions(host));
  return authHandler(req, ctx);
}

export { handler as GET, handler as POST };
