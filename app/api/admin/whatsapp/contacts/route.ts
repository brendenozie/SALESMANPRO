import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

export async function GET(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const whereCondition = {
      companyId: auth.companyId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { phoneNumber: { contains: query } },
              { waId: { contains: query } },
            ],
          }
        : {}),
    };

    const [contacts, total] = await Promise.all([
      prisma.whatsAppContact.findMany({
        where: whereCondition,
        orderBy: { lastMessageAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.whatsAppContact.count({ where: whereCondition }),
    ]);

    return formatResponse(
      true,
      {
        contacts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Contacts retrieved successfully",
      200,
    );
  } catch (error) {
    return unauthorizedResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const body = await req.json();
    const phoneNumber = normalizePhoneNumber(body.phoneNumber);
    const name = body.name;

    if (!phoneNumber) {
      return formatResponse(false, null, "Phone Number is required", 400);
    }

    const account = await prisma.whatsAppAccount.findFirst({
      where: { companyId: auth.companyId, isActive: true },
    });

    const contact = await prisma.whatsAppContact.upsert({
      where: {
        companyId_waId: {
          companyId: auth.companyId,
          waId: phoneNumber,
        },
      },
      update: {
        name: name || undefined,
        phoneNumber,
      },
      create: {
        companyId: auth.companyId,
        accountId: account?.id,
        waId: phoneNumber,
        phoneNumber,
        name: name || "",
        optedIn: true,
      },
    });

    return formatResponse(true, contact, "Contact created or updated successfully", 201);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
