import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { decode } from "next-auth/jwt";
import { headers } from "next/headers";

const sharedSecret = process.env.NEXTAUTH_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!sharedSecret) {
  throw new Error("CRITICAL_ENV_MISSING: NEXTAUTH_SECRET is not configured.");
}

export const MAIN_DOMAINS = [
  "salesmanpro.site",
  "www.salesmanpro.site",
  "auth.salesmanpro.site",
  "localhost",
];

export function parseHost(hostHeader: string) {
  const cleanHost = hostHeader
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "");
  const isHub = cleanHost === "salesmanpro.site" || cleanHost === "localhost";
  const isAuthBroker = cleanHost === "auth.salesmanpro.site";
  const isMainApp = MAIN_DOMAINS.includes(cleanHost);

  return { cleanHost, isHub, isAuthBroker, isMainApp };
}

async function findUserByLoginCode(loginCode: string) {
  const [student, educator, consumer, salesAgent, driver, parent] =
    await Promise.all([
      prisma.student.findUnique({
        where: { loginCode },
        include: { user: true },
      }),
      prisma.educator.findUnique({
        where: { loginCode },
        include: { user: true },
      }),
      prisma.consumer.findUnique({
        where: { loginCode },
        include: { user: true },
      }),
      prisma.salesAgent.findUnique({
        where: { loginCode },
        include: { user: true },
      }),
      prisma.transportDriver.findUnique({
        where: { loginCode },
        include: { user: true },
      }),
      prisma.parent.findUnique({
        where: { loginCode },
        include: { user: true },
      }),
    ]);

  if (student)
    return { user: student.user, role: student.levelStatus || "STUDENT" };
  if (educator) return { user: educator.user, role: "EDUCATOR" };
  if (consumer) return { user: consumer.user, role: "CONSUMER" };
  if (salesAgent) return { user: salesAgent.user, role: "SALES_AGENT" };
  if (driver) return { user: driver.user, role: driver.user.role };
  if (parent) return { user: parent.user, role: "PARENT" };

  return null;
}

export const authOptions = (reqHost?: string): NextAuthOptions => {
  const hostInfo = parseHost(reqHost || "salesmanpro.site");
  const isProd = process.env.NODE_ENV === "production";
  const isPlatformDomain = hostInfo.cleanHost.endsWith("salesmanpro.site");

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        id: "token-signin",
        name: "Token Sign-In",
        credentials: { token: { label: "Token", type: "text" } },
        async authorize(credentials) {
          if (!credentials?.token) return null;
          try {
            const decodedToken = await decode({
              token: credentials.token,
              secret: sharedSecret,
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

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email,
            role: user.role || "USER",
            phone: user.phone ?? undefined,
            username: user.username ?? undefined,
            bio: user.bio ?? undefined,
            address: user.address ?? undefined,
            profilePicture: user.profilePicture ?? user.image ?? undefined,
          };
        },
      }),

      CredentialsProvider({
        id: "school-code-login",
        name: "School Login Code",
        credentials: {
          loginCode: { label: "School Login Code", type: "text" },
        },
        async authorize(credentials) {
          if (
            !credentials?.loginCode ||
            credentials.loginCode.length !== 6 ||
            !/^\d+$/.test(credentials.loginCode)
          ) {
            return null;
          }

          const result = await findUserByLoginCode(credentials.loginCode);
          if (!result || !result.user) return null;

          const { user, role } = result;
          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email,
            role: role as any,
            phone: user.phone ?? undefined,
            username: user.username ?? undefined,
            bio: user.bio ?? undefined,
            address: user.address ?? undefined,
            profilePicture: user.profilePicture ?? user.image ?? undefined,
          };
        },
      }),

      GoogleProvider({
        clientId: googleClientId || "",
        clientSecret: googleClientSecret || "",
        allowDangerousEmailAccountLinking: true,
        httpOptions: { timeout: 15000 },
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
        const HUB_URL = "https://salesmanpro.site";

        if (url.includes("/logout") || url.includes("/api/auth/signout")) {
          return url.startsWith("/") ? `${baseUrl}${url}` : url;
        }

        if (
          url.includes("/api/auth/handover") ||
          url.includes("/api/auth/exchange")
        ) {
          return url;
        }

        let targetUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
        try {
          targetUrl = decodeURIComponent(targetUrl);
        } catch {}

        try {
          const parsedTarget = new URL(targetUrl);
          const targetHost = parsedTarget.hostname
            .toLowerCase()
            .replace(/^www\./, "");

          if (
            targetHost === "auth.salesmanpro.site" &&
            parsedTarget.pathname.startsWith("/api/auth")
          ) {
            return targetUrl;
          }

          const handoverUrl = new URL("/api/auth/handover", baseUrl);
          handoverUrl.searchParams.set("target", targetUrl);
          return handoverUrl.toString();
        } catch {
          return `${HUB_URL}/failure?reason=invalid_redirect`;
        }
      },

      async signIn({ user, account }) {
        if (!account || account.provider === "credentials") return true;
        if (!user.email || !user.id) return false;

        const { cleanHost, isMainApp } = parseHost(reqHost || "");

        if (!isMainApp) {
          const company = await prisma.company.findFirst({
            where: {
              OR: [
                { domain: cleanHost },
                { customDomain: cleanHost },
                { slug: cleanHost.split(".")[0] },
              ],
            },
          });

          if (company) {
            await prisma.consumer.upsert({
              where: {
                userId_companyId: {
                  userId: user.id,
                  companyId: company.id,
                },
              },
              update: {},
              create: {
                userId: user.id,
                companyId: company.id,
              },
            });
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
            role: (user as any).role || "USER",
            profilePicture: (user as any).profilePicture,
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

    secret: sharedSecret,
    pages: {
      signIn: "/signin",
      error: "/failure",
    },
    cookies: {
      sessionToken: {
        name: isProd
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: isProd,
          domain: isProd && isPlatformDomain ? ".salesmanpro.site" : undefined,
          maxAge: 30 * 24 * 60 * 60,
        },
      },
    },
  };
};

export async function getAuthSession() {
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") || "";
  return getServerSession(authOptions(host));
}
