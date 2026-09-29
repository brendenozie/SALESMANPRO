import { NextRequest } from "next/server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { encrypt } from "@/lib/crypto";
import { looksLikePlaceholderSecret } from "@/lib/whatsapp/credentials";
import { getWhatsAppWorkerHealth } from "@/lib/whatsapp/workerHealth";
import { enforceWhatsAppAi } from "@/lib/subscriptions/enforce-limits";

function publicAccount(account: {
  environment: string;
  phoneNumberId: string;
  phoneNumber: string | null;
  displayName: string | null;
  appId: string | null;
  businessAccountId: string | null;
  status: string;
  isActive: boolean;
  lastWebhookAt: Date | null;
  lastError: string | null;
  accessTokenEncrypted: string | null;
  appSecretEncrypted: string | null;
  webhookVerifyTokenEncrypted: string | null;
} | null) {
  if (!account) return null;
  return {
    environment: account.environment,
    phoneNumberId: account.phoneNumberId || "",
    phoneNumber: account.phoneNumber || "",
    displayName: account.displayName || "",
    appId: account.appId || "",
    wabaAccountId: account.businessAccountId || "",
    status: account.status,
    isActive: account.isActive,
    lastWebhookAt: account.lastWebhookAt,
    lastError: account.lastError,
    hasAccessToken: Boolean(account.accessTokenEncrypted),
    hasAppSecret: Boolean(account.appSecretEncrypted),
    hasVerifyToken: Boolean(account.webhookVerifyTokenEncrypted),
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const companyId = auth.companyId;
    const cacheKey = `admin:whatsapp:settings:${companyId}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return formatResponse(true, cached, "Fetched settings (Cached)", 200);
      }
    } catch {
      // ignore cache
    }

    const [account, aiConfig, company, worker] = await Promise.all([
      prisma.whatsAppAccount.findFirst({
        where: { companyId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
      prisma.whatsAppAIConfig.findUnique({ where: { companyId } }),
      prisma.company.findUnique({
        where: { id: companyId },
        select: { aiCreditBalance: true },
      }),
      getWhatsAppWorkerHealth(),
    ]);

    const payload = {
      account: publicAccount(account),
      aiConfig: aiConfig
        ? {
            enabled: aiConfig.enabled,
            provider: aiConfig.provider,
            model: aiConfig.model,
            assistantName: aiConfig.assistantName || "Assistant",
            tone: aiConfig.tone || "professional",
            systemPrompt: aiConfig.systemPrompt || "",
            businessDescription: aiConfig.businessDescription || "",
            autoReply: aiConfig.autoReply,
            humanHandoff: aiConfig.humanHandoff,
            handoffConfidenceThreshold: aiConfig.handoffConfidenceThreshold,
            temperature: aiConfig.temperature,
            canSearchProducts: aiConfig.canSearchProducts,
            canCheckOrders: aiConfig.canCheckOrders,
            canCreateOrders: aiConfig.canCreateOrders,
            respectBusinessHours: aiConfig.respectBusinessHours,
            businessHours: aiConfig.businessHours,
            fallbackMessage: aiConfig.fallbackMessage,
            handoffMessage: aiConfig.handoffMessage,
          }
        : null,
      connection: {
        connected: Boolean(account?.isActive && account.status === "CONNECTED"),
        webhookHealthy: Boolean(account?.lastWebhookAt),
        workerStatus: worker.status,
        aiEnabled: aiConfig?.enabled ?? false,
      },
      aiCreditBalance: company?.aiCreditBalance ?? 0,
    };

    try {
      await cacheSet(cacheKey, payload, 60);
    } catch {
      // ignore
    }

    return formatResponse(true, payload, "Fetched WhatsApp settings successfully", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const body = await req.json();
    const companyId = auth.companyId;

    // --- Subscription Plan Enforcement: WhatsApp AI Feature Gate ---
    const whatsAppCheck = await enforceWhatsAppAi(companyId);
    if (!whatsAppCheck.allowed) {
      return formatResponse(false, { upgradeRequired: whatsAppCheck.upgradeRequired }, whatsAppCheck.message, 403);
    }

    const accountInput = body.account ?? body;
    const aiConfigInput = body.aiConfig ?? body;

    if (accountInput?.phoneNumberId) {
      const existingAccount = await prisma.whatsAppAccount.findFirst({
        where: { companyId },
      });

      const accountData: Record<string, unknown> = {
        environment: accountInput.environment || "PRODUCTION",
        phoneNumberId: accountInput.phoneNumberId,
        phoneNumber: accountInput.phoneNumber,
        displayName: accountInput.displayName,
        appId: accountInput.appId,
        businessAccountId: accountInput.wabaAccountId || accountInput.businessAccountId,
        status: "CONNECTED",
        isActive: true,
      };

      if (accountInput.accessToken && !looksLikePlaceholderSecret(accountInput.accessToken)) {
        const enc = encrypt(accountInput.accessToken);
        accountData.accessTokenEncrypted = enc.value;
        accountData.accessTokenIv = enc.iv;
        accountData.accessTokenTag = enc.tag;
      }
      if (accountInput.appSecret && !looksLikePlaceholderSecret(accountInput.appSecret)) {
        const enc = encrypt(accountInput.appSecret);
        accountData.appSecretEncrypted = enc.value;
        accountData.appSecretIv = enc.iv;
        accountData.appSecretTag = enc.tag;
      }
      if (
        accountInput.webhookVerifyToken &&
        !looksLikePlaceholderSecret(accountInput.webhookVerifyToken)
      ) {
        const enc = encrypt(accountInput.webhookVerifyToken);
        accountData.webhookVerifyTokenEncrypted = enc.value;
        accountData.webhookVerifyTokenIv = enc.iv;
        accountData.webhookVerifyTokenTag = enc.tag;
      }

      if (existingAccount) {
        await prisma.whatsAppAccount.update({
          where: { id: existingAccount.id },
          data: accountData,
        });
      } else {
        await prisma.whatsAppAccount.create({
          data: {
            companyId,
            ...accountData,
          } as any,
        });
      }
    }

    if (aiConfigInput && (body.aiConfig || body.enableAiAgent !== undefined || body.enabled !== undefined || body.model)) {
      await prisma.whatsAppAIConfig.upsert({
        where: { companyId },
        update: {
          enabled: Boolean(aiConfigInput.enabled ?? aiConfigInput.enableAiAgent ?? true),
          provider: aiConfigInput.provider || "OPENAI",
          model: aiConfigInput.model,
          assistantName: aiConfigInput.assistantName,
          tone: aiConfigInput.tone || aiConfigInput.aiTone,
          systemPrompt: aiConfigInput.systemPrompt || aiConfigInput.aiSystemPrompt,
          businessDescription: aiConfigInput.businessDescription,
          autoReply: Boolean(aiConfigInput.autoReply ?? true),
          humanHandoff: Boolean(aiConfigInput.humanHandoff),
          handoffConfidenceThreshold: Number(aiConfigInput.handoffConfidenceThreshold ?? 0.55),
          temperature: Number(aiConfigInput.temperature ?? 0.3),
          canSearchProducts: Boolean(aiConfigInput.canSearchProducts),
          canCheckOrders: Boolean(aiConfigInput.canCheckOrders),
          canCreateOrders: Boolean(aiConfigInput.canCreateOrders),
          respectBusinessHours: Boolean(aiConfigInput.enableBusinessHours ?? aiConfigInput.respectBusinessHours),
        },
        create: {
          companyId,
          enabled: Boolean(aiConfigInput.enabled ?? aiConfigInput.enableAiAgent ?? true),
          provider: aiConfigInput.provider || "OPENAI",
          model: aiConfigInput.model || "gpt-4o-mini",
          assistantName: aiConfigInput.assistantName || "Assistant",
          tone: aiConfigInput.tone || aiConfigInput.aiTone || "professional",
          systemPrompt: aiConfigInput.systemPrompt || aiConfigInput.aiSystemPrompt,
          businessDescription: aiConfigInput.businessDescription,
          autoReply: Boolean(aiConfigInput.autoReply ?? true),
          humanHandoff: Boolean(aiConfigInput.humanHandoff ?? true),
          handoffConfidenceThreshold: Number(aiConfigInput.handoffConfidenceThreshold || 0.55),
          temperature: Number(aiConfigInput.temperature || 0.3),
          canSearchProducts: Boolean(aiConfigInput.canSearchProducts ?? true),
          canCheckOrders: Boolean(aiConfigInput.canCheckOrders ?? true),
          canCreateOrders: Boolean(aiConfigInput.canCreateOrders),
        },
      });
    }

    try {
      await cacheDel(`admin:whatsapp:settings:${companyId}`);
    } catch {
      // ignore
    }

    return formatResponse(true, { success: true }, "WhatsApp & AI settings updated successfully", 200);
  } catch (error) {
    console.error("Error updating WhatsApp config:", error);
    return unauthorizedResponse(error);
  }
}
