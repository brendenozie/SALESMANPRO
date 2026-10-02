/**
 * app/api/integrations/verify/route.ts
 *
 * Runs on-demand verification probe against a connected account.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { IntegrationVerificationService } from "@/lib/integrations/verification";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, accountId, companyId } = body;

    if (!provider || !accountId || !companyId) {
      return NextResponse.json(
        { success: false, error: "provider, accountId, and companyId are required." },
        { status: 400 }
      );
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

    const result = await IntegrationVerificationService.verifyAccount({
      provider,
      accountId,
      companyId: company.id,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
