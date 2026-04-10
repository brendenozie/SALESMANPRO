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
      role: "ADMIN", // Default role for new OAuth signups
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

function isValidTarget(url?: string) {
  if (!url) return false;

  try {
    const decoded = decodeURIComponent(url);
    const parsed = new URL(decoded);

    const host = parsed.hostname.replace(/^www\./, "");

    // ❌ Reject auth domain
    if (host === "auth.salesmanpro.site") return false;

    // ❌ Reject internal NextAuth routes
    if (parsed.pathname.startsWith("/api/auth")) return false;

    return true;
  } catch {
    return false;
  }
}

// export const authOptions: NextAuthOptions = {
// export const authOptions = (reqHost?: string): NextAuthOptions => ({

export const authOptions = (req?: any): NextAuthOptions => {
  // 1. Determine the "True Origin" (where the user actually came from)
  // // let trueHost = getTrueOrigin(req);
  //   const targetUrlObj = new URL(req?.query?.callbackUrl || baseUrl);
  //   const targetHost = targetUrlObj.hostname;
  //   const targetPath = targetUrlObj.pathname;
  //   // const trueHosst = getTrueOrigin();
  //   const trueHost = targetHost;

  // const mainDomains = ["salesmanpro.site", "www.salesmanpro.site"];
  // const isMainApp =
  //   mainDomains.includes(trueHost) || trueHost.includes("localhost");
  // 1. Try to get it from the query param (Initial hit)
  // let rawUrl = req?.query?.callbackUrl;

  // // 2. Fallback: Check the NextAuth internal cookie (During OAuth callback)
  // if (!rawUrl && req?.cookies) {
  //   // Note: Use '__Secure-next-auth.callback-url' if in production/SSL
  //   rawUrl =
  //     req.cookies["next-auth.callback-url"] ||
  //     req.cookies["__Secure-next-auth.callback-url"];
  // }

  // // 3. Last Resort: Referer header
  // if (!rawUrl && req?.headers?.referer) {
  //   rawUrl = req.headers.referer;
  // }

  // let trueHost = "";
  // try {
  //   if (rawUrl) {
  //     // Decode if it's double-encoded from the browser
  //     const decodedUrl = decodeURIComponent(rawUrl);
  //     const targetUrlObj = new URL(
  //       decodedUrl.startsWith("/")
  //         ? `https://salesmanpro.site${decodedUrl}`
  //         : decodedUrl,
  //     );
  //     trueHost = targetUrlObj.hostname;
  //   }
  // } catch (e) {
  //   console.error("Failed to parse trueHost:", e);
  // }

  // // Fallback to baseUrl if everything else fails
  // if (!trueHost) trueHost = new URL(baseUrl).hostname;

  // 1. Get the original URL from the NextAuth callback cookie (most reliable during Sign-In)
  const callbackCookie =
    req?.cookies?.["next-auth.callback-url"] ||
    req?.cookies?.["__Secure-next-auth.callback-url"];

  // // 2. Fallback to the query string
  // const callbackQuery = req?.query?.callbackUrl;

  // // 3. Final fallback to the system baseUrl
  // const finalUrl = callbackQuery || callbackCookie || baseUrl;

  // let trueHost = "";
  // try {
  //   const targetUrlObj = new URL(decodeURIComponent(finalUrl));
  //   trueHost = targetUrlObj.hostname;
  // } catch (e) {
  //   trueHost = new URL(baseUrl).hostname;
  // }
  // Inside your authOptions(req)
  const query = req?.query || {};

  // 1. Check for the 'target' param (specific to your handover logic)
  // 2. Check for 'callbackUrl' (NextAuth standard)
  let rawTarget = "";

  // 🔥 FIRST: Try cookie (most reliable after OAuth)
  try {
    const cookie = req?.cookies?.auth_target;
    if (cookie) {
      const parsed = JSON.parse(decodeURIComponent(cookie));
      rawTarget = parsed.target;
    }
  } catch {}

  // 🔥 THEN fallback to query/callbacks ONLY if empty
  if (!rawTarget) {
    const candidates = [
      query.target,
      query.callbackUrl,
      callbackCookie,
    ];

    for (const candidate of candidates) {
      if (isValidTarget(candidate)) {
        rawTarget = candidate!;
        break;
      }
    }
  }

  const context = {
    target: rawTarget,
    timestamp: Date.now(),
  };

  if (rawTarget && req?.res) {
    try {
      req.res.setHeader(
        "Set-Cookie",
        `auth_target=${encodeURIComponent(JSON.stringify(context))}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      );
    } catch (e) {
      console.log("Failed to set auth_target cookie");
    }
  }


  try {
    const cookie = req?.cookies?.auth_target;
    if (cookie) {
      const parsed = JSON.parse(decodeURIComponent(cookie));
      rawTarget = parsed.target;
    }
  } catch {}

  let trueHost = "";

  if (rawTarget) {
    try {
      // If it's a full URL, parse it. If it's just a path, it's the Main App.
      const decodedTarget = decodeURIComponent(rawTarget);
      if (decodedTarget.startsWith("http")) {
        trueHost = new URL(decodedTarget).hostname;
      } else {
        // It's a relative path like "/dashboard", so the host is the current baseUrl
        trueHost = new URL(baseUrl).hostname;
      }
    } catch (e) {
      trueHost = new URL(baseUrl).hostname;
    }
  } else {
    // No target/callback? Fallback to the physical host of the request
    // trueHost = req?.headers?.host || new URL(baseUrl).hostname;
    const fallbackHost = new URL(baseUrl).hostname;

    trueHost = fallbackHost;
  }

  if (trueHost === "auth.salesmanpro.site") {
    console.warn("🚫 Blocking auth domain as trueHost");

    // try recover from cookie again
    try {
      const cookie = req?.cookies?.auth_target;
      if (cookie) {
        const parsed = JSON.parse(decodeURIComponent(cookie));
        const recovered = new URL(parsed.target).hostname;

        if (recovered !== "auth.salesmanpro.site") {
          trueHost = recovered;
        }
      }
    } catch {}

    // FINAL fallback
    if (trueHost === "auth.salesmanpro.site") {
      trueHost = "salesmanpro.site";
    }
  }
  // Clean up: remove "www." to keep slugs consistent
  trueHost = trueHost.replace("www.", "");

  const mainDomains = ["salesmanpro.site", "www.salesmanpro.site"];
  const isMainApp = mainDomains.includes(trueHost) || trueHost === "localhost";;

  return {
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
            console.error("Authorize: No token provided.");
            return null;
          }

          // 🚨 CRITICAL DEBUGGING LINE: Log the received token's length
          console.log(
            `Authorize: Token received. Length: ${credentials.token.length}.`,
          );

          try {
            // Decode the token using the shared secret
            const decodedToken = await decode({
              token: credentials.token,
              secret: aSharedSecret!,
            });

            if (!decodedToken || !decodedToken.email) {
              console.error(
                "Authorize: Token decoding failed or no email/data found.",
              );
              // Log the result of the decode attempt if it failed without an exception
              console.log("Decoded Result (if available):", decodedToken);
              return null;
            }

            // 🚀 SUCCESS: Log the email/user ID to confirm decoding worked
            console.log(
              `Token Sign-In SUCCESS for email: ${decodedToken.email}`,
            );

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
            console.error("-----------------------------------------------");
            console.error(
              "TOKEN AUTHORIZATION FAILED! Reason:",
              (error as Error).message,
            );
            console.error("Full Error Object:", error);
            console.error(
              "Action needed: Check NEXTAUTH_SECRET on both domains.",
            );
            console.error("-----------------------------------------------");
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

          const userFoundInDb = await findExistingUserByEmail(
            credentials.email,
          );
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
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
          },
        },
        // authorization: {
        //   params: {
        //     redirect_uri: `https://auth.salesmanpro.site/api/auth/callback/google`,
        //   },
        // },
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
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
      generateSessionToken: () =>
        randomUUID?.() ?? randomBytes(32).toString("hex"),
    },

    // ✅ AUTO-LINK OAUTH LOGINS HERE
    callbacks: {
      async redirect({ url, baseUrl }) {
        const HUB_URL = "https://salesmanpro.site";
        const AUTH_HOST = new URL(baseUrl).hostname;

        // const finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
        if (url.includes("/api/auth/handover")) {
          return url; // 🚀 STOP processing immediately
        }

        let finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

        req?.res?.setHeader("Set-Cookie", "auth_target=; Path=/; Max-Age=0");

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
          // const trueHosst = getTrueOrigin();
          const trueHost = targetHost;

          console.log("Redirect Callback Invoked:", {
            finalRedirectUrl,
            targetHost,
            trueHost,
            targetPath,
            // trueHosst,
          });
          // ✅ جلوگیری infinite loops
          if (
            finalRedirectUrl.includes("/api/auth/handover") ||
            finalRedirectUrl.includes("/failure")
          ) {
            return finalRedirectUrl;
          }

          // ✅ Allow internal auth routes
          if (targetHost === AUTH_HOST) {
            if (
              targetPath.startsWith("/api/auth") ||
              targetPath === "/signin"
            ) {
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
          console.log("Redirect Callback Error:", error);
          return `${HUB_URL}/failure?reason=invalid_redirect&error=${encodeURIComponent(error instanceof Error ? error.message : "unknown_error")}`;
        }
      },

      async signIn({ user, account }) {
        if (!account || account.provider === "credentials") return true;
        if (!user.email) return false;

        // const host = reqHost || "";
        // const trueHost = getTrueOrigin(reqHost);
        // const mainDomains = ["salesmanpro.site", "www.salesmanpro.site"];
        // const isMainApp =
        //   mainDomains.includes(trueHost) || host.includes("localhost");

        // 🚨 FIX 1: Check if user actually exists in DB before trying to link a Consumer
        // This prevents the "First Login Error"
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });

        console.log("Sign-In Callback:", {
          email: user.email,
          trueHost,
          isMainApp,
          existingUserId: existingUser?.id,
        });

        if (!isMainApp && existingUser) {
          console.log(
            `Attempting to link ${user.email} to a company based on host ${trueHost}...`,
          );
          const possibleSlug = trueHost.split(".")[0];
          const company = await prisma.company.findFirst({
            where: { OR: [{ domain: trueHost }, { slug: possibleSlug }] },
          });

          if (company) {
            console.log(
              `Linking ${user.email} to company ${company.name} as CONSUMER.`,
            );

            await prisma.consumer.upsert({
              where: {
                userId_companyId: {
                  userId: existingUser.id,
                  companyId: company.id,
                },
              },
              update: {},
              create: {
                userId: existingUser.id,
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
            role: (user as any).role,
            profilePicture: (user as any).profilePicture,
            trueHost: trueHost, // 🔥 PERSIST THE TENANT HOST
            isMainApp: isMainApp,
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
            trueHost: token.trueHost, // 🔥 EXPOSE TO CLIENT
            isMainApp: token.isMainApp,
          });
        }
        return session;
      },
    },

    secret: aSharedSecret, //process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/signin",
    },

    events: {
      async createUser({ user }) {
        // 🚨 FIX 2: Handle "First Login" logic here.
        // This fires AFTER the user is safely in the DB.
        // const host = reqHost || "";
        // const trueHost = getTrueOrigin(reqHost);

        // // Improved main app detection
        // const mainDomains = ["salesmanpro.site", "www.salesmanpro.site"];
        // const isMainApp =
        //   mainDomains.includes(trueHost) || host.includes("localhost");

        console.log("Create User Event:", {
          userId: user.id,
          email: user.email,
          trueHost,
          isMainApp,
        });

        if (isMainApp) {
          console.log(
            `Registering ${user.email} as ADMIN since they signed up via the main app.`,
          );
          // ✅ Register as ADMIN if they joined via the main site
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        } else {
          // Register as tenant user
          const possibleSlug = trueHost.split(".")[0];
          const company = await prisma.company.findFirst({
            where: { OR: [{ domain: trueHost }, { slug: possibleSlug }] },
          });
          console.log(`Company lookup for ${user.email}:`, {
            trueHost,
            possibleSlug,
            companyId: company?.id,
          });
          if (company) {
            console.log(
              `Linking ${user.email} to company ${company.name} as CONSUMER.`,
            );
            await prisma.$transaction([
              prisma.user.update({
                where: { id: user.id },
                data: { role: "USER" },
              }),
              prisma.consumer.create({
                data: {
                  userId: user.id,
                  companyId: company.id,
                },
              }),
            ]);
          }
        }
      },
    },
  };
};

// ✅ For Next.js App Router
export const getAuthSession = () => getServerSession(authOptions());
