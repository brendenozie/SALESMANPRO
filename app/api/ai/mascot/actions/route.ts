/**
 * app/api/ai/mascot/actions/route.ts
 *
 * Direct Action Execution API for SalesmanPro AI Mascot.
 * Executes confirmed actions from interactive cards or preview drawers.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotCapabilityRegistry } from "@/lib/ai/mascot/capabilityRegistry";
import { MascotActionEngine } from "@/lib/ai/mascot/actionEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { capabilityId, payload, companyId, currentPath } = body;

    if (!capabilityId) {
      return NextResponse.json(
        { success: false, error: "A capabilityId is required." },
        { status: 400 },
      );
    }

    const { context, authorizedCapabilities } = await MascotContextResolver.resolveContext({
      req,
      companyId,
      currentPath,
    });

    const capability = authorizedCapabilities.find((c) => c.id === capabilityId);
    if (!capability) {
      throw new Error(`You are not authorized to perform action '${capabilityId}'.`);
    }

    const result = await MascotActionEngine.executeAction({
      capability,
      entities: payload || {},
      context,
      approved: true, // User clicked confirm on the card
    });

    return NextResponse.json({
      success: result.success,
      reply: result.summary,
      data: result.data,
      deepLinks: result.deepLinks,
      creditsConsumed: result.creditsConsumed,
    });
  } catch (error: any) {
    console.error("[MASCOT_ACTIONS_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute mascot action." },
      { status: 400 },
    );
  }
}
