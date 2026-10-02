/**
 * app/api/integrations/overview/route.ts
 *
 * Returns list of integrations and their real-time connection status for a store tenant.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { MascotIntegrationOnboardingService } from "@/lib/integrations/onboarding";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || (session.user as any).companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, error: "companyId is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true },
    });

    if (!company) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const hasAccess = canAccessCompanyAdmin({
      user: {
        id: session.user.id,
        role: (session.user as any).role,
        companyId: (session.user as any).companyId,
        emailVerified: (session.user as any).emailVerified,
        isActive: (session.user as any).isActive,
      },
      company: { id: company.id, userId: company.userId },
    });

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const integrations = await MascotIntegrationOnboardingService.getStoreIntegrationsOverview(company.id);

    return NextResponse.json({ success: true, integrations });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
