// File: /app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust this import path

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

    return NextResponse.redirect(`${target}?auth=success`);
  } catch (err) {
    console.error("Auth redirect error:", err);
    return NextResponse.redirect(`${target}?auth=error`);
  }
}
