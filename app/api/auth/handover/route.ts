import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, MAIN_DOMAINS } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const target = searchParams.get("target");

    if (!target) {
      return NextResponse.redirect(
        new URL("/failure?reason=missing_target", request.url),
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(decodeURIComponent(target));
    } catch {
      return NextResponse.redirect(
        new URL("/failure?reason=invalid_url", request.url),
      );
    }

    const isProd = process.env.NODE_ENV === "production";
    const targetHost = targetUrl.hostname.toLowerCase().replace(/^www\./, "");

    // Prevent localhost targets in production
    if (isProd && (targetHost === "localhost" || targetHost === "127.0.0.1")) {
      return NextResponse.redirect(
        new URL("/failure?reason=invalid_target_domain", request.url),
      );
    }

    // Security: Validate Target Host against database and allowed main domains
    const isMainDomain =
      MAIN_DOMAINS.includes(targetHost) ||
      targetHost.endsWith(".salesmanpro.site");

    if (!isMainDomain) {
      const registeredCompany = await prisma.company.findFirst({
        where: {
          OR: [
            { domain: targetHost },
            { customDomain: targetHost },
            { slug: targetHost.split(".")[0] },
          ],
        },
      });

      if (!registeredCompany) {
        return NextResponse.redirect(
          new URL("/failure?reason=invalid_target_domain", request.url),
        );
      }
    }

    // Verify Active Session
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.email) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", targetUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    // Generate Single-Use OTET
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes validity

    await prisma.verificationToken.create({
      data: {
        identifier: session.user.id,
        token: token,
        expires: expires,
      },
    });

    // Safely Construct Target Domain Exchange Endpoint
    const exchangeUrl = new URL("/api/auth/exchange", targetUrl.origin);
    exchangeUrl.searchParams.set("code", token);

    const destination = targetUrl.pathname + targetUrl.search;
    if (destination && destination !== "/") {
      exchangeUrl.searchParams.set("destination", destination);
    }

    return NextResponse.redirect(exchangeUrl);
  } catch (error) {
    console.error("HANDOVER_CRASH_ERROR:", error);
    return NextResponse.redirect(
      new URL("/failure?reason=handover_crashed", request.url),
    );
  }
}
