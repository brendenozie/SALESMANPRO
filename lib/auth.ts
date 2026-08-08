// File: lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { headers } from "next/headers";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// import FacebookProvider from "next-auth/providers/facebook";
// import AppleProvider from "next-auth/providers/apple";
// import EmailProvider from "next-auth/providers/email";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { decode, encode } from "next-auth/jwt";

const baseUrl = process.env.NEXTAUTH_URL!; // || process.env.NEXT_PUBLIC_NEXTAUTH_URL;
// ⚠️ IMPORTANT: This secret MUST be the *exact same*
// environment variable as your auth app.
const aSharedSecret = process.env.NEXTAUTH_SECRET!; // || process.env.NEXT_PUBLIC_NEXTAUTH_SECRET!;

const googleClientId = process.env.GOOGLE_CLIENT_ID!; // || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!; // || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!;

// if (!aSharedSecret) {
//   throw new Error("NEXTAUTH_SECRET is not set!");
// }

// Helper to find where the user is actually going
const getRealTargetHost = (fullUrl: string, currentHost: string) => {
  try {
    const url = new URL(fullUrl, `https://${currentHost}`);
    // Check for common redirect params
    const target =
      url.searchParams.get("target") || url.searchParams.get("callbackUrl");

    if (target) {
      return new URL(target).host.split(":")[0];
    }
  } catch (e) {
    // console.error("Error parsing target host:", e);
  }
  return null;
};

// ✅ Utility: find existing user by email
async function findExistingUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user || null;
}

// ✅ Utility: find Student/Educator/Parent by login code (passwordless flow)
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

// ✅ Default user creation (OAuth signups only)
async function createDefaultUser({
  email,
  name,
  image,
}: {
  email: string;
  name?: string;
  image?: string;
}) {
  return prisma.user.create({
    data: {
      email,
      name: name ?? "",
      role: "USER", // Default role for new OAuth signups
      image,
    },
  });
}

