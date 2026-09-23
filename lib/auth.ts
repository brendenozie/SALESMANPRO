import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { consumeHandoverToken, safeHandoverTarget } from "@/lib/auth/handover";
import { canAccessDashboard } from "@/lib/auth/authorization";
import {
  readAuthContextFromCookieHeader,
  resolveReturnContext,
  isAllowedReturnUrl,
  type AuthFlowContext,
} from "@/lib/auth/context";
import { AUTH_HOST, HUB_URL, normalizeHost } from "@/lib/auth/domain";
import {
  applyLoginContext,
  provisionSignupRelationships,
} from "@/lib/auth/provision";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/verification";
import { authLog, generateCorrelationId } from "@/lib/auth/telemetry";

function getSharedSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "default-salesmanpro-auth-secret-32-chars-min"
  );
}

function createResilientPrismaAdapter(p: typeof prisma) {
  const baseAdapter = PrismaAdapter(p);
  return {
    ...baseAdapter,
    async getUserByAccount(provider_providerAccountId: {
      provider: string;
      providerAccountId: string;
    }) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true },
      });
      if (!account) return null;
      if (!account.user) {
        // Purge orphan account whose User row was deleted so re-linking succeeds
        await p.account.delete({ where: { id: account.id } }).catch(() => null);
        return null;
      }
      return account.user;
    },
    async linkAccount(data: any) {
      // Use upsert to avoid duplicate key error P2002 if an existing/orphan account record was present
      return p.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
        update: {
          userId: data.userId,
          type: data.type,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        },
        create: {
          ...data,
        },
      });
    },
  };
}

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
    include: { user: true, Company: true },
  });
  if (student)
    return {
      user: student.user,
      role: student.levelStatus || "STUDENT",
      companyId: student.companyId,
      companySlug: student.Company?.slug,
    };

  const educator = await prisma.educator.findUnique({
    where: { loginCode },
    include: { user: true, Company: true },
  });
  if (educator)
    return {
      user: educator.user,
      role: "EDUCATOR",
      companyId: educator.companyId,
      companySlug: educator.Company?.slug,
    };

  const consumer = await prisma.consumer.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (consumer)
    return { user: consumer.user, role: consumer.user.role || "USER" };

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

  const staff = await prisma.staffProfile.findUnique({
    where: { loginCode },
    include: { user: true },
  });
  if (staff && staff.user && staff.employmentStatus === "ACTIVE") {
    return { user: staff.user, role: staff.user.role || "STAFF" };
  }

  return null;
}

async function resolveHasTenantAccess(
  userId: string,
  role?: string | null,
  companyId?: string | null,
) {
  if (
    canAccessDashboard({ role, companyId, emailVerified: true, isActive: true })
  ) {
    return true;
  }
  try {
    const { fetchWithCache } = await import("./cache");
    return await fetchWithCache(
      `tenant_access:${userId}`,
      async () => {
        const [owned, staff, educator, student, parent] = await Promise.all([
          prisma.company.findFirst({ where: { userId }, select: { id: true } }),
          prisma.staffProfile.findUnique({ where: { userId }, select: { id: true } }),
          prisma.educator.findUnique({ where: { userId }, select: { id: true } }),
          prisma.student.findUnique({ where: { userId }, select: { id: true } }),
          prisma.parent.findUnique({ where: { userId }, select: { id: true } }),
        ]);
        return !!(owned || staff || educator || student || parent);
      },
      { ttlSeconds: 600 },
    );
  } catch {
    const [owned, staff, educator, student, parent] = await Promise.all([
      prisma.company.findFirst({ where: { userId }, select: { id: true } }),
      prisma.staffProfile.findUnique({ where: { userId }, select: { id: true } }),
      prisma.educator.findUnique({ where: { userId }, select: { id: true } }),
      prisma.student.findUnique({ where: { userId }, select: { id: true } }),
      prisma.parent.findUnique({ where: { userId }, select: { id: true } }),
    ]);
    return !!(owned || staff || educator || student || parent);
  }
}

