import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { encode } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  const rawTarget =
    req.nextUrl.searchParams.get("target") || "https://salesmanpro.site";

  const isDesktop =
    req.headers.get("user-agent")?.includes("SalesmanProDesktop") ||
    req.headers.get("user-agent")?.includes("SalesmanProAndroid") ||
    false;

  const target = decodeURIComponent(rawTarget);

  if (req.nextUrl.searchParams.get("auth") === "logout") {
    return NextResponse.redirect(target);
  }

  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      // Redirect unauthenticated handover requests back to signin with callback tracking
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    const token = await encode({
      token: {
        ...session.user,
        id: (session.user as any).id,
        sub: (session.user as any).id,
      },
      secret: NEXTAUTH_SECRET,
      maxAge: 30 * 24 * 60 * 60,
    });

    const destination = new URL(target);
    destination.searchParams.set("auth_token", token);
    destination.searchParams.set("auth", "success");

    if (isDesktop) {
      destination.pathname = "/dashboards";
    }

    return NextResponse.redirect(destination.toString());
  } catch (err) {
    console.error("Critical Handover Error:", err);
    return NextResponse.redirect(`${target}?auth=error`);
  }
}
