// app/api/auth/handover/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const target = searchParams.get("target");

    // 1. Validate Target URL
    if (!target) {
      return NextResponse.redirect(
        new URL("/failure?reason=missing_target", request.url),
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(decodeURIComponent(target));
    } catch (e) {
      return NextResponse.redirect(
        new URL("/failure?reason=invalid_url", request.url),
      );
    }

    // 2. Validate Session
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.email) {
      // If there is no session, redirect back to signin with the target as callback
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", targetUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    // 3. Generate One-Time Exchange Token (OTET)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes valid

    // 4. Save to Database (Ensure you have a VerificationToken or similar model)
    await prisma.verificationToken.create({
      data: {
        identifier: session.user.email,
        token: token,
        expires: expires,
      },
    });

    // 5. Safely Construct Exchange URL
    const exchangeUrl = new URL("/api/auth/exchange", targetUrl.origin);
    exchangeUrl.searchParams.set("code", token);

    // Preserve the original path they wanted to visit on the target domain
    if (targetUrl.pathname !== "/") {
      exchangeUrl.searchParams.set("destination", targetUrl.pathname);
    }

    return NextResponse.redirect(exchangeUrl);
  } catch (error) {
    // Prevent 500 error screen, redirect to a graceful failure page
    console.error("HANDOVER_ERROR:", error);
    const failureUrl = new URL("/failure?reason=handover_crashed", request.url);
    return NextResponse.redirect(failureUrl);
  }
}
