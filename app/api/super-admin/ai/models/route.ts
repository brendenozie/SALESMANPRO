import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const url = new URL(req.url);
    const providerId = url.searchParams.get("providerId") || undefined;
    const models = await superAdminAIService.getModels(providerId);
    return NextResponse.json({ success: true, models });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();

    if (!body.providerId || !body.modelId || !body.name) {
      return NextResponse.json(
        { success: false, error: "providerId, modelId, and name are required." },
        { status: 400 },
      );
    }

    const model = await superAdminAIService.upsertModel(body);
    return NextResponse.json({ success: true, model });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    if (!body.id || typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Model id and enabled boolean are required." },
        { status: 400 },
      );
    }

    const model = await superAdminAIService.toggleModel(body.id, body.enabled);
    return NextResponse.json({ success: true, model });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
