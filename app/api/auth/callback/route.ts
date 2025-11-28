// File: /app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust this import path
import { encode } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("target") || "https://salesmanpro.site";

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      // If no session, redirect user back with an error state
      return NextResponse.redirect(`${target}?auth=failed`);
    }

    
    // Optionally, you could sign a short-lived token for cross-domain auth
    // Example: `${target}/auth/success?token=${token}`
    // Build a plain object payload compatible with next-auth's JWT type
    // ensure `id` is present (required by the JWT type) and is a string
    const userId = String((session.user as any)?.id ?? (session.user?.email ?? ""));
    const tokenPayload = {
      name: session.user?.name,
      email: session.user?.email,
      image: session.user?.image,
      // include id as required by the JWT type
      id: userId,
      // include id as `sub` for compatibility
      sub: userId,
    };
    const token = await encode({ token: tokenPayload, secret: process.env.NEXTAUTH_SECRET! });
    return NextResponse.redirect(`${target}?auth=success&token=${token}`);


    // return NextResponse.redirect(`${target}?auth=success`);
  } catch (err) {
    console.error("Auth redirect error:", err);
    return NextResponse.redirect(`${target}?auth=error`);
  }
}
