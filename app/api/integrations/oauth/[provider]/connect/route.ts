/**
 * app/api/integrations/oauth/[provider]/connect/route.ts
 *
 * Initiates the official provider OAuth handshake for the SalesmanPro Mascot.
 * Validates session, user permissions, generates cryptographically signed state,
 * and redirects user to the provider's authorization screen.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { IntegrationOAuthService } from "@/lib/integrations/oauth";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to connect integrations." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || (session.user as any).companyId;
    const redirectPath = searchParams.get("redirectPath") || undefined;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "companyId parameter is required." },
        { status: 400 }
      );
    }

    // Verify user has admin authority over this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true, slug: true },
    });

    if (!company) {
      return NextResponse.json({ success: false, error: "Store tenant not found." }, { status: 404 });
    }

    const isAuthorized = canAccessCompanyAdmin({
      user: {
        id: session.user.id,
        role: (session.user as any).role,
        companyId: (session.user as any).companyId,
        emailVerified: (session.user as any).emailVerified,
        isActive: (session.user as any).isActive,
      },
      company: { id: company.id, userId: company.userId },
    });

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Access denied: Only store administrators can connect integrations." },
        { status: 403 }
      );
    }

    const origin = req.nextUrl.origin;
    const { url } = await IntegrationOAuthService.buildAuthorizationUrl({
      providerId: provider,
      companyId: company.id,
      userId: session.user.id,
      origin,
      redirectPath: redirectPath || `/admin/${company.slug}/mascot/integrations`,
    });

    // Check if client expects JSON or direct 302 redirect
    const wantsJson = req.headers.get("accept")?.includes("application/json");
    if (wantsJson) {
      return NextResponse.json({ success: true, url });
    }

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error("[OAUTH_CONNECT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate authorization URL." },
      { status: 500 }
    );
  }
}
