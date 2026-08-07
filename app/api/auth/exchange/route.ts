import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { encode } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  let destination =
    req.nextUrl.searchParams.get("destination") || "/dashboards";

  // Sanitize destination to ensure it is relative (prevents open redirects)
  if (!destination.startsWith("/") || destination.startsWith("//")) {
    destination = "/dashboards";
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/signin?error=missing_code", req.url),
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
        new URL("/signin?error=expired_code", req.url),
      );
    }

    // Single-use enforcement: Delete token immediately
    await prisma.verificationToken.delete({
      where: { token: code },
    });

    const user = await prisma.user.findUnique({
      where: { id: record.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/signin?error=user_not_found", req.url),
      );
    }

    // Complete JWT session claims matching lib/auth.ts
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

    const redirectTarget = new URL(destination, req.url);
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
    console.error("Exchange Token Error:", error);
    return NextResponse.redirect(
      new URL("/signin?error=exchange_failed", req.url),
    );
  }
}
