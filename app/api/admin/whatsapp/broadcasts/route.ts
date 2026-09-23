import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";

export async function POST(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const companyId = auth.companyId;
    const body = await req.json();
    const { templateId, audienceSegment, customNumbers } = body;

    if (!templateId) {
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
        (n: string) => typeof n === "string" && n.trim().length > 0,
      );
    } else if (audienceSegment === "ALL_PARENTS") {
      const parents = await prisma.parent.findMany({
        where: { companyId },
        select: { phone: true, user: { select: { phone: true } } },
      });
      targetPhoneNumbers = parents
        .map((p) => p.phone || p.user?.phone)
        .filter((phone): phone is string => Boolean(phone && phone.trim()));
    } else if (audienceSegment === "FEE_DEFAULTERS") {
      const records = await prisma.studentFeeRecord.findMany({
        where: {
          student: { companyId },
          paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] },
        },
        include: {
          student: {
            include: {
              parent: { select: { phone: true, user: { select: { phone: true } } } },
            },
          },
        },
      });
      const numbers = new Set<string>();
      for (const rec of records) {
        const pPhone = rec.student?.parent?.phone || rec.student?.parent?.user?.phone;
        if (pPhone && pPhone.trim()) {
          numbers.add(pPhone.trim());
        }
      }
      targetPhoneNumbers = Array.from(numbers);
    } else if (audienceSegment === "TEACHERS_STAFF") {
      const staffUsers = await prisma.user.findMany({
        where: {
          companyId,
          role: { in: ["EDUCATOR", "HEADTEACHER", "STAFF", "STAFF_MEMBER"] },
        },
        select: { phone: true },
      });
      targetPhoneNumbers = staffUsers
        .map((u) => u.phone)
        .filter((phone): phone is string => Boolean(phone && phone.trim()));
    } else {
      // Default to general WhatsApp contacts
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
      `Broadcast successfully queued for ${targetPhoneNumbers.length} recipients`,
      201,
    );
  } catch (error: any) {
    console.error("[WHATSAPP_BROADCAST_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to process broadcast dispatch",
      500,
    );
  }
}
