import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { createHandoverToken, safeHandoverTarget } from "@/lib/auth/handover";
import { HUB_URL, normalizeHost } from "@/lib/auth/domain";

export async function GET(req: NextRequest) {
  const rawTarget = req.nextUrl.searchParams.get("target") || `${HUB_URL}/dashboards`;
  const isDesktop =
    req.headers.get("user-agent")?.includes("SalesmanProDesktop") ||
    req.headers.get("user-agent")?.includes("SalesmanProAndroid") ||
    false;

  if (req.nextUrl.searchParams.get("auth") === "logout") {
    const target = await safeHandoverTarget(rawTarget);
    return NextResponse.redirect((target || new URL(`${HUB_URL}/dashboards`)).toString());
  }

  let target = await safeHandoverTarget(rawTarget);
  if (!target || normalizeHost(target.hostname) === "auth.salesmanpro.site") {
    target = new URL(`${HUB_URL}/dashboards`);
  }

  try {
    const session = await getAuthSession();
    let user: any = session?.user;

    if (!user) {
      const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
      const token = await getToken({
        req,
        secret,
        cookieName:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
      });
      if (token?.id) {
        user = token;
      }
    }

    if (!user) {
      return NextResponse.redirect(`${target.origin}${target.pathname}?auth=failed`);
    }

    const { token } = await createHandoverToken({
      id: String(user.id),
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
      companyId: user.companyId,
      hasTenantAccess: user.hasTenantAccess,
    }, { audienceHost: target.hostname });

    const destination = new URL(target.toString());
    destination.searchParams.set("auth_token", token);
    destination.searchParams.set("auth", "success");

    if (isDesktop) {
      destination.pathname = "/dashboards";
    }

    return NextResponse.redirect(destination.toString());
  } catch {
    return NextResponse.redirect(`${target.origin}${target.pathname}?auth=error`);
  }
}