// Add this helper inside or above your authOptions function
const getTrueOrigin = (req: any) => {
  // 1. Check the query params for callbackUrl
  const callbackUrl = req?.query?.callbackUrl || "";

  if (callbackUrl.startsWith("http")) {
    try {
      const url = new URL(callbackUrl);
      return url.hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  // 2. Fallback to the current host if no callbackUrl is present
  return (req?.headers?.host || "").split(":")[0].replace(/^www\./, "");
};

const getTenantFromCallback = (url?: string) => {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname;
    const mainDomains = [
      "salesmanpro.site",
      "www.salesmanpro.site",
      "auth.salesmanpro.site",
    ];

    if (mainDomains.includes(host)) return null;

    // Return the subdomain or custom domain
    return host.replace(/^www\./, "");
  } catch {
    return null;
  }
};

// Helper to extract tenant info
const getTenantInfo = (host: string) => {
  // Split host to remove port if present (e.g., localhost:3000)
  const cleanHost = host.split(":")[0].toLowerCase();
  // Use exact matches for main domains
  // const mainDomains = [
  //   "salesmanpro.site",
  //   "www.salesmanpro.site",
  //   // "auth.salesmanpro.site",
  // ];
  // These are the only domains where we want to trigger "Admin" logic
  const hubDomains = ["salesmanpro.site", "www.salesmanpro.site", "localhost"];

  // This is infrastructure; it's not a tenant, but it's not the "Admin" entry point either
  const systemDomains = ["auth.salesmanpro.site"];

  const isHub = hubDomains.includes(cleanHost);
  const isSystem = systemDomains.includes(cleanHost);

  // isMainApp remains true for both to prevent the code from looking for
  // a company with the slug "auth" or "salesmanpro"
  const isMainApp = isHub || isSystem;

  // isMainApp is ONLY true if it is exactly one of the hub domains
  // const isMainApp =   mainDomains.includes(cleanHost) || cleanHost.includes("localhost");

  return { isMainApp, isHub, tenantIdentifier: cleanHost };
};

// export const authOptions: NextAuthOptions = {
export const authOptions = (reqHost?: string): NextAuthOptions => ({
  // httpOptions: {
  //   timeout: 10000, // Increase to 10s for slower network environments
  // },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // An ID for this custom provider
      id: "token-signin",
      name: "Token Sign-In",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          // console.error("Authorize: No token provided.");
          return null;
        }

        // 🚨 CRITICAL DEBUGGING LINE: Log the received token's length
        // console.log(
        //   `Authorize: Token received. Length: ${credentials.token.length}.`,
        // );

        try {
          // Decode the token using the shared secret
          const decodedToken = await decode({
            token: credentials.token,
            secret: aSharedSecret!,
          });

          if (!decodedToken || !decodedToken.email) {
            // console.error(
            //   "Authorize: Token decoding failed or no email/data found.",
            // );
            // // Log the result of the decode attempt if it failed without an exception
            // console.log("Decoded Result (if available):", decodedToken);
            return null;
          }

          // 🚀 SUCCESS: Log the email/user ID to confirm decoding worked
          // console.log(`Token Sign-In SUCCESS for email: ${decodedToken.email}`);

          // The decoded token is trusted. Return it as the user object.
          // Note: Since this token comes from the other app, we trust its contents and skip a DB lookup here.
          return {
            id: decodedToken.id as string,
            name: decodedToken.name,
            email: decodedToken.email,
            image: decodedToken.image,
            role: decodedToken.role, // Pass through your custom properties
            // ... add other properties from your token
          };
        } catch (error) {
          // ❌ FAILURE: The error here is usually due to Expiration or Secret Mismatch

          return null;
        }
      },
    }),

    // ✅ Credentials: Email & Password
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

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          userFoundInDb.password,
        );
        if (!passwordMatch) return null;

        // ✅ Role detection logic
        let determinedRole: string | undefined =
          userFoundInDb.role || undefined;
        const studentCheck = await prisma.student.findUnique({
          where: { userId: userFoundInDb.id },
        });
        const educatorCheck = await prisma.educator.findUnique({
          where: { userId: userFoundInDb.id },
        });
        const consumerCheck = await prisma.consumer.findUnique({
          where: { userId: userFoundInDb.id },
        });
        const salesAgentCheck = await prisma.salesAgent.findUnique({
          where: { userId: userFoundInDb.id },
        });
        const clientCheck = await prisma.client.findUnique({
          where: { userId: userFoundInDb.id },
        });

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
          role: determinedRole as any,
          phone: userFoundInDb.phone ?? undefined,
          username: userFoundInDb.username ?? undefined,
          bio: userFoundInDb.bio ?? undefined,
          address: userFoundInDb.address ?? undefined,
          profilePicture:
            userFoundInDb.profilePicture ?? userFoundInDb.image ?? undefined,
        };
      },
    }),

    // ✅ Passwordless School Login Code
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
          role: loginCodeResult.role as any,
          phone: user.phone ?? undefined,
          username: user.username ?? undefined,
          bio: user.bio ?? undefined,
          address: user.address ?? undefined,
          profilePicture: user.profilePicture ?? user.image ?? undefined,
        };
      },
    }),

    // ✅ OAuth Providers
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 40000,
      },
    }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    generateSessionToken: () =>
      randomUUID?.() ?? randomBytes(32).toString("hex"),
  },
  // ✅ AUTO-LINK OAUTH LOGINS HERE
  callbacks: {
    async redirect({ url, baseUrl }) {
      const HUB_URL = "https://salesmanpro.site";
      const AUTH_HOST = new URL(baseUrl).hostname;

      // 🚫 Logout must NEVER go through handover
      if (url.includes("/logout")) {
        return url.startsWith("/") ? `${baseUrl}${url}` : url;
      }

      // 🚫 Never handover on signout
      if (url.includes("/api/auth/signout")) {
        return baseUrl;
      }

      // const finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
      if (url.includes("/api/auth/handover")) {
        return url; // 🚀 STOP processing immediately
      }

      let finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

      // 🔥 FIX: decode if encoded
      try {
        finalRedirectUrl = decodeURIComponent(finalRedirectUrl);
      } catch (e) {
        // ignore if already decoded
      }

      try {
        const targetUrlObj = new URL(finalRedirectUrl);
        const targetHost = targetUrlObj.hostname;
        const targetPath = targetUrlObj.pathname;
        const trueHost = targetHost;

        // ✅ جلوگیری infinite loops
        if (
          finalRedirectUrl.includes("/api/auth/handover") ||
          finalRedirectUrl.includes("/failure")
        ) {
          return finalRedirectUrl;
        }

        // ✅ Allow internal auth routes
        if (targetHost === AUTH_HOST) {
          if (targetPath.startsWith("/api/auth") || targetPath === "/signin") {
            return finalRedirectUrl;
          }
        }

        const mainDomains = ["salesmanpro.site", "www.salesmanpro.site"];

        const handoverUrl = new URL("/api/auth/handover", baseUrl);

        if (mainDomains.includes(trueHost)) {
          handoverUrl.searchParams.set("target", `${HUB_URL}/dashboards`);
        } else {
          handoverUrl.searchParams.set("target", finalRedirectUrl);
        }

        return handoverUrl.toString();
      } catch (error) {
        return `${HUB_URL}/failure?reason=invalid_redirect&error=${encodeURIComponent(error instanceof Error ? error.message : "unknown_error")}`;
      }
    },
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;

      const host = reqHost || "";

      const { isMainApp, isHub, tenantIdentifier } = getTenantInfo(host);

      if (!isMainApp) {
        // const possibleSlug = trueHost.split(".")[0];
        const company = await prisma.company.findFirst({
          where: {
            OR: [{ domain: host || tenantIdentifier }],
          },
        });

        if (company && user.id) {
          // Link them to the consumer table so they have access to this specific tenant
          await prisma.consumer.upsert({
            where: {
              userId_companyId: { userId: user.id, companyId: company.id },
              // userId: user.id,
              // companyId: company.id,
            },
            update: {}, // Do nothing if link already exists
            create: {
              userId: user.id,
              companyId: company.id,
            },
          });
        }
      } else {
        if (!isHub) {
          // console.log(
          //   `User ${user.email} signed in on auth domain. They will be linked to the tenant based on their callbackUrl after sign-in completes.`,
          // );
        } else {
          if (isHub && user.id && (user as { role?: string }).role === "USER") {
            // Only upgrade to ADMIN if they are signing in via the main Hub
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            });
          }
        }
      }

      // 2. DO NOT manually create the User or Account here.
      // Returning true allows the PrismaAdapter to do it safely.
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
      // if (!token.isActive) {
      //   // ⛔ immediately invalidate session
      //   return null;
      // }

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

  secret: aSharedSecret, //process.env.NEXTAUTH_SECRET,
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
        sameSite: "lax", // this is the default, but we set it explicitly for clarity
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // 🚀 THE FIX: You MUST explicitly declare maxAge here when overriding cookies,
        // otherwise Android treats it as a session-only cookie and kills it on exit.
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      },
    },
  },
});

// ✅ For Next.js App Router
export const getAuthSession = () => getServerSession(authOptions());

// export const getAuthSession = async () => {
//   const headerList = await headers();
//   const host = headerList.get("host") || "";
//   return getServerSession(authOptions(host));
// };