async function resolveFlowContext(
  opts: AuthRequestContext,
): Promise<AuthFlowContext | null> {
  const fromCookie = await readAuthContextFromCookieHeader(opts.cookieHeader);
  if (fromCookie) return fromCookie;

  // Fallback: check next-auth callback-url cookie if present
  if (opts.cookieHeader) {
    const parts = opts.cookieHeader.split(";").map((p) => p.trim());
    const match = parts.find(
      (p) =>
        p.startsWith("__Secure-next-auth.callback-url=") ||
        p.startsWith("next-auth.callback-url="),
    );
    if (match) {
      const rawVal = match.split("=").slice(1).join("=");
      if (rawVal) {
        try {
          const decodedVal = decodeURIComponent(rawVal);
          const resolved = await resolveReturnContext(decodedVal);
          if (resolved) return resolved;
        } catch {}
      }
    }
  }

  if (opts.requestUrl) {
    try {
      const url = new URL(opts.requestUrl);
      const callbackUrl =
        url.searchParams.get("callbackUrl") || url.searchParams.get("target");
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

export const createAuthOptions = (
  ctx: string | AuthRequestContext = {},
): NextAuthOptions => {
  const requestCtx: AuthRequestContext =
    typeof ctx === "string" ? { host: ctx } : ctx || {};
  const secret = getSharedSecret();
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return {
    adapter: createResilientPrismaAdapter(prisma) as any,
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
            const expectedHost = normalizeHost(
              rawReqHost || requestCtx.host || "",
            );
            const decodedToken = await consumeHandoverToken(
              credentials.token,
              expectedHost,
            );
            if (!decodedToken || !decodedToken.email) return null;

            return {
              id: decodedToken.id as string,
              name: (decodedToken.name as string) ?? null,
              email: decodedToken.email as string,
              image: (decodedToken.image as string) ?? null,
              role: (decodedToken.role as string) ?? undefined,
              emailVerified: typeof decodedToken.emailVerified === "boolean" ? decodedToken.emailVerified : null,
              companyId: (decodedToken.companyId as string) ?? null,
              hasTenantAccess: Boolean(decodedToken.hasTenantAccess),
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

          const userFoundInDb = await findExistingUserByEmail(
            credentials.email,
          );
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

          const loginCodeResult = await findUserByLoginCode(
            credentials.loginCode,
          );
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

      ...(googleClientId && googleClientSecret
        ? [
            GoogleProvider({
              clientId: googleClientId,
              clientSecret: googleClientSecret,
              allowDangerousEmailAccountLinking: true,
              httpOptions: {
                timeout: 40000,
              },
            }),
          ]
        : []),
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
        const start = Date.now();
        const cId = generateCorrelationId();

        if (url.includes("/logout") || url.includes("/api/auth/signout")) {
          return url.startsWith("/") ? `${baseUrl}${url}` : url;
        }

        if (
          url.includes("/failure") ||
          url.includes("/unauthorized") ||
          url.includes("/verify-email")
        ) {
          return url.startsWith("/") ? `${baseUrl}${url}` : url;
        }

        // If it's already a handover URL, extract and validate the inner target
        if (url.includes("/api/auth/handover")) {
          try {
            const handoverUrlObj = new URL(
              url.startsWith("/") ? `${baseUrl}${url}` : url,
            );
            const innerTarget = handoverUrlObj.searchParams.get("target");
            if (innerTarget && innerTarget !== url) {
              const safeTarget = await safeHandoverTarget(innerTarget);
              if (
                safeTarget &&
                normalizeHost(safeTarget.hostname) !== "auth.salesmanpro.site"
              ) {
                const cleanHandover = new URL("/api/auth/handover", baseUrl);
                cleanHandover.searchParams.set("target", safeTarget.toString());
                authLog(cId, "redirect_callback_duration", Date.now() - start, { target: cleanHandover.toString() });
                return cleanHandover.toString();
              }
            }
          } catch {}
        }

        let finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
        try {
          // Safely unroll nested percent-encoding up to 3 levels
          for (let i = 0; i < 3; i++) {
            if (finalRedirectUrl.includes("%")) {
              const next = decodeURIComponent(finalRedirectUrl);
              if (next === finalRedirectUrl) break;
              finalRedirectUrl = next;
            } else {
              break;
            }
          }
        } catch {
          /* already decoded */
        }

        try {
          const targetUrlObj = new URL(finalRedirectUrl);
          const targetHost = normalizeHost(targetUrlObj.hostname);
          const targetPath = targetUrlObj.pathname;

          // If the target is the auth domain itself, redirect to platform dashboards!
          if (
            targetHost === "auth.salesmanpro.site" ||
            targetHost === normalizeHost(new URL(baseUrl).hostname)
          ) {
            if (
              targetPath.startsWith("/api/auth") ||
              targetPath.startsWith("/verify-email")
            ) {
              return finalRedirectUrl;
            }
            if (
              targetPath === "/signin" ||
              targetPath === "/signup" ||
              targetPath === "/" ||
              targetPath === ""
            ) {
              finalRedirectUrl = `${HUB_URL}/dashboards`;
            }
          }

          const allowed = await isAllowedReturnUrl(finalRedirectUrl);
          if (!allowed) {
            authLog(cId, "redirect_callback_duration", Date.now() - start, { error: "unauthorized_return_url" });
            return `${HUB_URL}/unauthorized?reason=invalid_callback`;
          }

          const handoverUrl = new URL("/api/auth/handover", baseUrl);
          handoverUrl.searchParams.set("target", finalRedirectUrl);
          authLog(cId, "redirect_callback_duration", Date.now() - start, { target: finalRedirectUrl });
          return handoverUrl.toString();
        } catch {
          authLog(cId, "redirect_callback_duration", Date.now() - start, { error: "invalid_redirect" });
          return `${HUB_URL}/unauthorized?reason=invalid_redirect`;
        }
      },
      async signIn({ user, account }) {
        const start = Date.now();
        const cId = generateCorrelationId();
        authLog(cId, "google_callback_arrival", 0, { provider: account?.provider, email: user?.email });

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

        const u = user as any;
        // Fast-path: Check isActive directly if returned by adapter
        if (u.isActive === false) return false;

        const flow = await resolveFlowContext(requestCtx);
        const userId = user.id;

        if (userId) {
          // Asynchronously apply login context if storefront without holding up authentication
          if (flow) {
            applyLoginContext(userId, flow).catch(() => null);
          }
        } else {
          // Fallback user query only if user.id was not provided
          const existing = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
            select: { id: true, role: true, isActive: true },
          });

          if (existing?.isActive === false) return false;

          if (existing && flow) {
            applyLoginContext(existing.id, flow).catch(() => null);
          }
        }

        authLog(cId, "user_lookup_duration", Date.now() - start, { provider: account?.provider });
        return true;
      },
      async jwt({ token, user }) {
        const jwtStart = Date.now();
        const cId = generateCorrelationId();

        if (user) {
          const u = user as any;
          let role = u.role || "USER";
          let emailVerified = u.emailVerified;
          let isActive = u.isActive;
          let companyId = u.companyId;

          // Only query DB if critical authorization fields are missing from adapter user
          if (!role || isActive === undefined || companyId === undefined) {
            if (user.id) {
              const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                  role: true,
                  emailVerified: true,
                  isActive: true,
                  companyId: true,
                },
              });
              if (dbUser) {
                role = dbUser.role || role;
                emailVerified = dbUser.emailVerified ?? emailVerified;
                isActive = dbUser.isActive ?? isActive;
                companyId = dbUser.companyId ?? companyId;
              }
              if (!companyId && user.id) {
                const educatorRec = await prisma.educator.findUnique({
                  where: { userId: user.id },
                  select: { companyId: true },
                });
                if (educatorRec?.companyId) {
                  companyId = educatorRec.companyId;
                } else {
                  const studentRec = await prisma.student.findUnique({
                    where: { userId: user.id },
                    select: { companyId: true },
                  });
                  if (studentRec?.companyId) {
                    companyId = studentRec.companyId;
                  }
                }
              }
            }
          }

          const hasTenantAccess =
            u.hasTenantAccess ??
            (await resolveHasTenantAccess(user.id, role, companyId));

          Object.assign(token, {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: u.phone,
            username: u.username,
            bio: u.bio,
            address: u.address,
            role,
            profilePicture: u.profilePicture,
            emailVerified,
            isActive: isActive !== false,
            companyId,
            hasTenantAccess,
          });

          authLog(cId, "jwt_callback_duration", Date.now() - jwtStart, { userId: user.id, role });
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

            if (!token.companyId && token.id) {
              const educatorRec = await prisma.educator.findUnique({
                where: { userId: String(token.id) },
                select: { companyId: true },
              });
              if (educatorRec?.companyId) {
                token.companyId = educatorRec.companyId;
              } else {
                const studentRec = await prisma.student.findUnique({
                  where: { userId: String(token.id) },
                  select: { companyId: true },
                });
                if (studentRec?.companyId) {
                  token.companyId = studentRec.companyId;
                }
              }
            }

            token.hasTenantAccess = await resolveHasTenantAccess(
              String(token.id),
              dbUser.role,
              (token.companyId as string) || dbUser.companyId,
            );
          } else {
            token.hasTenantAccess = false;
          }
          authLog(cId, "jwt_callback_duration", Date.now() - jwtStart, { tokenRefresh: true });
        }
        return token;
      },
      async session({ session, token }) {
        const sessionStart = Date.now();
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
        authLog(generateCorrelationId(), "session_callback_duration", Date.now() - sessionStart);
        return session;
      },
    },
    events: {
      async createUser({ user }) {
        if (!user?.id) return;
        const cId = generateCorrelationId();
        const start = Date.now();

        const flow = await resolveFlowContext(requestCtx);
        if (flow) {
          await provisionSignupRelationships(user.id, flow, {
            isNewUser: true,
          });
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
              existing.emailVerified === false
                ? false
                : (existing.emailVerified ?? false),
          },
        });

        // Send email asynchronously without blocking OAuth response completion
        if (existing.emailVerified !== true) {
          createEmailVerificationToken(existing.email)
            .then((token) => {
              const callbackUrl = flow?.returnUrl || HUB_URL;
              return sendVerificationEmail(existing.email!, token, callbackUrl);
            })
            .catch(() => null);
        }

        authLog(cId, "account_linking_duration", Date.now() - start, { userId: user.id });
      },
    },

    secret: secret,
    useSecureCookies: process.env.NODE_ENV === "production",
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
      callbackUrl: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.callback-url"
            : "next-auth.callback-url",
        options: {
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      csrfToken: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Host-next-auth.csrf-token"
            : "next-auth.csrf-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      pkceCodeVerifier: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.pkce.code_verifier"
            : "next-auth.pkce.code_verifier",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 15,
        },
      },
      state: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.state"
            : "next-auth.state",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 15,
        },
      },
      nonce: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.nonce"
            : "next-auth.nonce",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
  };
};

export type AuthOptionsFunction = {
  (ctx?: string | AuthRequestContext): NextAuthOptions;
} & NextAuthOptions;

const defaultAuthOptions = createAuthOptions();

export const authOptions: AuthOptionsFunction = Object.assign(
  (ctx?: string | AuthRequestContext) => (ctx ? createAuthOptions(ctx) : defaultAuthOptions),
  defaultAuthOptions
);

export const getAuthSession = () => getServerSession(authOptions);
