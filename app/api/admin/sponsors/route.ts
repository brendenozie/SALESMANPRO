import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/sponsors/route.ts
import prisma from '@/server/db/prismadb';
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET all sponsors
async function getSponsors(req: Request) {
  
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    const cacheKey = buildTenantCacheKey(companyId, "sponsors", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const sponsors = await prisma.sponsor.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

  try {
    if (sponsors) {
      await cacheSet(cacheKey, sponsors, 60);
    }
  } catch (e) {}

    return formatResponse(true, sponsors, 'Sponsors fetched successfully', 200);
  } catch (error: any) {
    console.error('Error fetching sponsors:', error);
    return formatResponse(false, null, 'Failed to fetch sponsors', 500);
  }
}

// POST a new sponsor
async function createSponsor(req: Request) {
  
  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, contactPhone, websiteUrl, logoUrl, status, companyId } = body;

    if (!companyName || !contactEmail || !websiteUrl || !companyId) {
      return formatResponse(false, null, 'Company Name, Contact Email, Website URL, and Company ID are required', 400);
    }

    const newSponsor = await prisma.sponsor.create({
      data: {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        websiteUrl,
        logoUrl,
        status,
        companyId,
      },
    });

    
    try {
      await cacheDel(`tenant:${companyId}:sponsors:*`);
      await cacheDel(`admin:sponsors:*`);
    } catch (e) {}
    return formatResponse(true, newSponsor, 'Sponsor created successfully', 201);
  } catch (error: any) {
    console.error('Error creating sponsor:', error);
    return formatResponse(false, null, 'Failed to create sponsor', 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(getSponsors);
export const POST = withApiHandler(createSponsor);
