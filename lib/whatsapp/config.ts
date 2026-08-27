import prisma from "@/server/db/prismadb";

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string;
  businessAccountId?: string;
  aiEnabled: boolean;
  aiModel?: string;
  aiSystemPrompt?: string;
  allowAIOrderCreation: boolean;
  allowAICancellation: boolean;
  allowAIPaymentLinks: boolean;
  allowAIAppointmentBooking: boolean;
  enableHumanHandoff: boolean;
}

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export async function getWhatsAppConfig(
  companyId?: string,
): Promise<WhatsAppConfig> {
  if (companyId) {
    const [settings, account] = await Promise.all([
      prisma.whatsAppAIConfig.findUnique({
        where: { companyId },
      }),
      prisma.whatsAppAccount.findFirst({
        where: { companyId, isDefault: true, isActive: true },
      }),
    ]);

    if (settings) {
      // Resolve Access Token: Fall back to Account encrypted token, then environment variable
      const accessToken =
        settings.apiKeyEncrypted ||
        account?.accessTokenEncrypted ||
        process.env.WHATSAPP_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error(
          "WhatsApp access token is not configured for this company",
        );
      }

      // Resolve Phone Number ID: Fall back to default account
      const phoneNumberId =
        account?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

      return {
        enabled: settings.enabled,
        phoneNumberId: required(phoneNumberId, "WhatsApp phoneNumberId"),
        accessToken,
        businessAccountId:
          account?.businessAccountId ||
          process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,

        aiEnabled: settings.autoReply,

        aiModel:
          settings.model || process.env.WHATSAPP_AI_MODEL || "gpt-5.6-luna",

        aiSystemPrompt: settings.systemPrompt ?? undefined,

        allowAIOrderCreation: settings.canCreateOrders,

        allowAICancellation: settings.canCancelOrders,

        allowAIPaymentLinks: settings.canCheckPayments,

        allowAIAppointmentBooking: settings.canCreateAppointments,

        enableHumanHandoff: settings.humanHandoff,
      };
    }
  }

  // Fallback default configuration using Environment Variables
  return {
    enabled: true,

    phoneNumberId: required(
      process.env.WHATSAPP_PHONE_NUMBER_ID,
      "WHATSAPP_PHONE_NUMBER_ID",
    ),

    accessToken: required(
      process.env.WHATSAPP_ACCESS_TOKEN,
      "WHATSAPP_ACCESS_TOKEN",
    ),

    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,

    aiEnabled: true,

    aiModel: process.env.WHATSAPP_AI_MODEL || "gpt-5.6-luna",

    allowAIOrderCreation: false,

    allowAICancellation: false,

    allowAIPaymentLinks: true,

    allowAIAppointmentBooking: false,

    enableHumanHandoff: true,
  };
}
