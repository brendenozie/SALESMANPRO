import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, templateId, audienceSegment, customNumbers } = body;

    if (!companyId || !templateId) {
      return formatResponse(
        false,
        null,
        "Company ID and Template ID are required",
        400,
      );
    }

    const template = await prisma.whatsAppTemplate.findFirst({
      where: { id: templateId, companyId },
    });

    if (!template) {
      return formatResponse(
        false,
        null,
        "Template not found or does not belong to company",
        404,
      );
    }

    let targetPhoneNumbers: string[] = [];

    if (audienceSegment === "CUSTOM_LIST" && Array.isArray(customNumbers)) {
      targetPhoneNumbers = customNumbers.filter(
        (n: string) => n.trim().length > 0,
      );
    } else {
      const contacts = await prisma.whatsAppContact.findMany({
        where: { companyId, optedIn: true, blocked: false },
        select: { phoneNumber: true },
        take: 500,
      });
      targetPhoneNumbers = contacts.map((c) => c.phoneNumber);
    }

    const campaign = await prisma.whatsAppCampaign.create({
      data: {
        companyId,
        templateId,
        name: `Broadcast_${template.name}_${Date.now()}`,
        status: "RUNNING",
        totalRecipients: targetPhoneNumbers.length,
        audienceFilter: {
          segment: audienceSegment,
          numbersCount: targetPhoneNumbers.length,
        },
        startedAt: new Date(),
      },
    });

    return formatResponse(
      true,
      { campaignId: campaign.id, totalRecipients: targetPhoneNumbers.length },
      "Broadcast queued successfully",
      201,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to process broadcast dispatch",
      500,
    );
  }
}
