import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

<<<<<<< HEAD
<<<<<<< HEAD
// CORRECTED: App Router expects the second argument to be a context object (ctx), not res
=======
>>>>>>> 6d91d730 (updated auth)
=======
>>>>>>> 6d91d730edb73617407746adabe700533617e808
async function handler(req: NextRequest, ctx: { params: any }) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";

<<<<<<< HEAD
<<<<<<< HEAD
  // Instantiate the dynamic auth handler, then execute it with the App Router arguments
=======
  // Instantiate the auth handler dynamically with the host, then invoke with App Router arguments
>>>>>>> 6d91d730 (updated auth)
=======
  // Instantiate the auth handler dynamically with the host, then invoke with App Router arguments
>>>>>>> 6d91d730edb73617407746adabe700533617e808
  const authHandler = NextAuth(authOptions(host));
  return authHandler(req, ctx);
}

export { handler as GET, handler as POST };
