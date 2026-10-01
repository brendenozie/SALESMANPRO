/**
 * app/api/ai/mascot/context/route.ts
 *
 * Provides real-time Mascot context, current user role, store scope,
 * credit balance, authorized capabilities, and route-aware suggestions.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || undefined;
    const currentPath = searchParams.get("currentPath") || undefined;

    const data = await MascotContextResolver.resolveContext({
      req,
      companyId,
      currentPath,
    });

    return NextResponse.json({
      success: true,
      context: data.context,
      capabilitiesCount: data.authorizedCapabilities.length,
      capabilities: data.authorizedCapabilities.map((c) => ({
        id: c.id,
        module: c.module,
        name: c.name,
        description: c.description,
        riskLevel: c.riskLevel,
        creditCost: c.creditCost,
        requiresApproval: c.requiresApproval,
      })),
      suggestedActions: data.suggestedActions,
    });
  } catch (error: any) {
    console.error("[MASCOT_CONTEXT_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to resolve mascot context",
      },
      { status: error.message?.includes("Authentication") ? 401 : 403 },
    );
  }
}
