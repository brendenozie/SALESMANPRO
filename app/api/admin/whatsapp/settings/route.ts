import { NextRequest } from "next/server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is missing", 400);
  }

  const cacheKey = `admin:whatsapp:settings:${companyId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const response = formatResponse(
        true,
        cached,
        "Fetched settings (Cached)",
        200,
      );
      response.headers.set(
        "Cache-Control",
        "private, s-maxage=60, stale-while-revalidate=120",
      );
      return response;
    }
  } catch (e) {}

  try {
    const [account, aiConfig] = await Promise.all([
      prisma.whatsAppAccount.findFirst({
        where: { companyId },
        select: {
          environment: true,
          phoneNumberId: true,
          phoneNumber: true,
          displayName: true,
          appId: true,
          accessTokenEncrypted: true,
          appSecretEncrypted: true,
          webhookVerifyTokenEncrypted: true,
        },
      }),
      prisma.whatsAppAIConfig.findUnique({
        where: { companyId },
        select: {
          enabled: true,
          provider: true,
          model: true,
          assistantName: true,
          tone: true,
          systemPrompt: true,
          businessDescription: true,
          autoReply: true,
          humanHandoff: true,
          handoffConfidenceThreshold: true,
          temperature: true,
          canSearchProducts: true,
          canCheckOrders: true,
          canCreateOrders: true,
        },
      }),
    ]);

    const payload = {
      account: account
        ? {
            environment: account.environment,
            phoneNumberId: account.phoneNumberId || "",
            phoneNumber: account.phoneNumber || "",
            displayName: account.displayName || "",
            appId: account.appId || "",
          }
        : null,
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
          }
        : null,
    };

    try {
      await cacheSet(cacheKey, payload, 300);
    } catch (e) {}

    const response = formatResponse(
      true,
      payload,
      "Fetched WhatsApp settings successfully",
      200,
    );
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120",
    );
    return response;
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to fetch WhatsApp settings",
      500,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, account, aiConfig } = body;

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company ID context parameters missing",
        400,
      );
    }

    // 1. Upsert WhatsApp Account Credentials
    if (account && account.phoneNumberId) {
      const existingAccount = await prisma.whatsAppAccount.findFirst({
        where: { companyId },
      });

      const accountData = {
        environment: account.environment || "PRODUCTION",
        phoneNumberId: account.phoneNumberId,
        phoneNumber: account.phoneNumber,
        displayName: account.displayName,
        appId: account.appId,
        ...(account.accessToken && {
          accessTokenEncrypted: account.accessToken,
        }),
        ...(account.appSecret && { appSecretEncrypted: account.appSecret }),
        ...(account.webhookVerifyToken && {
          webhookVerifyTokenEncrypted: account.webhookVerifyToken,
        }),
        status: "CONNECTED" as const,
      };

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
          },
        });
      }
    }

    // 2. Upsert WhatsApp AI Configuration
    if (aiConfig) {
      await prisma.whatsAppAIConfig.upsert({
        where: { companyId },
        update: {
          enabled: Boolean(aiConfig.enabled),
          provider: aiConfig.provider,
          model: aiConfig.model,
          assistantName: aiConfig.assistantName,
          tone: aiConfig.tone,
          systemPrompt: aiConfig.systemPrompt,
          businessDescription: aiConfig.businessDescription,
          autoReply: Boolean(aiConfig.autoReply),
          humanHandoff: Boolean(aiConfig.humanHandoff),
          handoffConfidenceThreshold: Number(
            aiConfig.handoffConfidenceThreshold,
          ),
          temperature: Number(aiConfig.temperature),
          canSearchProducts: Boolean(aiConfig.canSearchProducts),
          canCheckOrders: Boolean(aiConfig.canCheckOrders),
          canCreateOrders: Boolean(aiConfig.canCreateOrders),
        },
        create: {
          companyId,
          enabled: Boolean(aiConfig.enabled),
          provider: aiConfig.provider || "OPENAI",
          model: aiConfig.model || "gpt-4o",
          assistantName: aiConfig.assistantName || "Assistant",
          tone: aiConfig.tone || "professional",
          systemPrompt: aiConfig.systemPrompt,
          businessDescription: aiConfig.businessDescription,
          autoReply: Boolean(aiConfig.autoReply),
          humanHandoff: Boolean(aiConfig.humanHandoff),
          handoffConfidenceThreshold: Number(
            aiConfig.handoffConfidenceThreshold || 0.55,
          ),
          temperature: Number(aiConfig.temperature || 0.3),
          canSearchProducts: Boolean(aiConfig.canSearchProducts),
          canCheckOrders: Boolean(aiConfig.canCheckOrders),
          canCreateOrders: Boolean(aiConfig.canCreateOrders),
        },
      });
    }

    // 3. Clear Redis Cache
    try {
      await cacheDel(`admin:whatsapp:settings:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      { success: true },
      "WhatsApp & AI settings updated successfully",
      200,
    );
  } catch (error) {
    console.error("Error updating WhatsApp config:", error);
    return formatResponse(
      false,
      null,
      "Failed to update WhatsApp settings",
      500,
    );
  }
}
