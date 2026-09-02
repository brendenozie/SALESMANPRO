import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const configs = await superAdminAIService.getServiceConfigs();
    const isKilled = await superAdminAIService.getGlobalKillSwitch();
    return NextResponse.json({
      success: true,
      configs,
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

    // Toggle global kill switch
    if (typeof body.globalKillSwitch === "boolean") {
      await superAdminAIService.setGlobalKillSwitch(body.globalKillSwitch);
      return NextResponse.json({
        success: true,
        globalKillSwitch: body.globalKillSwitch,
      });
    }

    if (!body.serviceKey || !body.provider || !body.modelId) {
      return NextResponse.json(
        { success: false, error: "serviceKey, provider, and modelId are required." },
        { status: 400 },
      );
    }

    const config = await superAdminAIService.upsertServiceConfig(body);
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
