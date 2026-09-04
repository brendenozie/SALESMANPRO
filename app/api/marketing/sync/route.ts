/**
 * app/api/marketing/sync/route.ts
 *
 * Triggers sync on external marketing providers (Meta, Google Ads, GA4, Social).
 * Multi-tenant safe.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { MarketingIntelligenceService } from "@/lib/marketing/marketingIntelligenceService";

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: "connectionId is required." },
        { status: 400 }
      );
    }

    const connection = await prisma.marketingConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: "Marketing connection not found." },
        { status: 404 }
      );
    }

    // Tenant isolation verification
    if (auth.role !== "SUPER_ADMIN" && connection.companyId !== auth.companyId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this marketing connection." },
        { status: 403 }
      );
    }

    const syncResult = await MarketingIntelligenceService.syncConnection(connectionId);

    return NextResponse.json({
      success: true,
      result: syncResult,
      message: `Successfully synchronized ${connection.accountName || connection.provider}.`,
    });
  } catch (error: any) {
    console.error("[MARKETING_SYNC_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Marketing sync failed" },
      { status: error.statusCode || 500 }
    );
  }
}
