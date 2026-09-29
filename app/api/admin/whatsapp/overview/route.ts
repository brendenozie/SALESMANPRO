import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { creditLedger } from "@/lib/ai/creditLedger";
import { getWhatsAppWorkerHealth } from "@/lib/whatsapp/workerHealth";
import { enforceWhatsAppAi } from "@/lib/subscriptions/enforce-limits";

function startOfRange(range: string) {
  const now = new Date();
  if (range === "today" || range === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (range === "7d" || range === "week") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (range === "all") return undefined;
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

export async function GET(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const companyId = auth.companyId;

    // --- Subscription Plan Enforcement: WhatsApp AI Feature Gate ---
    const waCheck = await enforceWhatsAppAi(companyId);
    if (!waCheck.allowed) {
      return formatResponse(false, { upgradeRequired: waCheck.upgradeRequired }, waCheck.message, 403);
    }
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const from = startOfRange(range);

    const messageWhere = {
      companyId,
      ...(from ? { createdAt: { gte: from } } : {}),
    };

    const [
      account,
      aiConfig,
      creditBalance,
      worker,
      inbound,
      outbound,
      aiOutbound,
      humanOutbound,
      failed,
      openConversations,
      escalations,
      customers,
      usage,
    ] = await Promise.all([
      prisma.whatsAppAccount.findFirst({
        where: { companyId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        select: {
          phoneNumber: true,
          displayName: true,
          status: true,
          isActive: true,
          lastWebhookAt: true,
          lastError: true,
        },
      }),
      prisma.whatsAppAIConfig.findUnique({
        where: { companyId },
        select: { enabled: true, autoReply: true, model: true },
      }),
      creditLedger.getBalance(companyId),
      getWhatsAppWorkerHealth(),
      prisma.whatsAppMessage.count({ where: { ...messageWhere, direction: "INBOUND" } }),
      prisma.whatsAppMessage.count({ where: { ...messageWhere, direction: "OUTBOUND" } }),
      prisma.whatsAppMessage.count({ where: { ...messageWhere, senderType: "AI" } }),
      prisma.whatsAppMessage.count({ where: { ...messageWhere, senderType: "AGENT" } }),
      prisma.whatsAppMessage.count({ where: { ...messageWhere, status: "FAILED" } }),
      prisma.whatsAppConversation.count({
        where: {
          companyId,
          status: { in: ["OPEN", "PENDING", "WAITING_FOR_CUSTOMER", "WAITING_FOR_AGENT"] },
        },
      }),
      prisma.whatsAppConversation.count({
        where: { companyId, humanHandoff: true, status: { notIn: ["CLOSED", "RESOLVED"] } },
      }),
      prisma.whatsAppContact.count({ where: { companyId } }),
      prisma.aIUsage.aggregate({
        where: {
          companyId,
          source: "WHATSAPP",
          ...(from ? { createdAt: { gte: from } } : {}),
        },
        _count: { id: true },
        _sum: { creditsCost: true, totalTokens: true },
      }),
    ]);

    const recent = await prisma.whatsAppMessage.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        text: true,
        direction: true,
        senderType: true,
        status: true,
        createdAt: true,
        conversationId: true,
      },
    });

    const failedUsage = await prisma.aIUsage.count({
      where: {
        companyId,
        source: "WHATSAPP",
        status: "FAILED",
        ...(from ? { createdAt: { gte: from } } : {}),
      },
    });

    return formatResponse(
      true,
      {
        connection: {
          connected: Boolean(account?.isActive && account.status === "CONNECTED"),
          phoneNumber: account?.phoneNumber || null,
          displayName: account?.displayName || null,
          status: account?.status || "DISCONNECTED",
          lastWebhookAt: account?.lastWebhookAt,
          webhookHealthy: Boolean(account?.lastWebhookAt),
          workerStatus: worker.status,
          aiEnabled: Boolean(aiConfig?.enabled && aiConfig?.autoReply),
          model: aiConfig?.model || null,
          lastError: account?.lastError,
        },
        credits: {
          balance: creditBalance,
        },
        metrics: {
          inboundMessages: inbound,
          outboundMessages: outbound,
          aiResponses: aiOutbound,
          humanResponses: humanOutbound,
          failedMessages: failed,
          activeConversations: openConversations,
          escalations,
          activeCustomers: customers,
          aiRequests: usage._count.id,
          creditsUsed: usage._sum.creditsCost ?? 0,
          tokens: usage._sum.totalTokens ?? 0,
          failedAiRequests: failedUsage,
        },
        recentActivity: recent,
      },
      "WhatsApp overview loaded",
      200,
    );
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
