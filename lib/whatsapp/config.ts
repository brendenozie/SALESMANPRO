import prisma from "@/server/db/prismadb";
import { encrypt } from "@/lib/crypto";
import { decryptWhatsAppAccessToken } from "./credentials";

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
        where: { companyId, isActive: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
    ]);

    if (settings && account) {
      const accessToken = decryptWhatsAppAccessToken(account);
      if (!accessToken) {
        throw new Error("WhatsApp access token is not configured for this company");
      }

      return {
        enabled: settings.enabled,
        phoneNumberId: required(account.phoneNumberId, "WhatsApp phoneNumberId"),
        accessToken,
        businessAccountId:
          account.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        aiEnabled: settings.autoReply,
        aiModel: settings.model || process.env.WHATSAPP_AI_MODEL,
        aiSystemPrompt: settings.systemPrompt ?? undefined,
        allowAIOrderCreation: settings.canCreateOrders,
        allowAICancellation: settings.canCancelOrders,
        allowAIPaymentLinks: settings.canCheckPayments,
        allowAIAppointmentBooking: settings.canCreateAppointments,
        enableHumanHandoff: settings.humanHandoff,
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
    aiModel: process.env.WHATSAPP_AI_MODEL,
    allowAIOrderCreation: false,
    allowAICancellation: false,
    allowAIPaymentLinks: true,
    allowAIAppointmentBooking: false,
    enableHumanHandoff: true,
  };
}

export function encryptSecret(plain: string) {
  return encrypt(plain);
}
