import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { EmailService } from "@/lib/email/emailService";
import { ROLES } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin(req);
    const body = await req.json();

    const {
      campaignType = "PROMOTIONAL",
      targetAudience = "ALL",
      targetRole = null,
      customEmails = [],
      verifiedOnly = false,
      subject,
      headline,
      bodyText,
      badgeText,
      highlightText,
      noticeBox,
      ctaLabel,
      ctaUrl,
      isTest = false,
      testRecipient,
    } = body;

    // Validation
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return formatResponse(false, null, "Email subject is required", 400);
    }
    if (!bodyText || typeof bodyText !== "string" || !bodyText.trim()) {
      return formatResponse(false, null, "Email message body is required", 400);
    }

    const templateId =
      campaignType === "COMMUNICATION"
        ? "SYSTEM_COMMUNICATION"
        : "PROMOTIONAL_ANNOUNCEMENT";

    const commonEmailData = {
      subject: subject.trim(),
      headline: (headline || subject).trim(),
      badgeText: (badgeText || (campaignType === "COMMUNICATION" ? "📢 Notice" : "✨ Special Offer")).trim(),
      bodyText: bodyText.trim(),
      highlightText: highlightText ? highlightText.trim() : undefined,
      noticeBox: noticeBox ? noticeBox.trim() : undefined,
      ctaLabel: ctaLabel ? ctaLabel.trim() : undefined,
      ctaUrl: ctaUrl ? ctaUrl.trim() : undefined,
    };

    // --- Path A: Test Send Mode ---
    if (isTest) {
      const recipient = (testRecipient || admin.email || "").trim().toLowerCase();
      if (!recipient || !recipient.includes("@")) {
        return formatResponse(false, null, "Valid test recipient email is required", 400);
      }

      const testResult = await EmailService.sendEmail({
        tenantType: "PLATFORM",
        template: templateId,
        recipient,
        data: {
          ...commonEmailData,
          recipientName: admin.name || "Super Admin",
        },
        async: false, // Immediate delivery for instant test feedback
      });

      if (!testResult.success) {
        return formatResponse(
          false,
          { error: testResult.error },
          testResult.error || "Failed to deliver test broadcast email",
          400
        );
      }

      return formatResponse(
        true,
        {
          isTest: true,
          recipient,
          messageId: testResult.messageId,
          provider: testResult.provider,
        },
        `Test ${campaignType.toLowerCase()} email delivered successfully to ${recipient}`,
        200
      );
    }

    // --- Path B: Audience Broadcast Mode ---
    let recipients: Array<{ email: string; name?: string | null }> = [];

    if (targetAudience === "CUSTOM") {
      const rawList: string[] = Array.isArray(customEmails)
        ? customEmails
        : typeof customEmails === "string"
        ? (customEmails as string).split(/[,\n]+/)
        : [];

      const cleanList = Array.from(
        new Set(
          rawList
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e && e.includes("@"))
        )
      );

      if (cleanList.length === 0) {
        return formatResponse(
          false,
          null,
          "Please specify at least one valid recipient email address for custom audience",
          400
        );
      }

      recipients = cleanList.map((email) => ({ email, name: email.split("@")[0] }));
    } else {
      const baseWhere: any = {
        email: { not: "" },
        deletedAt: null,
        status: { not: "SUSPENDED" },
      };

      if (verifiedOnly) {
        baseWhere.emailVerified = true;
      }

      if (targetAudience === "STORE_ADMINS") {
        baseWhere.OR = [{ role: "ADMIN" }, { companyId: { not: null } }];
      } else if (targetAudience === "ROLE" && targetRole) {
        baseWhere.role = targetRole as ROLES;
      }

      // Max safety limit for single web dispatch request: 1000 users
      const users = await prisma.user.findMany({
        where: baseWhere,
        select: { email: true, name: true },
        take: 1000,
        orderBy: { createdAt: "desc" },
      });

      recipients = users.filter((u) => u.email && u.email.includes("@"));
    }

    if (recipients.length === 0) {
      return formatResponse(
        false,
        null,
        "No matching recipients found for the selected audience filter",
        400
      );
    }

    // Dispatch loop with controlled batching
    let totalQueued = 0;
    let totalSent = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const result = await EmailService.sendEmail({
          tenantType: "PLATFORM",
          template: templateId,
          recipient: recipient.email,
          data: {
            ...commonEmailData,
            recipientName: recipient.name || "valued customer",
          },
          // Allows BullMQ queueing if redis is active, or seamless inline fallback
          async: true,
          idempotencyKey: `broadcast_${Date.now()}_${recipient.email}`,
        });

        if (result.success) {
          if (result.messageId?.startsWith("queued_")) {
            totalQueued++;
          } else {
            totalSent++;
          }
        } else {
          totalFailed++;
          if (result.error && errors.length < 5) {
            errors.push(`${recipient.email}: ${result.error}`);
          }
        }
      } catch (err: any) {
        totalFailed++;
        if (errors.length < 5) {
          errors.push(`${recipient.email}: ${err.message}`);
        }
      }
    }

    return formatResponse(
      true,
      {
        totalTargeted: recipients.length,
        totalSent,
        totalQueued,
        totalFailed,
        errors: errors.length > 0 ? errors : undefined,
      },
      `Broadcast successfully initiated to ${recipients.length} user${recipients.length > 1 ? "s" : ""} (${totalSent} sent, ${totalQueued} queued, ${totalFailed} failed)`,
      200
    );
  } catch (err: any) {
    console.error("[SuperAdmin Email Broadcast] POST error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Failed to execute email broadcast",
      err.statusCode || 500
    );
  }
}
