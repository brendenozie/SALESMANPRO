import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";

const getRoleFromAPI = async () => {
  // Fetch role dynamically from API
  const roleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const roleData = await roleResponse.json();
  const role = roleData.role || "USER";
  
  return role;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Extract signup path from the referrer header
        // const signupPath = req?.headers?.referer || "";
        const role = await getRoleFromAPI();

        // Authenticate user via API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { email: credentials.email, password: credentials.password, role } }),
        });

        const result = await response.json();
        const { emailVerified, ...consumer } = result.body;

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
  // pages: {
  //   signIn: "/signin",
  //   newUser: "/register",
  // },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Extract signup path from cookies or default to empty string
        // const signupPath = ""; // Cookies can be used here instead
        const role = await getRoleFromAPI();

        if (!user.email) return false; // Prevent processing if no email

        // Check if user already exists
        const existingUser = await prisma.consumer.findUnique({ where: { email: user.email } }) ||
          await prisma.salesAgent.findUnique({ where: { email: user.email } }) ||
          await prisma.client.findUnique({ where: { email: user.email } }) ||
          await prisma.user.findUnique({ where: { email: user.email } });

        if (existingUser) return true;

        // Insert new user into correct role table
        if (role === "AGENT") {
          await prisma.salesAgent.create({
            data: { email: user.email, name: user.name, role, image: user.image },
          });
        } else if (role === "ADMIN") {
          await prisma.user.create({
            data: { email: user.email, name: user.name, role, image: user.image },
          });
        } else if (role === "CLIENT") {
          await prisma.client.create({
            data: { email: user.email, name: user.name, role, image: user.image },
          });
        } else {
          await prisma.consumer.create({
            data: { email: user.email, name: user.name, role:"USER", image: user.image },
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
        token.role = user.role;
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
        session.user.role = token.role;
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
