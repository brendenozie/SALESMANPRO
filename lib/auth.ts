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

async function findUserByLoginCode(loginCode: string) {
  const student = await prisma.student.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (student)
    return { user: student.user, role: student.levelStatus || "STUDENT" };

  const educator = await prisma.educator.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (educator) return { user: educator.user, role: "EDUCATOR" };

  const consumer = await prisma.consumer.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (consumer) return { user: consumer.user, role: "CONSUMER" };

  const salesAgent = await prisma.salesAgent.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (salesAgent) return { user: salesAgent.user, role: "SALES_AGENT" };

  const driver = await prisma.transportDriver.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (driver) return { user: driver.user, role: driver.user.role };

  const parent = await prisma.parent.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (parent) return { user: parent.user, role: "PARENT" };

  return null;
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

        const userFoundInDb = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!userFoundInDb || !userFoundInDb.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          userFoundInDb.password,
        );
        if (!passwordMatch) return null;

        let determinedRole: string = userFoundInDb.role || "USER";

        const [
          studentCheck,
          educatorCheck,
          consumerCheck,
          salesAgentCheck,
          clientCheck,
        ] = await Promise.all([
          prisma.student.findUnique({ where: { userId: userFoundInDb.id } }),
          prisma.educator.findUnique({ where: { userId: userFoundInDb.id } }),
          prisma.consumer.findUnique({ where: { userId: userFoundInDb.id } }),
          prisma.salesAgent.findUnique({ where: { userId: userFoundInDb.id } }),
          prisma.client.findUnique({ where: { userId: userFoundInDb.id } }),
        ]);

        if (studentCheck) determinedRole = "STUDENT";
        else if (consumerCheck) determinedRole = "CONSUMER";
        else if (salesAgentCheck) determinedRole = "SALES_AGENT";
        else if (clientCheck) determinedRole = "CLIENT";
        else if (educatorCheck) determinedRole = "EDUCATOR";
        else determinedRole = userFoundInDb.role || "ADMIN";

        return {
          id: userFoundInDb.id,
          name: userFoundInDb.name ?? undefined,
          email: userFoundInDb.email,
          role: determinedRole,
          phone: userFoundInDb.phone ?? undefined,
          username: userFoundInDb.username ?? undefined,
          bio: userFoundInDb.bio ?? undefined,
          address: userFoundInDb.address ?? undefined,
          profilePicture:
            userFoundInDb.profilePicture ?? userFoundInDb.image ?? undefined,
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
        if (!credentials?.loginCode) return null;
        if (
          credentials.loginCode.length !== 6 ||
          !/^\d+$/.test(credentials.loginCode)
        )
          return null;

        const loginCodeResult = await findUserByLoginCode(
          credentials.loginCode,
        );
        if (!loginCodeResult || !loginCodeResult.user) return null;

        const user = loginCodeResult.user;
        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          role: loginCodeResult.role,
          phone: user.phone ?? undefined,
          username: user.username ?? undefined,
          bio: user.bio ?? undefined,
          address: user.address ?? undefined,
          profilePicture: user.profilePicture ?? user.image ?? undefined,
        };
      },
    }),

    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
      httpOptions: { timeout: 40000 },
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
        const baseUrlHost = cleanHost(new URL(baseUrl).hostname);

        if (
          targetHost === baseUrlHost &&
          (targetUrlObj.pathname.startsWith("/api/auth") ||
            targetUrlObj.pathname === "/signin")
        ) {
          return finalRedirectUrl;
        }

        const handoverUrl = new URL("/api/auth/handover", baseUrl);

        if (
          targetHost === "salesmanpro.site" ||
          targetHost === "www.salesmanpro.site"
        ) {
          handoverUrl.searchParams.set("target", `${HUB_URL}/dashboards`);
        } else {
          handoverUrl.searchParams.set("target", finalRedirectUrl);
        }

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
      const { isMainApp, tenantIdentifier } = getTenantInfo(host);

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
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        Object.assign(token, {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: (user as Record<string, unknown>).phone,
          username: (user as Record<string, unknown>).username,
          bio: (user as Record<string, unknown>).bio,
          address: (user as Record<string, unknown>).address,
          globalRole: (user as Record<string, unknown>).role || "USER",
          profilePicture: (user as Record<string, unknown>).profilePicture,
        });
      }

      if (user || trigger === "signIn") {
        const host = reqHost || "";
        const { isMainApp, tenantIdentifier } = getTenantInfo(host);

        if (isMainApp) {
          token.storeRole = token.globalRole;
        } else {
          try {
            const company = await prisma.company.findFirst({
              where: {
                OR: [
                  { domain: tenantIdentifier },
                  { customDomain: tenantIdentifier },
                  { slug: tenantIdentifier.split(".")[0] },
                ],
              },
              select: { userId: true, id: true },
            });

            if (company) {
              token.storeId = company.id;
              token.storeRole = company.userId === token.id ? "ADMIN" : "USER";
            } else {
              token.storeRole = "USER";
            }
          } catch {
            token.storeRole = "USER";
          }
        }
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
          globalRole: token.globalRole,
          storeRole: token.storeRole,
          storeId: token.storeId,
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
