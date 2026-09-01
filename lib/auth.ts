//@ts-ignore
import "server-only";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { consumeHandoverToken } from "@/lib/auth/handover";
import { canAccessDashboard } from "@/lib/auth/authorization";
import { readAuthContextFromCookieHeader, resolveReturnContext, isAllowedReturnUrl, type AuthFlowContext } from "@/lib/auth/context";
import { AUTH_HOST, HUB_URL, normalizeHost } from "@/lib/auth/domain";
import { applyLoginContext, provisionSignupRelationships } from "@/lib/auth/provision";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/auth/verification";

const aSharedSecret = process.env.NEXTAUTH_SECRET!;
const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

export type AuthRequestContext = {
  host?: string;
  cookieHeader?: string;
  requestUrl?: string;
};

async function findExistingUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

async function findUserByLoginCode(loginCode: string) {
  const student = await prisma.student.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (student) return { user: student.user, role: student.levelStatus || "STUDENT" };

  const educator = await prisma.educator.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (educator) return { user: educator.user, role: "EDUCATOR" };

  const consumer = await prisma.consumer.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (consumer) return { user: consumer.user, role: consumer.user.role || "USER" };

  const salesAgent = await prisma.salesAgent.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (salesAgent) return { user: salesAgent.user, role: "AGENT" };

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

async function resolveHasTenantAccess(userId: string, role?: string | null, companyId?: string | null) {
  if (canAccessDashboard({ role, companyId, emailVerified: true, isActive: true })) {
    return true;
  }
  const [owned, staff] = await Promise.all([
    prisma.company.findFirst({ where: { userId }, select: { id: true } }),
    prisma.staffProfile.findUnique({ where: { userId }, select: { id: true } }),
  ]);
  return !!(owned || staff);
}

async function resolveFlowContext(opts: AuthRequestContext): Promise<AuthFlowContext | null> {
  const fromCookie = readAuthContextFromCookieHeader(opts.cookieHeader);
  if (fromCookie) return fromCookie;

  if (opts.requestUrl) {
    try {
      const url = new URL(opts.requestUrl);
      const callbackUrl = url.searchParams.get("callbackUrl") || url.searchParams.get("target");
      const resolved = await resolveReturnContext(callbackUrl);
      if (resolved) return resolved;
    } catch {
      /* ignore */
    }
  }

  return null;
}

function sessionUserFromDb(user: {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  phone?: string | null;
  username?: string | null;
  bio?: string | null;
  address?: string | null;
  profilePicture?: string | null;
  image?: string | null;
  emailVerified?: boolean | null;
  isActive?: boolean | null;
  companyId?: string | null;
  hasTenantAccess?: boolean;
}) {
  return {
    id: user.id,
    name: user.name ?? undefined,
    email: user.email,
    role: (user.role || "USER") as any,
    phone: user.phone ?? undefined,
    username: user.username ?? undefined,
    bio: user.bio ?? undefined,
    address: user.address ?? undefined,
    profilePicture: user.profilePicture ?? user.image ?? undefined,
    emailVerified: user.emailVerified,
    isActive: user.isActive !== false,
    companyId: user.companyId ?? undefined,
    hasTenantAccess: user.hasTenantAccess,
  };
}

export const authOptions = (
  ctx: string | AuthRequestContext = {},
): NextAuthOptions => {
  const requestCtx: AuthRequestContext =
    typeof ctx === "string" ? { host: ctx } : ctx || {};

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        id: "token-signin",
        name: "Token Sign-In",
        credentials: {
          token: { label: "Token", type: "text" },
        },
        async authorize(credentials, req) {
          if (!credentials?.token) return null;
          try {
            const rawReqHost =
              typeof (req as any)?.headers?.get === "function"
                ? (req as any).headers.get("host")
                : (req as any)?.headers?.host;
            const expectedHost =
              normalizeHost(rawReqHost || requestCtx.host || "");
            const decodedToken = await consumeHandoverToken(
              credentials.token,
              expectedHost,
            );
            if (!decodedToken || !decodedToken.email) return null;

            return {
              id: decodedToken.id as string,
              name: decodedToken.name,
              email: decodedToken.email,
              image: decodedToken.image,
              role: decodedToken.role,
              emailVerified: decodedToken.emailVerified,
              companyId: decodedToken.companyId,
              hasTenantAccess: decodedToken.hasTenantAccess,
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

          const userFoundInDb = await findExistingUserByEmail(credentials.email);
          if (!userFoundInDb || !userFoundInDb.password) return null;
          if (userFoundInDb.isActive === false) return null;

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            userFoundInDb.password,
          );
          if (!passwordMatch) return null;

          const hasTenantAccess = await resolveHasTenantAccess(
            userFoundInDb.id,
            userFoundInDb.role,
            userFoundInDb.companyId,
          );

          const flow = await resolveFlowContext(requestCtx);
          await applyLoginContext(userFoundInDb.id, flow);

          return sessionUserFromDb({ ...userFoundInDb, hasTenantAccess });
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

          const loginCodeResult = await findUserByLoginCode(credentials.loginCode);
          if (!loginCodeResult || !loginCodeResult.user) return null;

          const user = loginCodeResult.user;
          if (user.isActive === false) return null;

          const hasTenantAccess = await resolveHasTenantAccess(
            user.id,
            (loginCodeResult.role as string) || user.role,
            user.companyId,
          );

          return sessionUserFromDb({
            ...user,
            role: (loginCodeResult.role as string) || user.role,
            hasTenantAccess,
          });
        },
      }),

      GoogleProvider({
        clientId: googleClientId!,
        clientSecret: googleClientSecret!,
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

        if (
          url.includes("/api/auth/handover") ||
          url.includes("/failure") ||
          url.includes("/unauthorized") ||
          url.includes("/verify-email")
        ) {
          return url.startsWith("/") ? `${baseUrl}${url}` : url;
        }

        let finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
        try {
          finalRedirectUrl = decodeURIComponent(finalRedirectUrl);
        } catch {
          /* already decoded */
        }

        try {
          const targetUrlObj = new URL(finalRedirectUrl);
          const targetHost = targetUrlObj.hostname;
          const targetPath = targetUrlObj.pathname;

          if (targetHost === AUTH_HOST || targetHost === new URL(baseUrl).hostname) {
            if (
              targetPath.startsWith("/api/auth") ||
              targetPath === "/signin" ||
              targetPath === "/signup" ||
              targetPath.startsWith("/verify-email")
            ) {
              return finalRedirectUrl;
            }
          }

          const allowed = await isAllowedReturnUrl(finalRedirectUrl);
          if (!allowed) {
            return `${HUB_URL}/unauthorized?reason=invalid_callback`;
          }

          const handoverUrl = new URL("/api/auth/handover", baseUrl);
          handoverUrl.searchParams.set("target", finalRedirectUrl);
          return handoverUrl.toString();
        } catch {
          return `${HUB_URL}/unauthorized?reason=invalid_redirect`;
        }
      },
      async signIn({ user, account }) {
        if (
          !account ||
          account.provider === "credentials" ||
          account.provider === "token-signin" ||
          account.provider === "school-code-login" ||
          account.provider === "credentials-email-password"
        ) {
          return true;
        }
        if (!user.email) return false;

        const flow = await resolveFlowContext(requestCtx);
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, role: true, isActive: true },
        });

        if (existing?.isActive === false) return false;

        if (existing) {
          await applyLoginContext(existing.id, flow);
        }

        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          let dbUser: {
            role?: string | null;
            emailVerified?: boolean | null;
            isActive?: boolean | null;
            companyId?: string | null;
          } | null = null;
          if (user.id) {
            dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: {
                role: true,
                emailVerified: true,
                isActive: true,
                companyId: true,
              },
            });
          }
          const role = dbUser?.role || (user as any).role || "USER";
          const companyId = dbUser?.companyId ?? (user as any).companyId;
          const hasTenantAccess =
            (user as any).hasTenantAccess ??
            (await resolveHasTenantAccess(user.id, role, companyId));

          Object.assign(token, {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: (user as any).phone,
            username: (user as any).username,
            bio: (user as any).bio,
            address: (user as any).address,
            role,
            profilePicture: (user as any).profilePicture,
            emailVerified:
              dbUser?.emailVerified ?? (user as any).emailVerified,
            isActive: dbUser?.isActive ?? (user as any).isActive,
            companyId,
            hasTenantAccess,
          });
        } else if (token.id && token.hasTenantAccess === undefined) {
          const dbUser = await prisma.user.findUnique({
            where: { id: String(token.id) },
            select: {
              role: true,
              emailVerified: true,
              isActive: true,
              companyId: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.emailVerified = dbUser.emailVerified;
            token.isActive = dbUser.isActive;
            token.companyId = dbUser.companyId;
            token.hasTenantAccess = await resolveHasTenantAccess(
              String(token.id),
              dbUser.role,
              dbUser.companyId,
            );
          } else {
            token.hasTenantAccess = false;
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
            role: token.role,
            profilePicture: token.profilePicture,
            emailVerified: token.emailVerified,
            isActive: token.isActive,
            companyId: token.companyId,
            hasTenantAccess: token.hasTenantAccess,
          });
        }
        return session;
      },
    },
    events: {
      async createUser({ user }) {
        if (!user?.id) return;
        const flow = await resolveFlowContext(requestCtx);
        if (flow) {
          await provisionSignupRelationships(user.id, flow, { isNewUser: true });
        }
        const existing = await prisma.user.findUnique({
          where: { id: user.id },
          select: { email: true, emailVerified: true },
        });
        if (!existing?.email) return;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified:
              existing.emailVerified === false ? false : existing.emailVerified ?? false,
          },
        });

        if (existing.emailVerified !== true) {
          const token = await createEmailVerificationToken(existing.email);
          const callbackUrl = flow?.returnUrl || HUB_URL;
          await sendVerificationEmail(existing.email, token, callbackUrl).catch(() => null);
        }
      },
    },

    secret: aSharedSecret,
    pages: {
      signIn: "/signin",
      error: "/signin",
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
  };
};

export const getAuthSession = () => getServerSession(authOptions());
