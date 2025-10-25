// File: lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
// import EmailProvider from "next-auth/providers/email";
import prisma from "@/server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";

const baseUrl = process.env.NEXTAUTH_URL || "https://salesmanpro.site";

// ✅ Utility: find existing user by email
async function findExistingUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user || null;
}

// ✅ Utility: find Student/Educator by login code (passwordless flow)
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

  return null;
}

// ✅ Default user creation (OAuth signups only)
async function createDefaultUser({ email, name, image }: { email: string; name?: string; image?: string }) {
  return prisma.user.create({
    data: {
      email,
      name: name ?? "",
      role: "ADMIN", // Default role for new OAuth signups
      image,
    },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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

        const passwordMatch = await bcrypt.compare(credentials.password, userFoundInDb.password);
        if (!passwordMatch) return null;

        // ✅ Role detection logic
        let determinedRole: string | undefined = userFoundInDb.role || undefined;
        const studentCheck = await prisma.student.findUnique({ where: { userId: userFoundInDb.id } });
        const educatorCheck = await prisma.educator.findUnique({ where: { userId: userFoundInDb.id } });
        const consumerCheck = await prisma.consumer.findUnique({ where: { userId: userFoundInDb.id } });
        const salesAgentCheck = await prisma.salesAgent.findUnique({ where: { userId: userFoundInDb.id } });
        const clientCheck = await prisma.client.findUnique({ where: { userId: userFoundInDb.id } });

        if (studentCheck) determinedRole = "STUDENT";
        else if (consumerCheck) determinedRole = "CONSUMER";
        else if (salesAgentCheck) determinedRole = "SALES_AGENT";
        else if (clientCheck) determinedRole = "CLIENT";
        else if (educatorCheck) determinedRole = "EDUCATOR";

        return {
          id: userFoundInDb.id,
          name: userFoundInDb.name ?? undefined,
          email: userFoundInDb.email,
          role: determinedRole as any,
          phone: userFoundInDb.phone ?? undefined,
          username: userFoundInDb.username ?? undefined,
          bio: userFoundInDb.bio ?? undefined,
          address: userFoundInDb.address ?? undefined,
          profilePicture: (userFoundInDb.profilePicture ?? userFoundInDb.image) ?? undefined,
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
        if (credentials.loginCode.length !== 6 || !/^\d+$/.test(credentials.loginCode)) return null;

        const loginCodeResult = await findUserByLoginCode(credentials.loginCode);
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
          profilePicture: (user.profilePicture ?? user.image) ?? undefined,
        };
      },
    }),

    // ✅ OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
    generateSessionToken: () => randomUUID?.() ?? randomBytes(32).toString("hex"),
  },

  // ✅ AUTO-LINK OAUTH LOGINS HERE
  callbacks: {

     async redirect({ url, baseUrl }) {
        try {
          const callbackUrl = new URL(url, baseUrl).searchParams.get("callbackUrl");
          const target = new URL(url, baseUrl).searchParams.get("target");

          // console.log(callbackUrl);
          // console.log("callbackUrl");
          // console.log(target);
          // console.log("target")
          // console.log(url);
          // console.log("url");
          // console.log(baseUrl);
          // console.log("baseUrl");
          
          // If login originated from a custom domain
          if (callbackUrl || target ) {
            const session = await getServerSession(authOptions);
            const userId = String((session?.user as any)?.id ?? (session?.user?.email ?? ""));
            const tokenPayload = {
              name: session?.user?.name,
              email: session?.user?.email,
              image: session?.user?.image,
              // include id as required by the JWT type
              id: userId,
              // include id as `sub` for compatibility
              sub: userId,
            };
            const token = await encode({
              token: tokenPayload,
              secret: process.env.NEXTAUTH_SECRET!,
            });

            // Ensure the value passed to URL is a non-null string (TypeScript can't infer from the outer if)
            const redirectValue = callbackUrl ?? target;
            if (!redirectValue) return baseUrl;
            const redirectUrl = new URL(redirectValue);
            redirectUrl.searchParams.set("auth", "success");
            redirectUrl.searchParams.set("token", token);
            return redirectUrl.toString();
          }

          // Default behavior (for auth.salesmanpro.site itself)
          return baseUrl;
        } catch (error) {
          console.error("Redirect error:", error);
          return baseUrl;
        }
      },

    // async redirect({ url, baseUrl }) {
    //   try {
    //     const target = new URL(url, baseUrl);
    //     const callbackUrl = target.searchParams.get("callbackUrl");

    //     // ✅ If an external callbackUrl exists, redirect user there after successful auth
    //     // if (callbackUrl) return decodeURIComponent(callbackUrl);
    //     if (callbackUrl) {
    //       const urlObj = new URL(decodeURIComponent(callbackUrl));
    //       urlObj.searchParams.set("auth", "success");
    //       return urlObj.toString();
    //     }

    //     // ✅ Otherwise, use baseUrl
    //     return baseUrl;
    //   } catch {
    //     return baseUrl;
    //   }
    // },

    async signIn({ user, account }) {
  // Skip if not OAuth
  if (!account || account.provider === "credentials") return true;

  if (!user.email) return false;

  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (existingUser) {
    // ✅ Check if this OAuth provider is already linked
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    });

    if (!existingAccount) {
      // ✅ Link the new OAuth provider to the existing user
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    }

    // ✅ Allow sign in — this fixes OAuthAccountNotLinked
    return true;
  }

  // ✅ If no existing user, create a new one
  await prisma.user.create({
    data: {
      email: user.email,
      name: user.name ?? "",
      image: user.image,
      role: "ADMIN", // Default role
      accounts: {
        create: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      },
    },
  });

  return true;
},


    // async signIn({ user, account }) {
    //   // OAuth ONLY (skip credentials)
    //   if (account && account.provider !== "credentials") {
    //     if (!user.email) return false;

    //     const existingUser = await findExistingUserByEmail(user.email);
    //     if (existingUser) {
    //       // ✅ Link OAuth provider to existing user
    //       await prisma.account.upsert({
    //         where: {
    //           provider_providerAccountId: {
    //             provider: account.provider,
    //             providerAccountId: account.providerAccountId,
    //           },
    //         },
    //         update: {},
    //         create: {
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
    //     } else {
    //       // First-time OAuth signup → create default User record
    //       await createDefaultUser({ email: user.email!, name: user.name!, image: user.image! });
    //     }

    //     return true;
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

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};

