import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    // Auto-seed standard providers if first time
    await superAdminAIService.seedStandardProvidersAndModels();
    const providers = await superAdminAIService.getProviders();
    return NextResponse.json({ success: true, providers });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();

    if (!body.provider || !body.name) {
      return NextResponse.json(
        { success: false, error: "Provider identifier and name are required." },
        { status: 400 },
      );
    }

    const provider = await superAdminAIService.upsertProvider(body);
    return NextResponse.json({ success: true, provider });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
