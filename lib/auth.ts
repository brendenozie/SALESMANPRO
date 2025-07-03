// File: lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import prisma from "../server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from 'bcryptjs'; 

// Utility to find any existing user across multiple models by EMAIL
async function findExistingUserByEmail(email: string) {
  return (
    (await prisma.user.findUnique({ where: { email } })) 
  );
}

// Utility to find user by LOGIN CODE
async function findUserByLoginCode(loginCode: string) {
  const student = await prisma.student.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (student) {
    return { user: student.user, role: 'STUDENT' };
  }

  const educator = await prisma.educator.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (educator) {
    return { user: educator.user, role: 'EDUCATOR' };
  }

  // const consumer = await prisma.consumer.findUnique({
  //   where: { loginCode },
  //   include: { user: true },
  // });
  // if (consumer) {
  //   return { user: consumer.user, role: 'CONSUMER' };
  // }

  // const salesAgent = await prisma.salesAgent.findUnique({
  //   where: { loginCode },
  //   include: { user: true },
  // });
  // if (salesAgent) {
  //   return { user: salesAgent.user, role: 'SALES_AGENT' };
  // }

  // const client = await prisma.client.findUnique({
  //   where: { loginCode },
  //   include: { user: true },
  // });
  // if (client) {
  //   return { user: client.user, role: 'CLIENT' };
  // } 

  return null;
}

// Create a new user fallback (Keep as is for OAuth sign-ups)
async function createDefaultUser({ email, name, image }: { email: string; name?: string; image?: string }) {
  return prisma.user.create({
    data: {
      email,
      name: name ?? "",
      role: "ADMIN", // Default role for newly created user via OAuth
      image,
    },
  });
}

// Function to validate if a string is likely an email
const isEmail = (str: string) => /\S+@\S+\.\S+/.test(str);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials", // Keep a generic name as it handles multiple types
      credentials: {
        identifier: { label: "Login ID (Email or Code)", type: "text" }, // Generic identifier
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {

        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        let userFoundInDb: any = null;
        let determinedRole: string | null = null;
        let userIdForSession: string | null = null;

        if (isEmail(credentials.identifier)) {
          // Attempting to log in with an email
          userFoundInDb = await findExistingUserByEmail(credentials.identifier);
          if (userFoundInDb) {
            // Determine role based on which model the user belongs to
            // This is a simplified example. In a real app, your User model
            // might have a direct 'role' field, or you'd fetch from Student/Educator
            const studentCheck = await prisma.student.findUnique({ where: { userId: userFoundInDb.id } });
            const educatorCheck = await prisma.educator.findUnique({ where: { userId: userFoundInDb.id } });
            const consumerCheck = await prisma.consumer.findUnique({ where: { email: credentials.identifier } });
            const salesAgentCheck = await prisma.salesAgent.findUnique({ where: { email: credentials.identifier } });
            const clientCheck = await prisma.client.findUnique({ where: { email: credentials.identifier } });

            const userCheck = await prisma.user.findUnique({ where: { id: userFoundInDb.id } });


            if (studentCheck) {
                determinedRole = 'STUDENT';
            } else if (educatorCheck) {
                determinedRole = 'EDUCATOR';
            }
            else if (consumerCheck) {
                determinedRole = 'CONSUMER';
            } else if (salesAgentCheck) {
                determinedRole = 'SALES_AGENT';
            } else if (clientCheck) {
                determinedRole = 'CLIENT';
            } else if (userCheck && userCheck.role) {
              determinedRole = userCheck.role; 
            } else {
                determinedRole = 'UNKNOWN'; // Fallback if role can't be determined
            }
            userIdForSession = userFoundInDb.id;

          }
        } else {
          // Attempting to log in with a school login code
          const loginCodeResult = await findUserByLoginCode(credentials.identifier);
          if (loginCodeResult) {
            userFoundInDb = loginCodeResult.user; // The associated User object
            determinedRole = loginCodeResult.role; // 'STUDENT' or 'EDUCATOR'
            userIdForSession = userFoundInDb.id;
          }
        }

        if (
          !userFoundInDb ||
          !userFoundInDb.password ||
          !userIdForSession ||
          typeof userIdForSession !== "string"
        ) {
          console.error("No user found with identifier or user has no password set.");
          return null;
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(credentials.password, userFoundInDb.password);

        if (!passwordMatch) {
          console.error("Invalid password for identifier:", credentials.identifier);
          return null;
        }

        // If login is successful, return a user object
        // Ensure role is never null, fallback to undefined if not determined
        return {
          id: userIdForSession, // Use the ID from the User model (guaranteed string)
          name: userFoundInDb.name,
          email: userFoundInDb.email,
          // Cast determinedRole to the Role type expected by NextAuth (assumes Role is a string union type)
          role: determinedRole as any, // Replace 'any' with your actual Role type if imported, e.g. 'as Role'
          phone: userFoundInDb.phone,
          username: userFoundInDb.username,
          bio: userFoundInDb.bio,
          address: userFoundInDb.address,
          profilePicture: userFoundInDb.profilePicture || userFoundInDb.image,
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
          profilePicture: (user as any).profilePicture,
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