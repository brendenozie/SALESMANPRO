/**
 * app/api/ai/models/route.ts
 *
 * GET /api/ai/models
 * Returns available AI models, capabilities, and credit pricing catalog.
 */

import { NextResponse } from "next/server";
import { modelRegistry } from "@/lib/ai/modelRegistry";
import { resolveAIAuth } from "@/lib/ai/authHelper";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req).catch(() => null);
    const { searchParams } = new URL(req.url);
    const capability = searchParams.get("capability");

    const models = capability
      ? modelRegistry.getModelsByCapability(capability as any)
      : modelRegistry.getAllEnabledModels();

    return NextResponse.json({
      success: true,
      models,
      tenant: auth ? { companyId: auth.companyId, companyName: auth.companyName } : null,
    });
  } catch (error: any) {
    console.error("[GET_AI_MODELS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch AI models" },
      { status: error.statusCode || 500 },
    );
  }
}
