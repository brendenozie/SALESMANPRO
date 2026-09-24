import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { InquiryStatus } from "@prisma/client";

// Helper to resolve companyId if passed as slug
async function resolveCompanyId(idOrSlug: string): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    return idOrSlug;
  }
  const comp = await prisma.company.findFirst({
    where: { slug: idOrSlug },
    select: { id: true },
  });
  return comp?.id || idOrSlug;
}

// --- GET Handler ---
async function handleGetInquiries(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCompanyId = searchParams.get("companyId");

  if (!rawCompanyId) {
    throw new Error("Company ID is required to fetch inquiries.");
  }

  const companyId = await resolveCompanyId(rawCompanyId);
  const cacheKey = buildTenantCacheKey(companyId, "inquiries", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const inquiries = await prisma.inquiry.findMany({
    where: {
      companyId: companyId,
    },
    include: {
      consumer: true,
      assignedToAgent: true,
    },
    orderBy: {
      receivedAt: "desc",
    },
  });

  try {
    if (inquiries) {
      await cacheSet(cacheKey, { results: inquiries }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { results: inquiries }, "Inquiries fetched successfully", 200);
}

// --- POST Handler ---
async function handlePostInquiry(request: Request) {
  const body = await request.json();
  const {
    consumerId,
    companyId: rawCompanyId,
    clientName,
    clientEmail,
    clientPhone,
    message,
    propertyId,
    propertyName,
    status,
    assignedToAgentId,
    assignedToAgentName,
  } = body;

  // Basic validation
  if (!rawCompanyId || !clientName || !clientEmail || !message) {
    return formatResponse(false, null, "Missing required fields (companyId, clientName, clientEmail, message).", 400);
  }

  const companyId = await resolveCompanyId(rawCompanyId);

  // Validate status if provided
  const validStatuses: InquiryStatus[] = ["New", "Read", "Responded", "Archived"] as InquiryStatus[];
  if (status && !validStatuses.includes(status)) {
    return formatResponse(false, null, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  const newInquiry = await prisma.inquiry.create({
    data: {
      companyId,
      ...(consumerId && { consumerId }),
      clientName,
      clientEmail,
      clientPhone,
      message,
      propertyId,
      propertyName,
      status: status || "New",
      assignedToAgentId,
      assignedToAgentName,
    },
  });

  try {
    await cacheDel(`tenant:${companyId}:inquiries:*`);
    await cacheDel(`admin:inquiries:*`);
  } catch (e) {}

  return formatResponse(true, newInquiry, "Inquiry created successfully", 201);
}

export const GET = withApiHandler(handleGetInquiries);
export const POST = withApiHandler(handlePostInquiry, { requireAuth: false });
