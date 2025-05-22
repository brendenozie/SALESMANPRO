import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import prisma from "../../../server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";

const findExistingUserByEmail = async (email: string) => {
  return (
    (await prisma.consumer.findUnique({ where: { email } })) ||
    (await prisma.salesAgent.findUnique({ where: { email } })) ||
    (await prisma.client.findUnique({ where: { email } })) ||
    (await prisma.user.findUnique({ where: { email } }))
  );
};

const createDefaultUser = async ({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}) => {
  return await prisma.user.create({
    data: {
      email,
      name: name || "",
      role: "ADMIN", // Use default safe role
      image,
    },
  });
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/shop/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data: {
                  email: credentials.email,
                  password: credentials.password,
                },
              }),
            }
          );

          if (!response.ok) {
            console.error("Login API error:", response.status);
            return null;
          }

          const result = await response.json();
          const { emailVerified, ...body } = result.body;

          if (!body?.id || !body.email) {
            return null;
          }

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
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await findExistingUserByEmail(user.email);
        if (existingUser) return true;

        await createDefaultUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = (user as any).phone;
        token.username = (user as any).username;
        token.bio = (user as any).bio;
        token.address = (user as any).address;
        token.role = (user as any).role;
        token.profilePicture =
          (user as any).profilePicture || (user as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.phone = token.phone;
        session.user.username = token.username;
        session.user.bio = token.bio;
        session.user.address = token.address;
        session.user.role = token.role;
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    },
  },
  // pages: {
  //   signIn: "/signin",
  //   newUser: "/register",
  // },
};

export default NextAuth(authOptions);
