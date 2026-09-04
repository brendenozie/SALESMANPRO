/**
 * app/api/ai/workforce/approvals/[id]/route.ts
 *
 * Resolve a pending approval (APPROVED or REJECTED) with feedback.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AgentApprovalStatus, AgentTaskStatus } from "@/lib/ai/workforce/types";
import SendMail from "@/service/mailservice";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!status || ![AgentApprovalStatus.APPROVED, AgentApprovalStatus.REJECTED].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be APPROVED or REJECTED." },
        { status: 400 },
      );
    }

    const approval = await prisma.aIAgentApproval.findUnique({
      where: { id },
      include: {
        task: true,
      },
    });

    if (!approval) {
      return NextResponse.json({ success: false, error: "Approval request not found" }, { status: 404 });
    }

    // Security check
    if (approval.companyId && approval.companyId !== auth.companyId && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized access to approval." }, { status: 403 });
    }

    if (approval.status !== AgentApprovalStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: `Approval already resolved as ${approval.status}.` },
        { status: 400 },
      );
    }

    // Update approval record
    const updatedApproval = await prisma.aIAgentApproval.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === AgentApprovalStatus.REJECTED ? rejectionReason : undefined,
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
      },
    });

    // If associated task exists, update task state
    if (approval.taskId) {
      await prisma.aIAgentTask.update({
        where: { id: approval.taskId },
        data: {
          status: status === AgentApprovalStatus.APPROVED ? AgentTaskStatus.COMPLETED : AgentTaskStatus.FAILED,
          failureReason: status === AgentApprovalStatus.REJECTED ? (rejectionReason || "Action rejected by reviewer") : undefined,
          approvedBy: status === AgentApprovalStatus.APPROVED ? auth.userId : undefined,
          approvedAt: status === AgentApprovalStatus.APPROVED ? new Date() : undefined,
          completedAt: new Date(),
        },
      });
    }

    // Automated Outbound Dispatch on Approval
    let dispatchResult: { dispatched: boolean; channel?: string; recipient?: string; error?: string } = {
      dispatched: false,
    };

    if (status === AgentApprovalStatus.APPROVED) {
      const proposed = (approval.proposedAction as any) || {};

      // 1. WhatsApp Outbound Outreach Dispatch (with Email Fallback)
      if (
        (approval.actionType === "OUTBOUND_PROSPECT_MESSAGE" || approval.actionType === "draftOutboundOutreach") &&
        proposed.channel === "WHATSAPP"
      ) {
        const phone = proposed.phone || proposed.recipient;
        const recipientName = proposed.contactName || proposed.businessName || "Merchant Partner";
        const companyName = proposed.businessName || "SalesmanPro";
        const messageBody = proposed.message || proposed.body || approval.description || approval.title;

        if (phone) {
          try {
            const { sendOutboundProspectWhatsApp } = await import("@/lib/whatsapp/outbound");
            console.log(`[WORKFORCE_OUTBOUND_DISPATCH] Dispatching approved WhatsApp HSM outreach to: ${phone}`);
            const waRes = await sendOutboundProspectWhatsApp({
              to: phone,
              businessName: companyName,
              contactName: recipientName,
              angle: proposed.angle,
              companyId: approval.companyId || undefined,
            });

            dispatchResult = {
              dispatched: true,
              channel: waRes.channel || "WHATSAPP",
              recipient: phone,
            };

            if (proposed.prospectId) {
              await prisma.growthProspect.update({
                where: { id: proposed.prospectId },
                data: {
                  outreachCount: { increment: 1 },
                  lastContactedAt: new Date(),
                  status: "CONTACTED",
                },
              }).catch(() => undefined);
            }
          } catch (waErr: any) {
            console.warn("[WORKFORCE_WHATSAPP_DISPATCH_FALLBACK] WhatsApp failed, attempting email fallback:", waErr?.message);
            const fallbackEmail = proposed.email || (typeof proposed.recipient === "string" && proposed.recipient.includes("@") ? proposed.recipient : null);
            if (fallbackEmail) {
              try {
                await SendMail({
                  to: fallbackEmail,
                  email: fallbackEmail,
                  fname: recipientName,
                  company: companyName,
                  message: messageBody,
                  text: messageBody,
                });
                dispatchResult = {
                  dispatched: true,
                  channel: "EMAIL_FALLBACK",
                  recipient: fallbackEmail,
                };
              } catch (mailErr: any) {
                dispatchResult = {
                  dispatched: false,
                  channel: "WHATSAPP",
                  recipient: phone,
                  error: `WhatsApp failed: ${waErr?.message}. Email fallback failed: ${mailErr?.message}`,
                };
              }
            } else {
              dispatchResult = {
                dispatched: false,
                channel: "WHATSAPP",
                recipient: phone,
                error: waErr?.message || "WhatsApp outreach dispatch failed",
              };
            }
          }
        }
      }

      // 2. Email Outbound Outreach Dispatch
      else if (
        approval.actionType === "OUTBOUND_PROSPECT_MESSAGE" ||
        approval.actionType === "draftOutboundOutreach" ||
        proposed.channel === "EMAIL" ||
        (typeof proposed.recipient === "string" && proposed.recipient.includes("@"))
      ) {
        const recipientEmail = proposed.recipient || proposed.email;
        const recipientName = proposed.contactName || proposed.businessName || "Merchant Partner";
        const companyName = proposed.businessName || "SalesmanPro";
        const messageBody = proposed.message || proposed.body || approval.description || approval.title;

        if (recipientEmail && typeof recipientEmail === "string" && recipientEmail.includes("@")) {
          try {
            console.log(`[WORKFORCE_OUTBOUND_DISPATCH] Dispatching approved outreach email to: ${recipientEmail}`);
            await SendMail({
              to: recipientEmail,
              email: recipientEmail,
              fname: recipientName,
              company: companyName,
              message: messageBody,
              text: messageBody,
            });

            dispatchResult = {
              dispatched: true,
              channel: "EMAIL",
              recipient: recipientEmail,
            };

            // If linked to a GrowthProspect, update outreach status
            if (proposed.prospectId) {
              await prisma.growthProspect.update({
                where: { id: proposed.prospectId },
                data: {
                  outreachCount: { increment: 1 },
                  lastContactedAt: new Date(),
                  status: "CONTACTED",
                },
              }).catch((prospectErr) => {
                console.warn("[WORKFORCE_PROSPECT_STATUS_UPDATE_WARN]", prospectErr);
              });
            }
          } catch (dispatchErr: any) {
            console.error("[WORKFORCE_OUTBOUND_DISPATCH_ERROR]", dispatchErr);
            dispatchResult = {
              dispatched: false,
              channel: "EMAIL",
              recipient: recipientEmail,
              error: dispatchErr.message || "Failed to dispatch email",
            };
          }
        }
      }

      // 3. Social Media Direct Publishing on Approval
      else if (approval.actionType === "PUBLISH_SOCIAL_POST" && proposed.postId) {
        const pubCompanyId = proposed.companyId || approval.companyId;
        if (pubCompanyId) {
          try {
            const { socialService } = await import("@/lib/social/socialService");
            console.log(`[WORKFORCE_SOCIAL_DISPATCH] Publishing approved post ${proposed.postId} for company ${pubCompanyId}`);
            await socialService.publishNow(pubCompanyId, proposed.postId);
            dispatchResult = {
              dispatched: true,
              channel: "SOCIAL",
              recipient: (proposed.platforms || ["FACEBOOK"]).join(", "),
            };
          } catch (socialErr: any) {
            console.error("[WORKFORCE_SOCIAL_DISPATCH_ERROR]", socialErr);
            dispatchResult = {
              dispatched: false,
              channel: "SOCIAL",
              error: socialErr.message || "Failed to publish social post",
            };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      approval: updatedApproval,
      dispatch: dispatchResult,
      message: `Action ${status.toLowerCase()} successfully.${dispatchResult.dispatched ? ` Dispatched outreach via ${dispatchResult.channel} to ${dispatchResult.recipient}.` : ""}`,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_APPROVAL_RESOLVE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve approval" },
      { status: error.statusCode || 500 },
    );
  }
}
