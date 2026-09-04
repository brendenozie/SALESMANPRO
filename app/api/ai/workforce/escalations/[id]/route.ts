/**
 * app/api/ai/workforce/escalations/[id]/route.ts
 *
 * Resolve or update status of an AIAgentEscalation ticket.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const validStatuses = ["PENDING", "RESOLVED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    const escalation = await prisma.aIAgentEscalation.findUnique({
      where: { id },
    });

    if (!escalation) {
      return NextResponse.json(
        { success: false, error: "Escalation ticket not found" },
        { status: 404 },
      );
    }

    // Tenant check
    if (auth.role !== "SUPER_ADMIN" && escalation.companyId !== auth.companyId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to escalation" },
        { status: 403 },
      );
    }

    const updated = await prisma.aIAgentEscalation.update({
      where: { id },
      data: {
        status,
        resolvedBy: status === "RESOLVED" ? auth.userId : undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      escalation: updated,
      message: `Escalation marked as ${status.toLowerCase()}.`,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_ESCALATION_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update escalation" },
      { status: error.statusCode || 500 },
    );
  }
}
