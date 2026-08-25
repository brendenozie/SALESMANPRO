import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
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
    const account = await prisma.whatsAppAccount.findFirst({
      where: { companyId },
      select: {
        phoneNumberId: true,
        businessAccountId: true,
        accessTokenEncrypted: true,
        webhookVerifyTokenEncrypted: true,
      },
    });

    const aiConfig = await prisma.whatsAppAIConfig.findUnique({
      where: { companyId },
      select: {
        enabled: true,
        tone: true,
        systemPrompt: true,
        maxConversationMessages: true,
        respectBusinessHours: true,
        businessHours: true,
      },
    });

    const handoffAutomation = await prisma.whatsAppAutomation.findFirst({
      where: { companyId, trigger: "HUMAN_HANDOFF" },
      select: { keywords: true },
    });

    const bh = (aiConfig?.businessHours as any) || {};

    const payload = {
      phoneNumberId: account?.phoneNumberId || "",
      wabaAccountId: account?.businessAccountId || "",
      accessToken: account?.accessTokenEncrypted || "",
      webhookVerifyToken: account?.webhookVerifyTokenEncrypted || "",
      enableAiAgent: aiConfig?.enabled ?? true,
      aiTone: aiConfig?.tone || "friendly",
      aiSystemPrompt: aiConfig?.systemPrompt || "",
      maxAutoRepliesPerUser: aiConfig?.maxConversationMessages || 10,
      autoHandoffKeywords:
        handoffAutomation?.keywords.join(", ") || "agent, human, support",
      enableBusinessHours: aiConfig?.respectBusinessHours ?? false,
      businessHoursStart: bh.start || "08:00",
      businessHoursEnd: bh.end || "17:00",
      offHoursMessage: bh.offHoursMessage || "We are currently offline.",
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      phoneNumberId,
      wabaAccountId,
      accessToken,
      webhookVerifyToken,
      enableAiAgent,
      aiTone,
      aiSystemPrompt,
      maxAutoRepliesPerUser,
      autoHandoffKeywords,
      enableBusinessHours,
      businessHoursStart,
      businessHoursEnd,
      offHoursMessage,
    } = body;

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company ID context parameters missing",
        400,
      );
    }

    if (phoneNumberId) {
      const existingAccount = await prisma.whatsAppAccount.findFirst({
        where: { companyId },
      });

      if (existingAccount) {
        await prisma.whatsAppAccount.update({
          where: { id: existingAccount.id },
          data: {
            phoneNumberId,
            businessAccountId: wabaAccountId,
            accessTokenEncrypted: accessToken,
            webhookVerifyTokenEncrypted: webhookVerifyToken,
            status: "CONNECTED",
          },
        });
      } else {
        await prisma.whatsAppAccount.create({
          data: {
            companyId,
            phoneNumberId,
            businessAccountId: wabaAccountId,
            accessTokenEncrypted: accessToken,
            webhookVerifyTokenEncrypted: webhookVerifyToken,
            status: "CONNECTED",
          },
        });
      }
    }

    await prisma.whatsAppAIConfig.upsert({
      where: { companyId },
      update: {
        enabled: Boolean(enableAiAgent),
        tone: aiTone,
        systemPrompt: aiSystemPrompt,
        maxConversationMessages: Number(maxAutoRepliesPerUser),
        respectBusinessHours: Boolean(enableBusinessHours),
        businessHours: {
          start: businessHoursStart,
          end: businessHoursEnd,
          offHoursMessage,
        },
      },
      create: {
        companyId,
        enabled: Boolean(enableAiAgent),
        tone: aiTone,
        systemPrompt: aiSystemPrompt,
        maxConversationMessages: Number(maxAutoRepliesPerUser),
        respectBusinessHours: Boolean(enableBusinessHours),
        businessHours: {
          start: businessHoursStart,
          end: businessHoursEnd,
          offHoursMessage,
        },
      },
    });

    if (autoHandoffKeywords) {
      const keywordsArray = autoHandoffKeywords
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean);

      const existingHandoff = await prisma.whatsAppAutomation.findFirst({
        where: { companyId, trigger: "HUMAN_HANDOFF" },
      });

      if (existingHandoff) {
        await prisma.whatsAppAutomation.update({
          where: { id: existingHandoff.id },
          data: { keywords: keywordsArray },
        });
      } else {
        await prisma.whatsAppAutomation.create({
          data: {
            companyId,
            name: "Human Escalation Handoff",
            trigger: "HUMAN_HANDOFF",
            keywords: keywordsArray,
          },
        });
      }
    }

    try {
      await cacheDel(`admin:whatsapp:settings:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      { success: true },
      "WhatsApp settings updated successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to update WhatsApp settings",
      500,
    );
  }
}
