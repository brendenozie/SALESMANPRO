import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { encode } from "next-auth/jwt";
import { getTenantInfo } from "@/lib/auth";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

function getPublicOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }
  return process.env.NODE_ENV === "production"
    ? "https://salesmanpro.site"
    : "http://localhost:3000";
}

function sanitizeDestination(
  destinationParam: string | null,
  baseOrigin: string,
): URL {
  const fallback = new URL("/dashboards", baseOrigin);
  if (!destinationParam) return fallback;

  try {
    if (
      destinationParam.startsWith("/") &&
      !destinationParam.startsWith("//")
    ) {
      return new URL(destinationParam, baseOrigin);
    }
    const parsed = new URL(destinationParam);
    if (parsed.origin === new URL(baseOrigin).origin) {
      return parsed;
    }
  } catch {
    // Ignore invalid target URL format
  }

  return fallback;
}

export async function GET(req: NextRequest) {
  const baseOrigin = getPublicOrigin(req);
  const code = req.nextUrl.searchParams.get("code");
  const destinationParam = req.nextUrl.searchParams.get("destination");

  if (!code) {
    return NextResponse.redirect(
      new URL("/signin?error=missing_code", baseOrigin),
    );
  }

  try {
    // Atomic Single-Use Token Consumption
    let record;
    try {
      record = await prisma.verificationToken.delete({
        where: { token: code },
      });
    } catch {
      return NextResponse.redirect(
        new URL("/signin?error=invalid_or_expired_code", baseOrigin),
      );
    }

    if (!record || record.expires < new Date()) {
      return NextResponse.redirect(
        new URL("/signin?error=expired_code", baseOrigin),
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/signin?error=user_not_found", baseOrigin),
      );
    }

    const hostHeader =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const { isMainApp, tenantIdentifier } = getTenantInfo(hostHeader);

    let storeRole = "USER";
    let storeId: string | null = null;

    if (!isMainApp) {
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { domain: tenantIdentifier },
            { customDomain: tenantIdentifier },
            { slug: tenantIdentifier.split(".")[0] },
          ],
        },
      });

      if (company) {
        storeId = company.id;

        await prisma.consumer.upsert({
          where: {
            userId_companyId: { userId: user.id, companyId: company.id },
          },
          update: {},
          create: {
            userId: user.id,
            companyId: company.id,
          },
        });

        if (company.userId === user.id) {
          storeRole = "ADMIN";
        }
      }
    } else {
      storeRole = user.role || "USER";
    }

    const redirectTarget = sanitizeDestination(destinationParam, baseOrigin);

    const tokenPayload = {
      id: user.id,
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      bio: user.bio,
      address: user.address,
      role: user.role || "USER",
      globalRole: user.role || "USER",
      storeRole: storeRole,
      storeId: storeId,
      profilePicture: user.profilePicture || user.image,
      image: user.image,
    };

    const sessionJwt = await encode({
      token: tokenPayload,
      secret: NEXTAUTH_SECRET,
      maxAge: 30 * 24 * 60 * 60,
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const response = NextResponse.redirect(redirectTarget.toString());

    response.cookies.set(cookieName, sessionJwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("EXCHANGE_TOKEN_ERROR:", error);
    return NextResponse.redirect(
      new URL("/signin?error=exchange_failed", baseOrigin),
    );
  }
}