// ✅ For Next.js App Router
export const getAuthSession = () => getServerSession(authOptions);

// // File: lib/auth.ts

// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { NextAuthOptions } from "next-auth";
// import { getServerSession } from "next-auth/next";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import FacebookProvider from "next-auth/providers/facebook";
// import AppleProvider from "next-auth/providers/apple";
// import EmailProvider from "next-auth/providers/email";
// import prisma from "@/server/db/prismadb";
// import { randomBytes, randomUUID } from "crypto";
// import bcrypt from 'bcryptjs'; // Keep bcryptjs for your existing email/password flow

// // Utility to find any existing user across multiple models by EMAIL
// async function findExistingUserByEmail(email: string) {
//   const user = await prisma.user.findUnique({ where: { email } });
//   console.log("User found in DB:", user); 
//   if (user) return user;
//   return null;
// }

// // Utility to find user by LOGIN CODE (for the new passwordless flow)
// async function findUserByLoginCode(loginCode: string) {
//   const student = await prisma.student.findUnique({
//     where: { loginCode },
//     include: { user: true }, // Include the associated User model
//   });
//   if (student) {
//     return { user: student.user, role: student.levelStatus || 'STUDENT' };
//   }

//   const educator = await prisma.educator.findUnique({
//     where: { loginCode },
//     include: { user: true }, // Include the associated User model
//   });
//   if (educator) {
//     return { user: educator.user, role: 'EDUCATOR' };
//   }

