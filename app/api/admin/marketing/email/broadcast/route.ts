import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { EmailService } from "@/lib/email/emailService";
import { enqueueEmailBroadcastJob } from "@/lib/email/queue/emailQueue";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as {
      user?: { email?: string | null; name?: string | null; id?: string };
    } | null;

    if (!session?.user?.email) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, role: true, companyId: true },
    });

    if (!user) {
      return formatResponse(false, null, "User account not found", 401);
    }

    const body = await req.json().catch(() => ({}));
    const {
      companyId,
      campaignType = "PROMOTIONAL",
      filter = "ALL_CUSTOMERS",
      customEmails = [],
      subject,
      headline,
      badgeText,
      highlightText,
      noticeBox,
      bodyText,
      ctaLabel,
      ctaUrl,
      isTest = false,
      testRecipient,
    } = body;

    const targetCompanyId = companyId || user.companyId;

    if (!targetCompanyId) {
      return formatResponse(false, null, "Store companyId is required", 400);
    }

    // Tenant isolation check
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.companyId !== targetCompanyId) {
      const ownedCompany = await prisma.company.findFirst({
        where: { id: targetCompanyId, userId: user.id },
      });
      if (!ownedCompany) {
        return formatResponse(false, null, "Unauthorized access to this store context", 403);
      }
    }

    // Content validation
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
      badgeText: (badgeText || (campaignType === "COMMUNICATION" ? "📢 Store Notice" : "✨ Store Offer")).trim(),
      bodyText: bodyText.trim(),
      highlightText: highlightText ? highlightText.trim() : undefined,
      noticeBox: noticeBox ? noticeBox.trim() : undefined,
      ctaLabel: ctaLabel ? ctaLabel.trim() : undefined,
      ctaUrl: ctaUrl ? ctaUrl.trim() : undefined,
    };

    // --- Path A: Test Send Mode ---
    if (isTest) {
      const recipient = (testRecipient || user.email || "").trim().toLowerCase();
      if (!recipient || !recipient.includes("@")) {
        return formatResponse(false, null, "Valid test recipient email is required", 400);
      }

      const testResult = await EmailService.sendEmail({
        tenantType: "STORE",
        companyId: targetCompanyId,
        template: templateId,
        recipient,
        data: {
          ...commonEmailData,
          recipientName: user.name || "Store Merchant",
        },
        async: false, // Immediate send for instant test feedback
      });

      if (!testResult.success) {
        return formatResponse(
          false,
          { error: testResult.error },
          testResult.error || "Failed to deliver store test email",
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
        `Test email delivered to ${recipient} with your store branding!`,
        200
      );
    }

    // --- Path B: Audience Broadcast Mode ---
    let recipients: Array<{ email: string; name?: string | null }> = [];

    if (filter === "CUSTOM") {
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

      recipients = cleanList.map((email) => ({ email, name: email.split("@")[0] }));
    } else {
      // 1. Fetch consumers
      const consumers = await prisma.consumer.findMany({
        where: { companyId: targetCompanyId },
        select: {
          totalOrders: true,
          lastPurchaseAt: true,
          type: true,
          user: { select: { name: true, email: true } },
        },
        take: 2000,
      });

      // 2. Fetch orders
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const orderCustomers = await prisma.customerOrder.findMany({
        where: {
          companyId: targetCompanyId,
          email: { not: null },
        },
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
        take: 2000,
      });

      const customerMap = new Map<
        string,
        {
          name: string;
          email: string;
          totalOrders: number;
          lastPurchaseAt?: Date | null;
          isLead: boolean;
        }
      >();

      for (const c of consumers) {
        const email = (c.user?.email || "").trim().toLowerCase();
        if (email && email.includes("@")) {
          customerMap.set(email, {
            name: c.user?.name || email.split("@")[0],
            email,
            totalOrders: c.totalOrders || 0,
            lastPurchaseAt: c.lastPurchaseAt,
            isLead: c.type === "lead" || (c.totalOrders || 0) === 0,
          });
        }
      }

      for (const o of orderCustomers) {
        const email = (o.email || "").trim().toLowerCase();
        if (email && email.includes("@")) {
          const existing = customerMap.get(email);
          if (existing) {
            existing.totalOrders = Math.max(existing.totalOrders, 1);
            if (!existing.lastPurchaseAt || (o.createdAt && o.createdAt > existing.lastPurchaseAt)) {
              existing.lastPurchaseAt = o.createdAt;
            }
            existing.isLead = false;
          } else {
            customerMap.set(email, {
              name: o.name || email.split("@")[0],
              email,
              totalOrders: 1,
              lastPurchaseAt: o.createdAt,
              isLead: false,
            });
          }
        }
      }

      let allCustomers = Array.from(customerMap.values());
      if (filter === "REPEAT_BUYERS") {
        allCustomers = allCustomers.filter((c) => c.totalOrders >= 2);
      } else if (filter === "RECENT_BUYERS") {
        allCustomers = allCustomers.filter(
          (c) => c.lastPurchaseAt && new Date(c.lastPurchaseAt) >= thirtyDaysAgo
        );
      } else if (filter === "LEADS") {
        allCustomers = allCustomers.filter((c) => c.isLead);
      }

      recipients = allCustomers.map((c) => ({ email: c.email, name: c.name }));
    }

    if (recipients.length === 0) {
      return formatResponse(
        false,
        null,
        "No matching customer emails found in the selected audience",
        400
      );
    }

    // Offload store campaign broadcast to BullMQ asynchronous queue
    const broadcastId = `store_bcast_${targetCompanyId}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const enqueued = await enqueueEmailBroadcastJob({
      broadcastId,
      tenantType: "STORE",
      companyId: targetCompanyId,
      template: templateId,
      recipients,
      commonData: commonEmailData,
    });

    if (enqueued) {
      return formatResponse(
        true,
        {
          broadcastId,
          status: "QUEUED",
          totalTargeted: recipients.length,
        },
        `Store campaign successfully enqueued for ${recipients.length} customer${recipients.length > 1 ? "s" : ""}`,
        202
      );
    }

    // Graceful inline fallback if BullMQ queueing is unavailable
    let totalSent = 0;
    let totalQueued = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const result = await EmailService.sendEmail({
          tenantType: "STORE",
          companyId: targetCompanyId,
          template: templateId,
          recipient: recipient.email,
          data: {
            ...commonEmailData,
            recipientName: recipient.name || "valued customer",
          },
          async: true,
          idempotencyKey: `store_broadcast_${targetCompanyId}_${Date.now()}_${recipient.email}`,
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
      `Campaign successfully initiated to ${recipients.length} customer${recipients.length > 1 ? "s" : ""} (${totalSent} sent, ${totalQueued} queued, ${totalFailed} failed)`,
      200
    );
  } catch (err: any) {
    console.error("[Store Email Broadcast] POST error:", err);
    return formatResponse(false, null, err.message || "Failed to dispatch store broadcast", 500);
  }
}
