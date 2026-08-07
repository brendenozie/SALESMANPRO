import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { decode } from "next-auth/jwt";

const aSharedSecret = process.env.NEXTAUTH_SECRET!;
const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

export const MAIN_DOMAINS = [
  "salesmanpro.site",
  "www.salesmanpro.site",
  "auth.salesmanpro.site",
  "localhost",
];

export const AUTH_BROKER_URL =
  process.env.NEXTAUTH_URL || "https://auth.salesmanpro.site";

export function cleanHost(hostHeader: string | null): string {
  if (!hostHeader) return "";
  return hostHeader
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "");
}

export function getTenantInfo(hostHeader: string) {
  const host = cleanHost(hostHeader);
  const isHub = host === "salesmanpro.site" || host === "localhost";
  const isSystem = host === "auth.salesmanpro.site";
  const isMainApp = isHub || isSystem;

  return { isMainApp, isHub, isSystem, tenantIdentifier: host };
}

export const authOptions = (reqHost?: string): NextAuthOptions => ({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "token-signin",
      name: "Token Sign-In",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        try {
          const decodedToken = await decode({
            token: credentials.token,
            secret: aSharedSecret,
          });

          if (!decodedToken || !decodedToken.email) return null;

          return {
            id: decodedToken.id as string,
            name: decodedToken.name,
            email: decodedToken.email,
            image: decodedToken.image,
            role: decodedToken.role,
          };
        } catch {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "credentials-email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const userFound = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!userFound || !userFound.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          userFound.password,
        );
        if (!passwordMatch) return null;

        return {
          id: userFound.id,
          name: userFound.name ?? undefined,
          email: userFound.email,
          role: userFound.role || "USER",
          phone: userFound.phone ?? undefined,
          username: userFound.username ?? undefined,
          bio: userFound.bio ?? undefined,
          address: userFound.address ?? undefined,
          profilePicture:
            userFound.profilePicture ?? userFound.image ?? undefined,
        };
      },
    }),

    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 40000,
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    generateSessionToken: () =>
      randomUUID?.() ?? randomBytes(32).toString("hex"),
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes("/logout") || url.includes("/api/auth/signout")) {
        return url.startsWith("/") ? `${baseUrl}${url}` : url;
      }

      if (url.includes("/api/auth/handover") || url.includes("/failure")) {
        return url;
      }

      let finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

      try {
        finalRedirectUrl = decodeURIComponent(finalRedirectUrl);
      } catch {
        // Already decoded
      }

      try {
        const targetUrlObj = new URL(finalRedirectUrl);
        const targetHost = cleanHost(targetUrlObj.hostname);

        if (
          targetHost === cleanHost(new URL(baseUrl).hostname) &&
          (targetUrlObj.pathname.startsWith("/api/auth") ||
            targetUrlObj.pathname === "/signin")
        ) {
          return finalRedirectUrl;
        }

        const handoverUrl = new URL("/api/auth/handover", baseUrl);
        handoverUrl.searchParams.set("target", finalRedirectUrl);
        return handoverUrl.toString();
      } catch (error) {
        return `${baseUrl}/failure?reason=invalid_redirect&error=${encodeURIComponent(
          error instanceof Error ? error.message : "unknown",
        )}`;
      }
    },

    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;

      const host = reqHost || "";
      const { isMainApp, isHub, tenantIdentifier } = getTenantInfo(host);

      if (!isMainApp) {
        const company = await prisma.company.findFirst({
          where: {
            OR: [
              { domain: tenantIdentifier },
              { customDomain: tenantIdentifier },
              { slug: tenantIdentifier.split(".")[0] },
            ],
          },
        });

        if (company && user.id) {
          await prisma.consumer.upsert({
            where: {
              userId_companyId: { userId: user.id, companyId: company.id },
            },
            update: {},
            create: {
              userId: user.id,
              companyId: company.id,
            },
          });
        }
      } else if (
        isHub &&
        user.id &&
        (user as { role?: string }).role === "USER"
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: (user as Record<string, unknown>).phone,
          username: (user as Record<string, unknown>).username,
          bio: (user as Record<string, unknown>).bio,
          address: (user as Record<string, unknown>).address,
          role: (user as Record<string, unknown>).role,
          profilePicture: (user as Record<string, unknown>).profilePicture,
        });
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, {
          id: token.id as string,
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

  secret: aSharedSecret,
  pages: {
    signIn: "/signin",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
});

export const getAuthSession = () => getServerSession(authOptions());