//   // const consumer = await prisma.consumer.findUnique({
//   //   where: { loginCode },
//   //   include: { user: true },
//   // });
//   // if (consumer) {
//   //   return { user: consumer.user, role: 'CONSUMER' };
//   // }

//   // const salesAgent = await prisma.salesAgent.findUnique({
//   //   where: { loginCode },
//   //   include: { user: true },
//   // });
//   // if (salesAgent) {
//   //   return { user: salesAgent.user, role: 'SALES_AGENT' };
//   // }

//   // const client = await prisma.client.findUnique({
//   //   where: { loginCode },
//   //   include: { user: true },
//   // });
//   // if (client) {
//   //   return { user: client.user, role: 'CLIENT' };
//   // } 
//   return null;
// }

// // Create a new user fallback (Keep as is for OAuth sign-ups)
// async function createDefaultUser({ email, name, image }: { email: string; name?: string; image?: string }) {
//   return prisma.user.create({
//     data: {
//       email,
//       name: name ?? "",
//       role: "ADMIN", // Default role for newly created user via OAuth
//       image,
//     },
//   });
// }

// // Function to validate if a string is likely an email (still needed for the generic CredentialsProvider)
// const isEmail = (str: string) => /\S+@\S+\.\S+/.test(str);

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     // Existing Credentials Provider for Email/Password logins (for other sites)
//     CredentialsProvider({
//       id: "credentials-email-password", // Give it a unique ID
//       name: "Email & Password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials, req) {

//         console.log("1");
        
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         console.log(credentials.email);
//         const userFoundInDb = await findExistingUserByEmail(credentials.email);

        
//         console.log("2");
//         if (!userFoundInDb || !userFoundInDb.password ) {// when testing remove password check since the user does have a password
//           console.error("No user found with this email or user has no password set.");
//           return null;
//         }

//         // Compare the provided password with the hashed password
//         const passwordMatch = await bcrypt.compare(credentials.password, userFoundInDb.password);

//         if (!passwordMatch) {
//           console.error("Invalid password for email:", credentials.email);
//           return null;
//         }

//         // Determine role for email/password users
//         // Use undefined instead of null for role if not found, and ensure type matches Role | undefined
//         let determinedRole: string | undefined = userFoundInDb.role || undefined; // Start with generic User role

//         // If the user is linked to a Student or Educator, prioritize that role
//         const studentCheck = await prisma.student.findUnique({ where: { userId: userFoundInDb.id } });
//         const educatorCheck = await prisma.educator.findUnique({ where: { userId: userFoundInDb.id } });
//         const consumerCheck = await prisma.consumer.findUnique({ where: { userId: userFoundInDb.id } });
//         const salesAgentCheck = await prisma.salesAgent.findUnique({ where: { userId: userFoundInDb.id } });
//         const clientCheck = await prisma.client.findUnique({ where: { userId: userFoundInDb.id } });
//         // const doctorCheck = await prisma.doctor.findUnique({ where: { use: userFoundInDb.id } });

//         if (studentCheck) {
//             determinedRole = 'STUDENT';
//         } 
//         else if (consumerCheck) {
//             determinedRole = 'CONSUMER';
//         }
//         else if (salesAgentCheck) {
//             determinedRole = 'SALES_AGENT';
//         }
//         else if (clientCheck) {
//             determinedRole = 'CLIENT';
//         } 
//         else if (educatorCheck) {
//             determinedRole = 'EDUCATOR';
//         }

