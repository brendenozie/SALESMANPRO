// lib/whatsapp/config.ts

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
    const settings = await prisma.whatsAppSettings.findUnique({
      where: {
        companyId,
      },
    });

    if (settings) {
      const accessToken =
        settings.accessTokenEncrypted || process.env.WHATSAPP_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error(
          "WhatsApp access token is not configured for this company",
        );
      }

      return {
        enabled: settings.enabled,
        phoneNumberId: required(
          settings.phoneNumberId ?? undefined,
          "WhatsApp phoneNumberId",
        ),
        accessToken,
        businessAccountId: settings.businessAccountId ?? undefined,

        aiEnabled: settings.aiEnabled,

        aiModel:
          settings.aiModel || process.env.WHATSAPP_AI_MODEL || "gpt-5.6-luna",

        aiSystemPrompt: settings.aiSystemPrompt ?? undefined,

        allowAIOrderCreation: settings.allowAIOrderCreation,

        allowAICancellation: settings.allowAICancellation,

        allowAIPaymentLinks: settings.allowAIPaymentLinks,

        allowAIAppointmentBooking: settings.allowAIAppointmentBooking,

        enableHumanHandoff: settings.enableHumanHandoff,
      };
    }
  }

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

    allowAIOrderCreation: true,

    allowAICancellation: false,

    allowAIPaymentLinks: true,

    allowAIAppointmentBooking: true,

    enableHumanHandoff: true,
  };
}
