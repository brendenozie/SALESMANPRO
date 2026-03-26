// File: app/api/auth/[...nextauth].ts
// File: app/api/auth/[...nextauth]/route.ts (Ensure it is .ts or .js)
// File: app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } },
) {
  const host = (await headers()).get("host") || "";

  // We pass the host into our dynamic options function
  const options = authOptions(host);

  // @ts-ignore - NextAuth types can be finicky with the App Router handler wrapper
  return await NextAuth(req, ctx, options);
}

export { handler as GET, handler as POST };
// import NextAuth from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
