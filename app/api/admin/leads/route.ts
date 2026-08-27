import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch leads with optional filtering, search, and pagination
 */
async function getLeads(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const stage = searchParams.get("stage");
  const search = searchParams.get("search")?.trim();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  // Construct a deterministic cache key based on query parameters
  const cacheKey = `admin:leads:${companyId}:${stage || "all"}:${search || "none"}:p${page}:l${limit}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return formatResponse(true, cached, "Fetched from cache", 200);
    }
  } catch (e) {
    // Cache failures shouldn't block database fallback
  }

  // Build dynamic Prisma query filter
  const whereClause: any = { companyId };

  if (stage && stage !== "all") {
    whereClause.stage = stage;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [leads, totalCount] = await Promise.all([
    prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.lead.count({ where: whereClause }),
  ]);

  const payload = {
    leads,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };

  try {
    await cacheSet(cacheKey, payload, 60); // Cache for 60 seconds
  } catch (e) {}

  return formatResponse(true, payload, "Leads fetched successfully", 200);
}

/**
 * POST: Create or update lead details dynamically
 */
async function createLead(req: Request) {
  const body = await req.json();
  const {
    phone,
    companyId,
    name,
    email,
    businessType,
    stage,
    createdAt,
    firstName,
    lastName,
  } = body;

  // 1. Strict Validation
  if (!phone || !companyId) {
    return formatResponse(
      false,
      null,
      "Phone number and Company ID are required",
      400,
    );
  }

  // 2. Sanitize Phone Number (remove spaces, hyphens, keep valid digits/plus)
  const sanitizedPhone = phone.trim().replace(/[^\d+]/g, "");

  // 3. Resolve Name formatting
  const resolvedName = (name || `${firstName || ""} ${lastName || ""}`).trim();

  // 4. Parse creation date gracefully
  let leadDate = new Date();
  if (createdAt) {
    const parsedDate = createdAt?.$date ? createdAt.$date : createdAt;
    const dateObj = new Date(parsedDate);
    if (!isNaN(dateObj.getTime())) {
      leadDate = dateObj;
    }
  }

  // 5. Construct fields for dynamic update on existing leads
  const updateData: Record<string, any> = {};
  if (resolvedName) updateData.name = resolvedName;
  if (email) updateData.email = email.toLowerCase().trim();
  if (businessType) updateData.businessType = businessType;
  if (stage) updateData.stage = stage;

  // 6. Execute Upsert
  const lead = await prisma.lead.upsert({
    where: { phone: sanitizedPhone },
    update: updateData, // Updates existing lead with any newly provided non-empty fields
    create: {
      phone: sanitizedPhone,
      name: resolvedName || null,
      email: email ? email.toLowerCase().trim() : null,
      businessType: businessType || null,
      stage: stage || "cold",
      companyId,
      createdAt: leadDate,
    },
  });

  // 7. Clear all lead cache keys for this company
  try {
    await cacheDel(`admin:leads:${companyId}:*`);
  } catch (e) {}

  return formatResponse(true, lead, "Lead saved successfully", 201);
}

export const GET = withApiHandler(getLeads);
export const POST = withApiHandler(createLead);
