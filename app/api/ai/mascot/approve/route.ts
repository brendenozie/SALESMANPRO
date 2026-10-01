/**
 * app/api/ai/mascot/approve/route.ts
 *
 * Human-in-the-Loop Approval API for SalesmanPro AI Mascot.
 * Reviews, approves, or rejects pending sensitive action tickets.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotCapabilityRegistry } from "@/lib/ai/mascot/capabilityRegistry";
import { MascotActionEngine } from "@/lib/ai/mascot/actionEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { approvalId, action, rejectionReason, companyId } = body;

    if (!approvalId || !action) {
      return NextResponse.json(
        { success: false, error: "approvalId and action ('APPROVE' or 'REJECT') are required." },
        { status: 400 },
      );
    }

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    // Only Admin, SuperAdmin, or Manager can approve
    if (!["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(context.userRole)) {
      return NextResponse.json(
        { success: false, error: "Only store administrators or managers can authorize sensitive actions." },
        { status: 403 },
      );
    }

    const ticket = await prisma.aIAgentApproval.findUnique({
      where: { id: approvalId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Approval ticket not found." },
        { status: 404 },
      );
    }

    if (ticket.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `This request has already been ${ticket.status.toLowerCase()}.` },
        { status: 400 },
      );
    }

    if (action === "REJECT") {
      await prisma.aIAgentApproval.update({
        where: { id: approvalId },
        data: {
          status: "REJECTED",
          reviewedBy: context.userId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || "Rejected by user.",
        },
      });

      return NextResponse.json({
        success: true,
        status: "REJECTED",
        reply: "Action authorization was cancelled. No changes were made to your store.",
      });
    }

    // Action is APPROVE -> Execute the underlying canonical operation
    const capability = MascotCapabilityRegistry.getCapability(ticket.actionType);
    if (!capability) {
      throw new Error(`Capability '${ticket.actionType}' is no longer registered.`);
    }

    const entities = (ticket.proposedAction as any) || {};

    const execution = await MascotActionEngine.executeAction({
      capability,
      entities,
      context,
      approved: true,
      approvalId: ticket.id,
    });

    await prisma.aIAgentApproval.update({
      where: { id: approvalId },
      data: {
        status: execution.success ? "APPROVED" : "FAILED",
        reviewedBy: context.userId,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: execution.success,
      status: execution.success ? "APPROVED" : "FAILED",
      reply: execution.summary,
      data: execution.data,
      deepLinks: execution.deepLinks,
      creditsConsumed: execution.creditsConsumed,
    });
  } catch (error: any) {
    console.error("[MASCOT_APPROVE_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process approval." },
      { status: 400 },
    );
  }
}
