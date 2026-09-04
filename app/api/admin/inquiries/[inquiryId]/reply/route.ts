import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { EmailService } from "@/lib/email/emailService";
import { MetaWhatsAppClient } from "@/lib/whatsapp/metaClient";
import { decryptWhatsAppAccessToken } from "@/lib/whatsapp/credentials";
import { cacheDel } from "@/lib/cache";

interface RouteParams {
  params: Promise<{ inquiryId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { inquiryId } = await params;
    const body = await req.json();
    const { channel = "EMAIL", replyMessage, assignedToAgentName } = body;

    if (!replyMessage || typeof replyMessage !== "string" || !replyMessage.trim()) {
      return formatResponse(false, null, "Reply message content is required", 400);
    }

    // 1. Authorize user and tenant
    const auth = await resolveAIAuth(req);
    const companyId = auth.companyId;

    // 2. Fetch inquiry and ensure tenant ownership
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        companyId,
      },
    });

    if (!inquiry) {
      return formatResponse(false, null, "Inquiry not found or access denied", 404);
    }

    const results: { emailSent?: boolean; whatsappSent?: boolean; errors: string[] } = {
      errors: [],
    };

    // 3. Email Channel Dispatch
    if (channel === "EMAIL" || channel === "BOTH") {
      if (!inquiry.clientEmail) {
        results.errors.push("Customer does not have a valid email address");
      } else {
        try {
          const emailResult = await EmailService.sendEmail({
            tenantType: "STORE",
            companyId,
            template: "INQUIRY_REPLY",
            recipient: inquiry.clientEmail,
            data: {
              clientName: inquiry.clientName,
              replyMessage: replyMessage.trim(),
              propertyName: inquiry.propertyName,
            },
            async: true,
          });

          results.emailSent = emailResult.success;
          if (!emailResult.success && emailResult.error) {
            results.errors.push(`Email error: ${emailResult.error}`);
          }
        } catch (err: any) {
          results.errors.push(`Email failed: ${err.message}`);
        }
      }
    }

    // 4. WhatsApp Channel Dispatch
    if (channel === "WHATSAPP" || channel === "BOTH") {
      if (!inquiry.clientPhone) {
        results.errors.push("Customer does not have a phone number for WhatsApp");
      } else {
        try {
          const whatsappAccount = await prisma.whatsAppAccount.findFirst({
            where: { companyId, isActive: true },
          });

          if (!whatsappAccount || !whatsappAccount.phoneNumberId) {
            results.errors.push("No active WhatsApp account configured for this store");
          } else {
            const accessToken = decryptWhatsAppAccessToken(whatsappAccount);
            if (!accessToken) {
              results.errors.push("Store WhatsApp credentials cannot be decrypted");
            } else {
              const metaClient = new MetaWhatsAppClient({
                accessToken,
                phoneNumberId: whatsappAccount.phoneNumberId,
              });

              await metaClient.sendTextMessage({
                to: inquiry.clientPhone,
                body: replyMessage.trim(),
              });

              results.whatsappSent = true;
            }
          }
        } catch (err: any) {
          results.errors.push(`WhatsApp failed: ${err.message}`);
        }
      }
    }

    // 5. Update inquiry status to Responded
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: {
        status: "Responded",
        assignedToAgentName: assignedToAgentName || auth.companyName || inquiry.assignedToAgentName,
      },
    });

    // 6. Record durable communication history
    await prisma.communication.create({
      data: {
        companyId,
        subject: `Re: Inquiry from ${inquiry.clientName}`,
        content: replyMessage.trim(),
        communicationType: channel === "WHATSAPP" ? "SMS" : "EMAIL",
        status: "SENT",
        recipients: [inquiry.clientEmail, inquiry.clientPhone].filter(Boolean) as string[],
        sentDate: new Date(),
      },
    }).catch(() => {});

    // Invalidate inquiry caches
    await cacheDel(`tenant:${companyId}:inquiries:*`);

    return formatResponse(
      true,
      {
        inquiry: updatedInquiry,
        delivery: results,
      },
      "Reply transmitted successfully",
      200
    );
  } catch (error: any) {
    console.error("[InquiryReply] Error sending reply:", error);
    return formatResponse(false, null, error.message || "Failed to process reply", 500);
  }
}
