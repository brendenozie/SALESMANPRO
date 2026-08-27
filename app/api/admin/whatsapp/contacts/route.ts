import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is missing", 400);
  }

  const cacheKey = `admin:whatsapp:contacts:${companyId}:${query}:${page}:${limit}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const response = formatResponse(
        true,
        cached,
        "Fetched contacts (Cached)",
        200,
      );
      response.headers.set(
        "Cache-Control",
        "private, s-maxage=30, stale-while-revalidate=60",
      );
      return response;
    }
  } catch (e) {}

  try {
    const whereCondition = {
      companyId,
      OR: query
        ? [
            { name: { contains: query, mode: "insensitive" as const } },
            { phoneNumber: { contains: query } },
          ]
        : undefined,
    };

    const [contacts, total] = await Promise.all([
      prisma.whatsAppContact.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.whatsAppContact.count({ where: whereCondition }),
    ]);

    const payload = {
      contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    try {
      await cacheSet(cacheKey, payload, 60);
    } catch (e) {}

    const response = formatResponse(
      true,
      payload,
      "Contacts retrieved successfully",
      200,
    );
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=30, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to fetch WhatsApp contacts",
      500,
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, phoneNumber, name, tags, metadata } = body;

    if (!companyId || !phoneNumber) {
      return formatResponse(
        false,
        null,
        "Company ID and Phone Number are required",
        400,
      );
    }

    const contact = await prisma.whatsAppContact.upsert({
      where: {
        companyId_phoneNumber: {
          companyId,
          phoneNumber,
        },
      },
      update: {
        name: name || undefined,
        tags: tags || undefined,
        metadata: metadata || undefined,
      },
      create: {
        companyId,
        phoneNumber,
        name: name || "",
        tags: tags || [],
        metadata: metadata || {},
        optedIn: true,
      },
    });

    try {
      await cacheDel(`admin:whatsapp:contacts:${companyId}:*`);
    } catch (e) {}

    return formatResponse(
      true,
      contact,
      "Contact created or updated successfully",
      201,
    );
  } catch (error) {
    return formatResponse(false, null, "Failed to save contact", 500);
  }
}
