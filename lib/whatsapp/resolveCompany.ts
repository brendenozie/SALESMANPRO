// lib/whatsapp/resolveCompany.ts

import prisma from "@/server/db/prismadb";

export async function resolveCompanyFromWhatsApp(phoneNumberId: string) {
  /**
   * Recommended:
   *
   * WhatsAppSettings.phoneNumberId is unique per
   * connected business number.
   */

  const settings = await prisma.whatsAppSettings.findFirst({
    where: {
      phoneNumberId,
    },

    select: {
      companyId: true,

      company: {
        select: {
          id: true,

          name: true,
        },
      },
    },
  });

  if (!settings) {
    throw new Error(
      `No company configured for WhatsApp phone number ${phoneNumberId}`,
    );
  }

  return {
    companyId: settings.companyId,

    company: settings.company,
  };
}
