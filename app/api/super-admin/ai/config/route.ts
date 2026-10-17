import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    await superAdminAIService.seedStandardProvidersAndModels();

    const [configs, actionPolicies, isKilled] = await Promise.all([
      superAdminAIService.getServiceConfigs(),
      superAdminAIService.getActionPolicies(),
      superAdminAIService.getGlobalKillSwitch(),
    ]);

    return NextResponse.json({
      success: true,
      configs,
      actionPolicies,
      globalKillSwitch: isKilled,
    });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();

    // 1. Toggle global kill switch
    if (typeof body.globalKillSwitch === "boolean") {
      await superAdminAIService.setGlobalKillSwitch(body.globalKillSwitch);
      return NextResponse.json({
        success: true,
        globalKillSwitch: body.globalKillSwitch,
      });
    }

    // 2. Action Model Routing Assignment
    if (body.actionId && body.primaryModelId) {
      const updated = await superAdminAIService.updateActionPolicy({
        actionId: body.actionId,
        primaryModelId: body.primaryModelId,
        fallbackModelId: body.fallbackModelId,
        creditCost: typeof body.creditCost === "number" ? body.creditCost : undefined,
        enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
        temperature: typeof body.temperature === "number" ? body.temperature : undefined,
        maxTokens: typeof body.maxTokens === "number" ? body.maxTokens : undefined,
      });
      return NextResponse.json({ success: true, policy: updated });
    }

    // 3. Legacy / direct serviceKey upsert
    if (body.serviceKey && (body.primaryModelId || body.modelId)) {
      const config = await superAdminAIService.upsertServiceConfig({
        serviceKey: body.serviceKey,
        displayName: body.displayName || body.serviceKey,
        capability: body.capability || "TEXT",
        primaryModelId: body.primaryModelId || body.modelId,
        fallbackModelId: body.fallbackModelId,
        creditCost: body.creditCost,
        enabled: body.enabled ?? true,
      });
      return NextResponse.json({ success: true, config });
    }

    return NextResponse.json(
      { success: false, error: "actionId and primaryModelId are required for model assignment." },
      { status: 400 },
    );
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
