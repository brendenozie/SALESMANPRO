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

// export const authOptions: NextAuthOptions = {
export const authOptions = (reqHost?: string): NextAuthOptions => ({
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
          console.log(`Token Sign-In SUCCESS for email: ${decodedToken.email}`);

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
    // CredentialsProvider({
    //   // An ID for this custom provider
    //   id: "token-signin",
    //   name: "Token Sign-In",
    //   credentials: {
    //     token: { label: "Token", type: "text" },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.token) {
    //       console.error("Authorize: No token provided.");
    //       return null;
    //     }

    //     try {
    //       // Decode the token using the shared secret
    //       const decodedToken = await decode({
    //         token: credentials.token,
    //         secret: aSharedSecret,
    //       });

    //       if (!decodedToken || !decodedToken.email) {
    //         console.error("Authorize: Token decoding failed or no email found.");
    //         return null;
    //       }

    //       // The decoded token is trusted. Return it as the user object.
    //       // This object will be passed to the 'jwt' callback.
    //       return {
    //         id: decodedToken.id as string,
    //         name: decodedToken.name,
    //         email: decodedToken.email,
    //         image: decodedToken.image,
    //         role: decodedToken.role, // Pass through your custom properties
    //         // ... add other properties from your token
    //       };
    //     } catch (error) {
    //       console.error("Token authorization error:", error);
    //       return null;
    //     }
    //   },
    // }),
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
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    generateSessionToken: () =>
      randomUUID?.() ?? randomBytes(32).toString("hex"),
  },
  // inside authOptions
  // events: {
  //   async createUser({ user }) {
  //     // This runs ONLY when a new user is created in the DB
  //     const host = reqHost || "";
  //     const cleanHost = host.split(":")[0].replace(/^www\./, "");
  //     const mainDomains = ["salesmanpro.site"];
  //     const isMainApp =
  //       mainDomains.includes(cleanHost) || host.includes("localhost");
  //     // const isMainApp = host.includes("salesmanpro.site") && !host.includes("tenant");

  //     if (!isMainApp && user.email) {
  //       const domain = host.split(":")[0].replace("www.", "");
  //       const company = await prisma.company.findFirst({
  //         where: { domain: domain },
  //       });

  //       if (company) {
  //         await prisma.consumer.create({
  //           data: {
  //             companyId: company.id,
  //             userId: user.id,
  //           },
  //         });
  //       }
  //     }
  //   },
  // },
  // ✅ AUTO-LINK OAUTH LOGINS HERE
  callbacks: {
    async redirect({ url, baseUrl }) {
      const HUB_URL = "https://salesmanpro.site";
      const AUTH_HOST = new URL(baseUrl).hostname;

      const finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

      try {
        const targetUrlObj = new URL(finalRedirectUrl);
        const targetHost = targetUrlObj.hostname;
        const targetPath = targetUrlObj.pathname;
        const trueHosst = getTrueOrigin(reqHost);
        const trueHost = targetHost;

        console.log("Redirect Callback Invoked:", { finalRedirectUrl, targetHost, trueHost, targetPath, trueHosst });  
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
        console.log("Redirect Callback Error:", error);
        return `${HUB_URL}/failure?reason=invalid_redirect&error=${encodeURIComponent(error instanceof Error ? error.message : "unknown_error")}`;
        }
    },
    // async redirect({ url, baseUrl }) {
    //   const HUB_URL = "https://salesmanpro.site";
    //   const AUTH_HOST = new URL(baseUrl).hostname;

    //   const finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

    //   try {
    //     const targetUrlObj = new URL(finalRedirectUrl);
    //     const targetHost = targetUrlObj.hostname;
    //     const targetPath = targetUrlObj.pathname;

    //     // ✅ CHECK 1: Internal Auth Server Paths
    //     // Don't intercept calls to the auth server's own internal routes (callbacks, session, etc.)
    //     // or the handover route itself.
    //     if (targetHost === AUTH_HOST) {
    //       if (targetPath.startsWith("/api/auth") || targetPath === "/signin") {
    //         return finalRedirectUrl;
    //       }
    //     }

    //     // const trueOrigin = targetHost; // fallback

    //     // OPTIONAL (better if you pass reqHost into authOptions)
    //     const trueOrigin = getTrueOrigin(reqHost);

    //     const mainHubDomains = ["salesmanpro.site", "www.salesmanpro.site"];

    //     // ✅ 1. INTERNAL auth routes (safe, session exists)z
    //     // if (targetHost === AUTH_HOST && targetUrlObj.pathname !== "/") {
    //     //   return finalRedirectUrl;
    //     // }

    //     // ✅ 2. EVERYTHING ELSE (hub, tenants, custom domains)
    //     // MUST go through handover to preserve session
    //     const handoverUrl = new URL("/api/auth/handover", baseUrl);

    //     // 👉 If going to root hub, upgrade to /dashboards
    //     if (mainHubDomains.includes(trueOrigin)) {
    //       handoverUrl.searchParams.set("target", `${HUB_URL}/dashboards`);
    //     } else {
    //       handoverUrl.searchParams.set("target", finalRedirectUrl);
    //     }

    //     return handoverUrl.toString();
    //   } catch (error) {
    //     return `${HUB_URL}/failure?reason=invalid_redirect`;
    //   }
    // },
    // async redirect({ url, baseUrl }) {
    //     // Define your Main Hub clearly
    //     const HUB_URL = "https://salesmanpro.site";
    //     const AUTH_HOST = new URL(baseUrl).hostname; // auth.salesmanpro.site

    //     // 1. Resolve the absolute destination URL
    //     const finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

    //     try {
    //       const targetUrlObj = new URL(finalRedirectUrl);
    //       const targetHost = targetUrlObj.hostname;

    //       // 2. Define your "Main Hub" domains
    //       const mainHubDomains = ["salesmanpro.site", "www.salesmanpro.site"];

    //       /**
    //        * LOGIC A: If the target is the Auth Server itself OR the Main Hub
    //        * We FORCE them to the dashboards page on the Main Hub.
    //        * This prevents them from landing on auth.salesmanpro.site/anything
    //        */
    //       if (targetHost === AUTH_HOST || mainHubDomains.includes(targetHost)) {
    //         return `${HUB_URL}/dashboards`;
    //       }

    //       /**
    //        * LOGIC B: If the target is a Tenant (subdomain.salesmanpro.site or customdomain.com)
    //        * We use the Handover route to sync the session safely.
    //        */
    //       const handoverUrl = new URL("/api/auth/handover", baseUrl);
    //       handoverUrl.searchParams.set("target", finalRedirectUrl);

    //       return handoverUrl.toString();

    //     } catch (error) {
    //       /**
    //        * FALLBACK: If anything goes wrong or the URL is weird,
    //        * NEVER return baseUrl (auth). Always send to the Hub Dashboard.
    //        */
    //       return `${HUB_URL}/dashboards`;
    //     }
    //   },

    // async redirect({ url, baseUrl }) {
    //   // 1. Resolve the absolute destination URL
    //   const finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

    //   try {
    //     const targetHost = new URL(finalRedirectUrl).hostname;
    //     const baseHost = new URL(baseUrl).hostname; // e.g., auth.salesmanpro.site or salesmanpro.site

    //     // 2. Define your "Main Hub" domains
    //     const mainHubDomains = ["salesmanpro.site", "www.salesmanpro.site"];

    //     // 3. Logic for Main Hub
    //     if (mainHubDomains.includes(targetHost)) {
    //       // Force them to the dashboards page on the hub
    //       return `${baseUrl}/dashboards`;
    //     }

    //     // 4. Logic for Internal Auth Redirects
    //     // If it's just going back to the auth server itself (e.g., /settings)
    //     if (finalRedirectUrl.startsWith(baseUrl)) {
    //       return finalRedirectUrl;
    //     }

    //     // 5. Logic for Tenants (Subdomains/Custom Domains)
    //     // Send them to your handover route to pass the session token safely
    //     const handoverUrl = new URL("/api/auth/handover", baseUrl);
    //     handoverUrl.searchParams.set("target", finalRedirectUrl);

    //     return handoverUrl.toString();

    //   } catch (error) {
    //     // Fallback if URL parsing fails
    //     return baseUrl;
    //   }
    // },

    // async redirect({ url, baseUrl }) {
    //   // The `url` parameter is the destination URL after a successful login.
    //   // It's already the `callbackUrl` you passed to `signIn`.

    //   // `url` might be a relative path (e.g., "/dashboard").
    //   // Check if the URL is relative.
    //   const isRelative = url.startsWith("/");

    //   // If it's relative, combine it with the baseUrl to make it absolute.
    //   // Otherwise, the `url` is already the absolute `callbackUrl` from the client.
    //   const finalRedirectUrl = isRelative ? `${baseUrl}${url}` : url;

    //   // The problem is that after the first login, the session isn't available
    //   // yet to generate a token inside the redirect callback.
    //   // The better pattern is to just return the URL and have the
    //   // client-side handle the token.

    //   // For your cross-domain authentication, you need to append the token.
    //   // Instead of getting the session here, we will redirect to an
    //   // intermediary page on your auth domain that will have the session.

    //   // 1. Redirect to a page on your auth domain, like `/redirecting`
    //   // const tempRedirect = new URL("/redirecting", baseUrl);

    //   // 2. Pass the final destination (the tenant URL) as a query parameter.
    //   // tempRedirect.searchParams.set("callbackUrl", finalRedirectUrl);

    //   // Let next-auth handle the session creation, then send the user to this temp page.
    //   // This works because by the time the user hits "/redirecting", the session cookie is set.
    //   // if (finalRedirectUrl.startsWith(baseUrl)) {
    //   // It's an internal redirect, just go there.
    //   // return finalRedirectUrl;
    //   // } else {
    //   // It's an external redirect, go via the temp page.
    //   // return tempRedirect.toString();
    //   // }
    //   // const finalRedirectUrl = isRelative ? `${baseUrl}${url}` : url;

    //   // If it's internal, just go there
    //   if (finalRedirectUrl.startsWith(baseUrl)) return finalRedirectUrl;

    //   // If it's cross-domain, send them to your SERVER-SIDE handover route
    //   const handoverUrl = new URL("/api/auth/callback", baseUrl); // Points to your route.ts
    //   handoverUrl.searchParams.set("target", finalRedirectUrl);
    //   return handoverUrl.toString();
    // },

    //import { headers } from "next/headers";
    //// ... other imports
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;

      const host = reqHost || "";

      const trueHost = getTrueOrigin(reqHost);
      // const cleanHost = host.split(":")[0].replace(/^www\./, "");
      const mainDomains = ["salesmanpro.site"];
      // const isMainApp = mainDomains.includes(cleanHost) || host.includes("localhost");
      const isMainApp =
        mainDomains.includes(trueHost) || host.includes("localhost");

      // 1. Check if user exists BEFORE NextAuth tries to create them
      // const existingUser = await prisma.user.findUnique({
      //   where: { email: user.email },
      // });

      // if (existingUser) {
      //   // If logging into main app, ensure they have ADMIN role
      //   if (isMainApp && existingUser.role === "USER") {
      //     await prisma.user.update({
      //       where: { id: existingUser.id },
      //       data: { role: "ADMIN" },
      //     });
      //   }
      // }

      // if (existingUser && isMainApp && existingUser.role !== "ADMIN") {
      //   await prisma.user.update({
      //     where: { id: existingUser.id },
      //     data: { role: "ADMIN" },
      //   });
      // }

      if (!isMainApp) {
        const possibleSlug = trueHost.split(".")[0];
        const company = await prisma.company.findFirst({
          where: { OR: [{ domain: trueHost }, { slug: possibleSlug }] },
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
      }

      // 2. DO NOT manually create the User or Account here.
      // Returning true allows the PrismaAdapter to do it safely.
      return true;
    },

    // async signIn({ user, account, profile }) {
    //   // 1. Skip if not OAuth
    //   if (!account || account.provider === "credentials") return true;
    //   if (!user.email) return false;

    //   // 2. Determine the origin (Server-side)
    //   // const host = (await headers()).get("host") || ""; // e.g., "tenant1.salesmanpro.site"
    //   const host = reqHost || "";
    //   // const isSalesmanPro = host === "salesmanpro.site" || host === "www.salesmanpro.site";

    //   // Removes the port (e.g., :3000) and the "www." prefix
    //   const cleanHost = host.split(":")[0].replace(/^www\./, "");

    //   // 1. Define your primary domains
    //   const mainDomains = ["salesmanpro.site"];

    //   // 2. Check for exact match + allow localhost to be ADMIN for testing
    //   const isMainApp =
    //     mainDomains.includes(cleanHost) ||
    //     host.includes("localhost") ||
    //     host.includes("127.0.0.1");

    //   // 3. Assign role
    //   const assignedRole = isMainApp ? "ADMIN" : "USER";

    //   // 3. Look for existing user
    //   const existingUser = await prisma.user.findUnique({
    //     where: { email: user.email },
    //   });

    //   if (existingUser) {
    //     // 1. ROLE ELEVATION LOGIC
    //     // If an existing tenant-user logs into the main site, upgrade them to ADMIN
    //     if (isMainApp && existingUser.role === "USER") {
    //       await prisma.user.update({
    //         where: { id: existingUser.id },
    //         data: { role: "ADMIN" },
    //       });
    //     }

    //     // Check if this specific account (provider + providerId) is already linked
    //     const existingAccount = await prisma.account.findUnique({
    //       where: {
    //         provider_providerAccountId: {
    //           provider: account.provider,
    //           providerAccountId: account.providerAccountId,
    //         },
    //       },
    //     });

    //     if (!existingAccount) {
    //       // ✅ LINK: The user exists but hasn't used this provider before
    //       await prisma.account.create({
    //         data: {
    //           userId: existingUser.id, // Use DB ID, not OAuth ID
    //           provider: account.provider,
    //           providerAccountId: account.providerAccountId,
    //           type: account.type,
    //           access_token: account.access_token,
    //           refresh_token: account.refresh_token,
    //           expires_at: account.expires_at,
    //           token_type: account.token_type,
    //           scope: account.scope,
    //           id_token: account.id_token,
    //           session_state: account.session_state,
    //         },
    //       });
    //     }
    //     return true;
    //   }

    //   // 4. NEW USER PATH
    //   // const assignedRole = isSalesmanPro ? "ADMIN" : "USER";

    //   const newUser = await prisma.user.create({
    //     data: {
    //       email: user.email,
    //       name: user.name ?? "",
    //       image: user.image,
    //       role: assignedRole,
    //       accounts: {
    //         create: {
    //           provider: account.provider,
    //           providerAccountId: account.providerAccountId,
    //           type: account.type,
    //           access_token: account.access_token,
    //           refresh_token: account.refresh_token,
    //           expires_at: account.expires_at,
    //           token_type: account.token_type,
    //           scope: account.scope,
    //           id_token: account.id_token,
    //           session_state: account.session_state,
    //         },
    //       },
    //     },
    //   });

    //   // 5. TENANT LOGIC
    //   if (!isMainApp) {
    //     // Extract domain (remove port if local dev)
    //     const domain = host.split(":")[0].replace("www.", "");

    //     const company = await prisma.company.findFirst({
    //       where: { domain: domain },
    //     });

    //     if (company) {
    //       await prisma.consumer.upsert({
    //         where: { userId: newUser.id },
    //         update: {},
    //         create: {
    //           companyId: company.id,
    //           userId: newUser.id,
    //         },
    //       });
    //     }
    //   }

    //   return true;
    // },
    // async signIn({ user, account, profile, credentials }) {
    //   // Skip if not OAuth
    //   if (!account || account.provider === "credentials") return true;

    //   if (!user.email) return false;

    //   // Determine the origin (which domain the request came from)
    //   // Use Next.js server headers() because NextAuth's signIn callback type does not provide `req`
    //   let origin = "";

    //   if (typeof window === "undefined") {
    //     // We're on the server – use process.env or baseUrl fallback
    //     origin = baseUrl;
    //   } else {
    //     // We're on the client
    //     origin = window.location.origin;
    //   }

    //   //is origin or baseUrl the parent domain of salesmanpro.site? This is important for determining if the user should be an ADMIN or USER
    //   // user might be coming from salesmanpro.site or from a tenant domain like tenant1.salesmanpro.site and if so they should be a USER not an ADMIN
    //   const isSalesmanPro =
    //     origin.includes("salesmanpro.site") ||
    //     baseUrl.includes("salesmanpro.site");

    //   const existingUser = await prisma.user.findUnique({
    //     where: { email: user.email },
    //   });

    //   if (existingUser) {
    //     // ✅ Check if this OAuth provider is already linked
    //     const existingAccount = await prisma.account.findUnique({
    //       where: {
    //         provider_providerAccountId: {
    //           provider: account.provider,
    //           providerAccountId: account.providerAccountId,
    //         },
    //       },
    //     });

    //     if (!existingAccount) {
    //       // ✅ Link the new OAuth provider to the existing user
    //       await prisma.account.create({
    //         data: {
    //           userId: existingUser.id,
    //           provider: account.provider,
    //           providerAccountId: account.providerAccountId,
    //           type: account.type,
    //           access_token: account.access_token,
    //           refresh_token: account.refresh_token,
    //           expires_at: account.expires_at,
    //           token_type: account.token_type,
    //           scope: account.scope,
    //           id_token: account.id_token,
    //           session_state: account.session_state,
    //         },
    //       });
    //     }

    //     // ✅ Allow sign in — this fixes OAuthAccountNotLinked
    //     return true;
    //   }

    //   // New OAuth signup → decide role based on origin
    //   const assignedRole = isSalesmanPro ? "ADMIN" : "USER";

    //   // ✅ If no existing user, create a new one
    //   await prisma.user.create({
    //     data: {
    //       email: user.email,
    //       name: user.name ?? "",
    //       image: user.image,
    //       role: assignedRole, // Default role
    //       accounts: {
    //         create: {
    //           provider: account.provider,
    //           providerAccountId: account.providerAccountId,
    //           type: account.type,
    //           access_token: account.access_token,
    //           refresh_token: account.refresh_token,
    //           expires_at: account.expires_at,
    //           token_type: account.token_type,
    //           scope: account.scope,
    //           id_token: account.id_token,
    //           session_state: account.session_state,
    //         },
    //       },
    //     },
    //   });

    //   if (!isSalesmanPro) {
    //     const company = await prisma.company.findFirst({
    //       where: { domain: origin.replace("www.", "") },
    //     });

    //     if (company) {
    //       const consumer = await prisma.consumer.upsert({
    //         where: { userId: user.id },
    //         update: {},
    //         create: {
    //           companyId: company.id,
    //           userId: user.id,
    //         },
    //         include: { user: true },
    //       });
    //     }
    //   }

    //   return true;
    // },

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

  events: {
    async createUser({ user }) {
      // This runs ONLY for brand new users right after they are saved to the DB
      const host = reqHost || "";
      const trueHost = getTrueOrigin(reqHost);

      // const cleanHost = host.split(":")[0].replace(/^www\./, "");
      const isMainApp =
        trueHost === "salesmanpro.site" || host.includes("localhost");

      if (!isMainApp) {
        // 1. Find the company matching this subdomain/custom domain
        const company = await prisma.company.findFirst({
          where: { domain: trueHost },
        });

        if (company) {
          // 2. Link them as a consumer and ensure their role is USER
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
      } else {
        // If they created an account on the main site, make them an ADMIN
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
});

// ✅ For Next.js App Router
export const getAuthSession = () => getServerSession(authOptions());
