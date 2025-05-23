// File: lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import prisma from "../server/db/prismadb"; // Adjust path as needed
import { randomBytes, randomUUID } from "crypto";

// Utility to find any existing user across multiple models
async function findExistingUserByEmail(email: string) {
  return (
    (await prisma.consumer.findUnique({ where: { email } })) ||
    (await prisma.salesAgent.findUnique({ where: { email } })) ||
    (await prisma.client.findUnique({ where: { email } })) ||
    (await prisma.user.findUnique({ where: { email } }))
  );
}

// Create a new user fallback
async function createDefaultUser({ email, name, image }: { email: string; name?: string; image?: string }) {
  return prisma.user.create({
    data: {
      email,
      name: name ?? "",
      role: "ADMIN",
      image,
    },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/shop/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: { email: credentials.email, password: credentials.password } }),
            }
          );
          if (!response.ok) return null;
          const { body } = await response.json();
          if (!body?.id || !body.email) return null;
          return {
            id: body.id,
            name: body.name,
            email: body.email,
            phone: body.phone,
            username: body.username,
            bio: body.bio,
            address: body.address,
            role: body.role,
            profilePicture: body.profilePicture,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    generateSessionToken: () => randomUUID?.() ?? randomBytes(32).toString("hex"),
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await findExistingUserByEmail(user.email);
        if (!existing) {
          await createDefaultUser({ email: user.email, name: user.name!, image: user.image! });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: (user as any).phone,
          username: (user as any).username,
          bio: (user as any).bio,
          address: (user as any).address,
          role: (user as any).role,
          profilePicture: (user as any).profilePicture || (user as any).image,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, {
          id: token.id,
          name: token.name,
          email: token.email,
          phone: token.phone,
          username: token.username,
          bio: token.bio,
          address: token.address,
          role: token.role,
          profilePicture: token.profilePicture,
        });
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};

// Helper for App Router
export const getAuthSession = () => getServerSession(authOptions);


// File: app/api/auth/[...nextauth]/route.ts
// import NextAuth from "next-auth/next";
// import { authOptions } from "../../../lib/auth";

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };



// export async function requireAuth(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user) {
//     return new Response(JSON.stringify({ message: "Unauthorized" }), {
//       status: 401,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
//   return session.user;
// }
