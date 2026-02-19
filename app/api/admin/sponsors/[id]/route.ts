import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/sponsors/[id]/route.ts
import prisma from '@/server/db/prismadb';

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET a single sponsor by ID
async function getSponsor(req: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;

  const cacheKey = `admin:sponsors:${id || 'global'}:all`;

  try {
    
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });

  if (!sponsor) return formatResponse(false, null, 'Sponsor not found', 404);

  try {await cacheDel(cacheKey);} catch (e) {}
  
    return formatResponse(true, sponsor, 'Sponsor fetched successfully', 200);
  } catch (error: any) {
    console.error(`Error fetching sponsor with ID ${id}:`, error);
    return formatResponse(false, null, 'Failed to fetch sponsor', 500);
  }
}

// PUT (update) a sponsor by ID
async function updateSponsor(req: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;
  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, contactPhone, websiteUrl, logoUrl, status } = body;

    const updatedSponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        websiteUrl,
        logoUrl,
        status,
        updatedAt: new Date(),
      },
    });

    
    try { await cacheDel(`admin:sponsors:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedSponsor, 'Sponsor updated successfully', 200);
  } catch (error: any) {
    console.error(`Error updating sponsor with ID ${id}:`, error);
    return formatResponse(false, null, 'Failed to update sponsor', 500);
  }
}

// DELETE a sponsor by ID
async function deleteSponsor(req: Request, { params }: { params: { id: string } }) {

  const { id } = params;
  try {
    await prisma.sponsor.delete({ where: { id } });
    
    try { await cacheDel(`admin:sponsors:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, 'Sponsor deleted successfully', 204);
  } catch (error: any) {
    console.error(`Error deleting sponsor with ID ${id}:`, error);
    return formatResponse(false, null, 'Failed to delete sponsor', 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(getSponsor);
export const PUT = withApiHandler(updateSponsor);
export const DELETE = withApiHandler(deleteSponsor);
