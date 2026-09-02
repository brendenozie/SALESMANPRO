import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();

    if (typeof body.enabled === "boolean") {
      const updated = await superAdminAIService.toggleProvider(params.id, body.enabled);
      return NextResponse.json({ success: true, provider: updated });
    }

    const updated = await prisma.platformAIProvider.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, provider: updated });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireSuperAdmin(req);
    await prisma.platformAIProvider.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Provider deleted successfully" });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
