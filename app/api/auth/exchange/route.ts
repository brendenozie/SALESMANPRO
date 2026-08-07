import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { encode } from "next-auth/jwt";

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
    const record = await prisma.verificationToken.findUnique({
      where: { token: code },
    });

    if (!record || record.expires < new Date()) {
      if (record) {
        await prisma.verificationToken.delete({ where: { token: code } });
      }
      return NextResponse.redirect(
        new URL("/signin?error=expired_code", baseOrigin),
      );
    }

    // Single-use token deletion
    await prisma.verificationToken.delete({
      where: { token: code },
    });

    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/signin?error=user_not_found", baseOrigin),
      );
    }

    let destination = destinationParam || "/dashboards";

    // Prevent open redirects
    if (!destination.startsWith("/") || destination.startsWith("//")) {
      destination = "/dashboards";
    }

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

    const redirectTarget = new URL(destination, baseOrigin);
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
