import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function getLeads(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }
    
  
    const cacheKey = `admin:leads:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const leads = await prisma.lead.findMany({
    where: {
      companyId: companyId,
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    if (leads) {
      await cacheSet(cacheKey, leads, 60);
    }
  } catch (e) {}

  return formatResponse(true, leads, "Leads fetched", 200);
}

async function createLead(req: Request) {
  const { phone,
    companyId,
    name,
    email,
    createdAt,
    firstName,
    lastName
   } = await req.json();

  const lead = await prisma.lead.upsert({
    where: { phone },
    update: {},
    create: { 
      phone,
          name: name || `${firstName || ""} ${lastName || ""}`.trim(),
          email: email || null,
          createdAt: createdAt?.$date
            ? new Date(createdAt.$date)
            : new Date(),
          stage: "cold",
          companyId,
     },
  });

  
    try { await cacheDel(`admin:leads:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, lead, "Lead saved", 201);
}

export const GET = withApiHandler(getLeads);
export const POST = withApiHandler(createLead);
