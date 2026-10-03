import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getToken, encode } from "next-auth/jwt";
import { createHandoverToken, consumeHandoverToken, safeHandoverTarget } from "@/lib/auth/handover";
import { HUB_URL, normalizeHost } from "@/lib/auth/domain";
import { authLog, generateCorrelationId } from "@/lib/auth/telemetry";
import { resolveUserDestination } from "@/lib/auth/destinationResolver";
import prisma from "@/server/db/prismadb";

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

  const userAgent = req.headers.get("user-agent") || "";
  const isAndroid = userAgent.includes("SalesmanProAndroid");
  const isDesktop = userAgent.includes("SalesmanProDesktop") || isAndroid;
  const platform = isAndroid ? "ANDROID" : isDesktop ? "WPF" : "WEB";

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
        authLog(cId, "handover_consume_duration", Date.now() - start, {
          status: "invalid_or_expired_token",
          host,
        });
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
      
      // Resolve role-based destination if target is auth host or generic hub/dashboards
      if (
        !target ||
        normalizeHost(target.hostname) === "auth.salesmanpro.site" ||
        target.pathname === "/dashboards" ||
        target.pathname === "/" ||
        target.pathname === ""
      ) {
        const resolved = await resolveUserDestination(
          {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            companyId: decoded.companyId,
            emailVerified: decoded.emailVerified,
            hasTenantAccess: decoded.hasTenantAccess,
          },
          {
            platform,
            originHost: host,
            correlationId: cId,
          }
        );
        target = new URL(resolved.destination, target ? target.origin : HUB_URL);
      }

      const destination = new URL(target.toString());
      destination.searchParams.delete("token");
      destination.searchParams.delete("auth_token");
      destination.searchParams.set("auth", "success");

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
      authLog(cId, "handover_issue_duration", Date.now() - start, {
        status: "no_authenticated_session",
        host,
      });
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
      { audienceHost: target.protocol === "salesmanpro:" ? "site.salesmanpro.android" : target.hostname },
    );

    // Special handling for native Android custom scheme deep link: salesmanpro://callback
    if (target.protocol === "salesmanpro:" && target.hostname === "callback") {
      const resolved = await resolveUserDestination(user, {
        platform: "ANDROID",
        originHost: host,
        correlationId: cId,
      });

      const callbackUrl = new URL("salesmanpro://callback");
      callbackUrl.searchParams.set("token", token);
      callbackUrl.searchParams.set("auth", "success");
      callbackUrl.searchParams.set("destination", resolved.destination);
      callbackUrl.searchParams.set("role", resolved.role);
      if (resolved.companyId) callbackUrl.searchParams.set("companyId", resolved.companyId);
      if (resolved.companySlug) callbackUrl.searchParams.set("companySlug", resolved.companySlug);

      authLog(cId, "handover_issue_duration", Date.now() - start, {
        status: "android_callback_issued",
        email: user.email,
        target: callbackUrl.toString(),
      });
      return NextResponse.redirect(callbackUrl.toString());
    }

    // Resolve destination if current target is generic dashboards/hub
    if (
      target.pathname === "/dashboards" ||
      target.pathname === "/" ||
      target.pathname === ""
    ) {
      const resolved = await resolveUserDestination(user, {
        platform,
        originHost: host,
        correlationId: cId,
      });
      target = new URL(resolved.destination, target.origin);
    }

    const targetHost = normalizeHost(target.hostname);
    const isTargetSameHost = targetHost === host;

    authLog(cId, "handover_issue_duration", Date.now() - start, {
      status: "token_issued",
      sourceHost: host,
      targetHost,
      email: user.email,
      resolvedDestination: target.toString(),
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
    return NextResponse.redirect(destination.toString());
  } catch (err: any) {
    authLog(cId, "handover_issue_duration", Date.now() - start, { error: err.message, host });
    return NextResponse.redirect(`${target.origin}${target.pathname}?auth=error`);
  }
}

/**
 * POST /api/auth/handover
 * Direct programmatic exchange of handover token for desktop and native mobile clients.
 */
