import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, getTenantInfo, AUTH_BROKER_URL } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { randomBytes } from "crypto";

function getPublicOrigin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }
  return process.env.NODE_ENV === "production"
    ? AUTH_BROKER_URL
    : "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const baseOrigin = getPublicOrigin(request);

  try {
    const searchParams = request.nextUrl.searchParams;
    const target = searchParams.get("target");

    if (!target) {
      return NextResponse.redirect(
        new URL("/failure?reason=missing_target", baseOrigin),
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(decodeURIComponent(target));
    } catch {
      return NextResponse.redirect(
        new URL("/failure?reason=invalid_url", baseOrigin),
      );
    }

    const isProd = process.env.NODE_ENV === "production";
    const targetHost = targetUrl.hostname;

    if (isProd && (targetHost === "localhost" || targetHost === "127.0.0.1")) {
      return NextResponse.redirect(
        new URL("/failure?reason=invalid_target_domain", baseOrigin),
      );
    }

    // CRITICAL FIX 1: Prevent Self-Handover Loops
    const AUTH_DOMAIN =
      process.env.NEXT_PUBLIC_AUTH_DOMAIN || "auth.salesmanpro.site";
    if (targetHost === AUTH_DOMAIN || targetHost === "salesmanpro.site") {
      const fallbackDest =
        targetUrl.pathname !== "/" ? targetUrl.pathname : "/dashboards";
      return NextResponse.redirect(new URL(fallbackDest, baseOrigin));
    }

    const { isMainApp, tenantIdentifier } = getTenantInfo(targetHost);

    if (!isMainApp) {
      try {
        const registeredCompany = await prisma.company.findFirst({
          where: {
            OR: [
              { domain: tenantIdentifier },
              { customDomain: tenantIdentifier },
              { slug: tenantIdentifier.split(".")[0] },
            ],
          },
        });

        if (!registeredCompany) {
          return NextResponse.redirect(
            new URL("/failure?reason=unregistered_domain", baseOrigin),
          );
        }
      } catch (dbErr) {
        console.warn("HANDOVER_TENANT_CHECK_WARNING:", dbErr);
      }
    }

    const session = await getAuthSession();
    if (!session || !session.user || !session.user.email) {
      const signInUrl = new URL("/signin", baseOrigin);

      // CRITICAL FIX 2: Resume Handover
      // Must set callbackUrl to request.url (the handover API itself) so token generation resumes after login.
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 5);

    await prisma.verificationToken.deleteMany({
      where: { identifier: session.user.email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: session.user.email,
        token: token,
        expires: expires,
      },
    });

    const exchangeUrl = new URL("/api/auth/exchange", targetUrl.origin);
    exchangeUrl.searchParams.set("code", token);

    const destination = targetUrl.pathname + targetUrl.search;
    if (destination && destination !== "/") {
      exchangeUrl.searchParams.set("destination", destination);
    }

    return NextResponse.redirect(exchangeUrl);
  } catch (error) {
    console.error("HANDOVER_CRASH_DETAILS:", error);
    return NextResponse.redirect(
      new URL("/failure?reason=handover_crashed", baseOrigin),
    );
  }
}
