import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import { CustomPrismaAdapter } from "@/lib/prisma-adapter";

import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
    // adapter: CustomPrismaAdapter(),  // Use custom adapter
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials,req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const signupPath = req?.headers?.referer || "";

        let role = "USER"; // Default role
        if (signupPath.includes("/admin") || signupPath.includes("/dashboard")) {
          role = "ADMIN";
        } else if (signupPath.includes("/client")) {
          role = "CLIENT";
        } else if (signupPath.includes("/agent")) {
          role = "AGENT";
        }

        // Fetch user from external API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shop/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: { email: credentials.email, password: credentials.password, role  },
            }),
          }
        );

        const result = await response.json();
        const { hashedPassword, emailVerified, ...consumer } = result.body;

        if (!consumer) return null;

        return {
          id: consumer.id,
          name: consumer.name,
          email: consumer.email,
          phone: consumer.phone,
          username: consumer.username,
          bio: consumer.bio,
          address: consumer.address,
          role: consumer.role,
          profilePicture: consumer.profilePicture,
        };
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
  pages: {
    signIn: "/signin",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  callbacks: {
    async signIn({ user, account, profile, credentials  }) {
      if (account?.provider === "google") {
        // Extract signup path from query (or another method like cookies)
        const signupPath = String(credentials?.signupPath || "");


        // Determine role based on signup path
        let role = "USER";
        if (signupPath.includes("/admin") || signupPath.includes("/dashboard")) {
          role = "ADMIN";
        } else if (signupPath.includes("/client")) {
          role = "CLIENT";
        } else if (signupPath.includes("/agent")) {
          role = "AGENT";
        }

        // Check if user already exists in any of the role tables
        const existingConsumer = user.email ? await prisma.consumer.findUnique({ where: { email: user.email } }) : null;
        const existingAgent = user.email ?  await prisma.salesAgent.findUnique({ where: { email: user.email } }) : null;
        const existingClient = user.email ?  await prisma.client.findUnique({ where: { email: user.email } }) : null;
        const existingAdmin = user.email ?  await prisma.user.findUnique({ where: { email: user.email } }) : null;

        if (existingConsumer || existingAgent || existingClient || existingAdmin) {
          return true; // User exists, proceed with sign-in
        }

        // Assign role based on email domain if no signup path was used
        // if (!signupPath) {
        //   if (user.email?.endsWith("@merchant.com")) {
        //     role = "AGENT";
        //   } else if (user.email?.endsWith("@client.com")) {
        //     role = "CLIENT";
        //   } else if (user.email?.endsWith("@admin.com")) {
        //     role = "ADMIN";
        //   } else {
        //     role = "USER";
        //   }
        // }

        // Insert user into the correct table based on role
        if (role === "AGENT") {
          await prisma.salesAgent.create({
            data: {
              email: user.email ?? "",
              name: user.name,
              role:"AGENT",
              image: user.image,
            },
          });
        } else if (role === "ADMIN") {
          await prisma.user.create({
            data: {
              email: user.email ?? "",
              name: user.name,
              role:"ADMIN",
              image: user.image,
            },
          });
        } else if (role === "CLIENT") {
          await prisma.client.create({
            data: {
              email: user.email ?? "",
              name: user.name,
              role:"CLIENT",
              image: user.image,
            },
          });
        } else {
          await prisma.consumer.create({
            data: {
              email: user.email ?? "",
              name: user.name,
              role:"USER",
              image: user.image,
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone;
        token.username = user.username;
        token.bio = user.bio;
        token.address = user.address;
        token.profilePicture = user.image || user.profilePicture;
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
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