//         console.log("3");
//         return {
//           id: userFoundInDb.id,
//           name: userFoundInDb.name ?? undefined,
//           email: userFoundInDb.email,
//           role: determinedRole as any, // Cast to any to satisfy User type, or import Role type and use as Role | undefined
//           phone: userFoundInDb.phone ?? undefined,
//           username: userFoundInDb.username ?? undefined,
//           bio: userFoundInDb.bio ?? undefined,
//           address: userFoundInDb.address ?? undefined,
//           profilePicture: (userFoundInDb.profilePicture ?? userFoundInDb.image) ?? undefined,
//         };
//       },
//     }),

//     // NEW Credentials Provider for School Login Code (Passwordless)
//     CredentialsProvider({
//       id: "school-code-login", // Unique ID for this provider
//       name: "School Login Code",
//       credentials: {
//         loginCode: { label: "School Login Code", type: "text" },
//       },
//       async authorize(credentials, req) {
//         if (!credentials?.loginCode) {
//           return null;
//         }

//         // Validate login code format (optional, but good practice)
//         if (credentials.loginCode.length !== 6 || !/^\d+$/.test(credentials.loginCode)) {
//           console.error("Invalid login code format:", credentials.loginCode);
//           return null;
//         }

//         const loginCodeResult = await findUserByLoginCode(credentials.loginCode);

//         if (!loginCodeResult || !loginCodeResult.user) {
//           console.error("No user found with school login code:", credentials.loginCode);
//           return null;
//         }

//         // For a passwordless flow, we directly authenticate if the code is valid.
//         // If you need more security (e.g., one-time codes, expiry, or a "hidden" password),
//         // this is where you'd add that logic.
//         // For example, if you stored a 'lastUsed' timestamp for the loginCode and checked its freshness.

//         const userFoundInDb = loginCodeResult.user;
//         // Import Role type from your Prisma schema or define it if not already imported
//         // import type { Role } from "@prisma/client";
//         const determinedRole = loginCodeResult.role as any; // Cast to 'any' or 'Role' if imported

//         return {
//           id: userFoundInDb.id,
//           name: userFoundInDb.name ?? undefined,
//           email: userFoundInDb.email, // User model still has email
//           role: determinedRole, // 'STUDENT' or 'EDUCATOR'
//           phone: userFoundInDb.phone ?? undefined,
//           username: userFoundInDb.username ?? undefined,
//           bio: userFoundInDb.bio ?? undefined,
//           address: userFoundInDb.address ?? undefined,
//           profilePicture: (userFoundInDb.profilePicture ?? userFoundInDb.image) ?? undefined,
//         };
//       },
//     }),

//     // Keep other providers as they are
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     }),
//     AppleProvider({
//       clientId: process.env.APPLE_CLIENT_ID!,
//       clientSecret: process.env.APPLE_CLIENT_SECRET!,
//     }),
//     EmailProvider({
//       server: process.env.EMAIL_SERVER,
//       from: process.env.EMAIL_FROM,
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60,
//     updateAge: 24 * 60 * 60,
//     generateSessionToken: () => randomUUID?.() ?? randomBytes(32).toString("hex"),
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === "google" && user.email) {
//         const existing = await findExistingUserByEmail(user.email);
//         if (!existing) {
//           await createDefaultUser({ email: user.email, name: user.name!, image: user.image! });
//         }
//       }
//       return true;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         Object.assign(token, {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           phone: (user as any).phone,
//           username: (user as any).username,
//           bio: (user as any).bio,
//           address: (user as any).address,
//           role: (user as any).role,
//           profilePicture: (user as any).profilePicture,
//         });
//       }
//       return token;
//     },
    
//     async session({ session, token }) {
//       if (session.user) {
//         Object.assign(session.user, {
//           id:  token.id as string ,// token.id
//           name: token.name,
//           email: token.email,
//           phone: token.phone,
//           username: token.username,
//           bio: token.bio,
//           address: token.address,
//           role: token.role,
//           profilePicture: token.profilePicture,
//         });
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/signin",
//   },
// };

// // Helper for App Router
// export const getAuthSession = () => getServerSession(authOptions);