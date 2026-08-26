import prisma from "@/server/db/prismadb";

export async function resolveCompanyFromWhatsApp(phoneNumberId: string) {
  /**
   * WhatsAppAccount.phoneNumberId is a unique field mapped to Company.
   */
  const account = await prisma.whatsAppAccount.findUnique({
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

  if (!account || !account.companyId || !account.company) {
    throw new Error(
      `No company configured for WhatsApp phone number ${phoneNumberId}`,
    );
  }

  return {
    companyId: account.companyId,
    company: account.company,
  };
}
