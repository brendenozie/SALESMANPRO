import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getToken, encode } from "next-auth/jwt";
import { createHandoverToken, consumeHandoverToken, safeHandoverTarget } from "@/lib/auth/handover";
import { HUB_URL, normalizeHost } from "@/lib/auth/domain";
import { authLog, generateCorrelationId } from "@/lib/auth/telemetry";

function getAuthSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "default-salesmanpro-auth-secret-32-chars-min"
  );
}

function sessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

export async function GET(req: NextRequest) {
  const cId = generateCorrelationId();
  const start = Date.now();
  const rawTarget = req.nextUrl.searchParams.get("target") || `${HUB_URL}/dashboards`;
  const incomingToken = req.nextUrl.searchParams.get("token") || req.nextUrl.searchParams.get("auth_token");
  const host = normalizeHost(req.headers.get("host") || "");

  const isDesktop =
    req.headers.get("user-agent")?.includes("SalesmanProDesktop") ||
    req.headers.get("user-agent")?.includes("SalesmanProAndroid") ||
    false;

  // Handle logout handover
  if (req.nextUrl.searchParams.get("auth") === "logout") {
    const target = await safeHandoverTarget(rawTarget);
    return NextResponse.redirect((target || new URL(`${HUB_URL}/dashboards`)).toString());
  }

  // =========================================================================
  // CONSUMING MODE: Handover token received on target domain
  // =========================================================================
  if (incomingToken) {
    try {
      const decoded = await consumeHandoverToken(incomingToken, host);
      if (!decoded || !decoded.id || !decoded.email) {
        authLog(cId, "handover_consume_duration", Date.now() - start, { status: "invalid_or_expired_token", host });
        const target = await safeHandoverTarget(rawTarget);
        const fallback = target || new URL(`${HUB_URL}/dashboards`);
        return NextResponse.redirect(`${fallback.origin}${fallback.pathname}?auth=failed`);
      }

      // Encode session token directly for this domain
      const sessionToken = await encode({
        token: {
          id: decoded.id,
          sub: String(decoded.id),
          name: decoded.name,
          email: decoded.email,
          image: decoded.image,
          role: decoded.role,
          emailVerified: decoded.emailVerified,
          companyId: decoded.companyId,
          hasTenantAccess: decoded.hasTenantAccess,
        },
        secret: getAuthSecret(),
        maxAge: 30 * 24 * 60 * 60,
      });

      let target = await safeHandoverTarget(rawTarget);
      if (!target || normalizeHost(target.hostname) === "auth.salesmanpro.site") {
        target = new URL(`${HUB_URL}/dashboards`);
      }

      const destination = new URL(target.toString());
      destination.searchParams.delete("token");
      destination.searchParams.delete("auth_token");
      destination.searchParams.set("auth", "success");

      if (isDesktop) {
        destination.pathname = "/dashboards";
      }

      authLog(cId, "handover_consume_duration", Date.now() - start, {
        status: "session_established",
        host,
        email: decoded.email,
        target: destination.toString(),
      });

      const res = NextResponse.redirect(destination.toString());
      res.cookies.set(sessionCookieName(), sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    } catch (err: any) {
      authLog(cId, "handover_consume_duration", Date.now() - start, { error: err.message, host });
      const target = await safeHandoverTarget(rawTarget);
      const fallback = target || new URL(`${HUB_URL}/dashboards`);
      return NextResponse.redirect(`${fallback.origin}${fallback.pathname}?auth=error`);
    }
  }

  // =========================================================================
  // ISSUING MODE: Generating handover token on auth.salesmanpro.site
  // =========================================================================
  let target = await safeHandoverTarget(rawTarget);
  if (!target || normalizeHost(target.hostname) === "auth.salesmanpro.site") {
    target = new URL(`${HUB_URL}/dashboards`);
  }

  try {
    const session = await getAuthSession();
    let user: any = session?.user;

    if (!user) {
      const secret = getAuthSecret();
      const token = await getToken({
        req,
        secret,
        cookieName: sessionCookieName(),
      });
      if (token?.id) {
        user = token;
      }
    }

    if (!user) {
      authLog(cId, "handover_issue_duration", Date.now() - start, { status: "no_authenticated_session", host });
      return NextResponse.redirect(`${target.origin}${target.pathname}?auth=failed`);
    }

    const { token } = await createHandoverToken(
      {
        id: String(user.id),
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        companyId: user.companyId,
        hasTenantAccess: user.hasTenantAccess,
      },
      { audienceHost: target.hostname },
    );

    const targetHost = normalizeHost(target.hostname);
    const isTargetSameHost = targetHost === host;

    authLog(cId, "handover_issue_duration", Date.now() - start, {
      status: "token_issued",
      sourceHost: host,
      targetHost,
      email: user.email,
    });

    // If target is on a different domain, direct to target domain's server-side handover consumer
    if (!isTargetSameHost) {
      const handoverConsumer = new URL("/api/auth/handover", target.origin);
      handoverConsumer.searchParams.set("token", token);
      handoverConsumer.searchParams.set("target", target.toString());
      return NextResponse.redirect(handoverConsumer.toString());
    }

    // If target is the same host, redirect directly to final destination
    const destination = new URL(target.toString());
    destination.searchParams.set("auth", "success");
    if (isDesktop) {
      destination.pathname = "/dashboards";
    }
    return NextResponse.redirect(destination.toString());
  } catch (err: any) {
    authLog(cId, "handover_issue_duration", Date.now() - start, { error: err.message, host });
    return NextResponse.redirect(`${target.origin}${target.pathname}?auth=error`);
  }
}
