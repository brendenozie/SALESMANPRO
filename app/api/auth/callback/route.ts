// File: /app/api/auth/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { encode } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  // 1. Get target and ensure it's an absolute URL to prevent `new URL()` crashes
  const rawTarget = req.nextUrl.searchParams.get("target") || "https://salesmanpro.site";
  const target = rawTarget.startsWith("http") 
    ? rawTarget 
    : `https://salesmanpro.site${rawTarget.startsWith('/') ? '' : '/'}${rawTarget}`;

  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.redirect(`${target}?auth=failed`);
    }

    // 2. YOUR ORIGINAL SAFE PAYLOAD BUILDER
    // This strips out complex objects and ensures `id` is a string
    const userId = String((session.user as any)?.id ?? (session.user?.email ?? ""));
    const tokenPayload = {
      name: session.user?.name,
      email: session.user?.email,
      image: session.user?.image,
      id: userId,     // Required by NextAuth JWT
      sub: userId,    // Required for standard JWT compatibility
    };

    // 3. Encode safely
    const token = await encode({ 
      token: tokenPayload, 
      secret: process.env.NEXTAUTH_SECRET! 
    });

    // 4. Build the final URL securely
    const destination = new URL(target);
    destination.searchParams.set("auth_token", token);
    destination.searchParams.set("auth", "success");

    return NextResponse.redirect(destination.toString());

  } catch (err) {
    console.error("Auth Handover Error:", err);
    // Safe fallback if anything fails
    return NextResponse.redirect(`${target}?auth=error`);
  }
}
// import { NextRequest, NextResponse } from "next/server";
// import { getAuthSession } from "@/lib/auth";
// import { encode } from "next-auth/jwt";

// export async function GET(req: NextRequest) {
//   const target = req.nextUrl.searchParams.get("target") || "https://salesmanpro.site";

//   try {
//     const session = await getAuthSession();

//     if (!session) {
//       return NextResponse.redirect(`${target}?auth=failed`);
//     }

//     // ✅ SECURE: Encoding happens on the server where the secret is safe
//     const token = await encode({
//       token: { 
//         ...session.user, 
//         id: (session.user as any).id,
//         sub: (session.user as any).id 
//       },
//       secret: process.env.NEXTAUTH_SECRET!,
//     });

//     const destination = new URL(target);
//     destination.searchParams.set("auth_token", token);
//     destination.searchParams.set("auth", "success");

//     return NextResponse.redirect(destination.toString());

//   } catch (err) {
//     console.error("Critical Handover Error:", err);
//     return NextResponse.redirect(`${target}?auth=error`);
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import { getAuthSession } from "@/lib/auth"; // adjust this import path
// import { encode } from "next-auth/jwt";

// const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// export async function GET(req: NextRequest) {
//   const target = req.nextUrl.searchParams.get("target") || "https://salesmanpro.site";

//   try {
//     const session = await getAuthSession();

//     if (!session) {
//       // If no session, redirect user back with an error state
//       return NextResponse.redirect(`${target}?auth=failed`);
//     }

    
//     // Optionally, you could sign a short-lived token for cross-domain auth
//     // Example: `${target}/auth/success?token=${token}`
//     // Build a plain object payload compatible with next-auth's JWT type
//     // ensure `id` is present (required by the JWT type) and is a string
//     const userId = String((session.user as any)?.id ?? (session.user?.email ?? ""));
//     const tokenPayload = {
//       name: session.user?.name,
//       email: session.user?.email,
//       image: session.user?.image,
//       // include id as required by the JWT type
//       id: userId,
//       // include id as `sub` for compatibility
//       sub: userId,
//     };
//     const token = await encode({ token: tokenPayload, secret: NEXTAUTH_SECRET! });
//     return NextResponse.redirect(`${target}?auth=success&token=${token}`);


//     // return NextResponse.redirect(`${target}?auth=success`);
//   } catch (err) {
//     console.error("Auth redirect error:", err);
//     return NextResponse.redirect(`${target}?auth=error`);
//   }
// }