export async function POST(req: NextRequest) {
  const cId = generateCorrelationId();
  const start = Date.now();
  const host = normalizeHost(req.headers.get("host") || "");

  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || body.handoverToken;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing handover token" },
        { status: 400 },
      );
    }

    const decoded = await consumeHandoverToken(token, host);
    if (!decoded || !decoded.id || !decoded.email) {
      authLog(cId, "handover_api_consume", Date.now() - start, {
        status: "invalid_or_expired",
      });
      return NextResponse.json(
        { success: false, message: "Handover token is invalid, expired, or already used." },
        { status: 401 },
      );
    }

    const resolved = await resolveUserDestination(
      {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        companyId: decoded.companyId,
        emailVerified: decoded.emailVerified,
        hasTenantAccess: decoded.hasTenantAccess,
      },
      {
        platform: body.platform || "API",
        correlationId: cId,
      },
    );

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

    const effectiveCompanyId = resolved.companyId || decoded.companyId || null;
    const company = await resolveUserCompany(decoded.id, effectiveCompanyId);
    const resolvedCompanyId = company?.id || effectiveCompanyId;
    const stores = resolvedCompanyId ? await resolveCompanyStores(resolvedCompanyId) : [];

    authLog(cId, "handover_api_consume", Date.now() - start, {
      status: "success",
      userId: decoded.id,
      role: decoded.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Handover exchange successful",
      token: sessionToken,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        companyId: resolvedCompanyId,
      },
      company: company || {
        id: resolvedCompanyId || "",
        name: "SalesmanPro",
        slug: resolved.companySlug || null,
      },
      stores,
      activeStoreId: stores[0]?.id || (resolvedCompanyId ? `store_${resolvedCompanyId}` : "store_default"),
      destination: resolved.destination,
    });

    response.cookies.set(sessionCookieName(), sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("[HANDOVER_API_ERROR]", error);
    authLog(cId, "handover_api_consume", Date.now() - start, {
      status: "error",
      error: error.message,
    });
    return NextResponse.json(
      { success: false, message: error.message || "Handover exchange failed", error: error.message },
      { status: 500 },
    );
  }
}

async function resolveUserCompany(userId: string, defaultCompanyId?: string | null) {
  try {
    if (defaultCompanyId) {
      const comp = await prisma.company.findUnique({
        where: { id: defaultCompanyId },
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          logoUrl: true,
          address: true,
          contactPhone: true,
          contactEmail: true,
        },
      });
      if (comp) return comp;
    }

    // Look for company owned by user
    const owned = await prisma.company.findFirst({
      where: { userId },
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        logoUrl: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
      },
    });
    if (owned) return owned;

    // Look for company via staff profile
    const staff = await prisma.staffProfile.findFirst({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true,
            logoUrl: true,
            address: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
      },
    });
    if (staff?.company) return staff.company;

    // Fallback to first available company
    return await prisma.company.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        logoUrl: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
      },
    });
  } catch (e) {
    console.error("[RESOLVE_COMPANY_ERROR]", e);
    return null;
  }
}

async function resolveCompanyStores(companyId: string) {
  try {
    const companyLocations = await prisma.companyLocation.findMany({
      where: { companyId, visible: true },
      include: {
        location: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    if (companyLocations.length > 0) {
      return companyLocations.map((cl) => ({
        id: cl.id,
        name: cl.displayName || cl.location.name,
        address: cl.addressLine1Override || cl.location.address || "",
        city: cl.cityOverride || cl.location.city || "",
        phone: cl.location.phone || "",
      }));
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, address: true, contactPhone: true },
    });

    return [
      {
        id: `store_${companyId}`,
        name: `${company?.name || "Main"} Branch`,
        address: company?.address || "Main Store",
        city: "Main",
        phone: company?.contactPhone || "",
      },
    ];
  } catch (err) {
    console.error("[RESOLVE_STORES_ERROR]", err);
    return [
      {
        id: `store_${companyId}`,
        name: "Main Branch",
        address: "Head Office",
        city: "Default",
        phone: "",
      },
    ];
  }
}
