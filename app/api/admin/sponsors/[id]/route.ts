import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET a single sponsor by ID
async function getSponsor(req: Request, context: any) {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Sponsor ID is required", 400);

  const cacheKey = buildTenantCacheKey(id, "sponsors", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const sponsor = await prisma.sponsor.findUnique({ where: { id } });

    if (!sponsor) return formatResponse(false, null, "Sponsor not found", 404);

    try {
      await cacheSet(cacheKey, sponsor, 60);
    } catch (e) {}

    return formatResponse(true, sponsor, "Sponsor fetched successfully", 200);
  } catch (error: any) {
    console.error(`Error fetching sponsor with ID ${id}:`, error);
    return formatResponse(false, null, "Failed to fetch sponsor", 500);
  }
}

// PUT (update) a sponsor by ID
async function updateSponsor(req: Request, context: any) {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Sponsor ID is required", 400);

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

    try {
      if (updatedSponsor.companyId) {
        await cacheDel(`tenant:${updatedSponsor.companyId}:sponsors:*`);
      }
      await cacheDel(`admin:sponsors:*`);
      await cacheDel(`tenant:${id}:sponsors:*`);
    } catch (e) {}
    return formatResponse(true, updatedSponsor, "Sponsor updated successfully", 200);
  } catch (error: any) {
    console.error(`Error updating sponsor with ID ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to update sponsor", 500);
  }
}

// DELETE a sponsor by ID
async function deleteSponsor(req: Request, context: any) {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Sponsor ID is required", 400);

  try {
    const existing = await prisma.sponsor.findUnique({
      where: { id },
      select: { companyId: true },
    });

    await prisma.sponsor.delete({
      where: { id },
    });

    try {
      if (existing?.companyId) {
        await cacheDel(`tenant:${existing.companyId}:sponsors:*`);
      }
      await cacheDel(`admin:sponsors:*`);
      await cacheDel(`tenant:${id}:sponsors:*`);
    } catch (e) {}
    return formatResponse(true, null, "Sponsor deleted successfully", 200);
  } catch (error: any) {
    console.error(`Error deleting sponsor with ID ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to delete sponsor", 500);
  }
}

export const GET = withApiHandler(getSponsor);
export const PUT = withApiHandler(updateSponsor);
export const DELETE = withApiHandler(deleteSponsor);
