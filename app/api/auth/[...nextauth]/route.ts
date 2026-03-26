// File: app/api/auth/[...nextauth].ts
// File: app/api/auth/[...nextauth]/route.ts (Ensure it is .ts or .js)
import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { headers } from "next/headers";

const handler = async (req: Request) => {
  const host = (await headers()).get("host") || "";
  return NextAuth(getAuthOptions(host))(req);
};

export { handler as GET, handler as POST };

// import NextAuth from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
