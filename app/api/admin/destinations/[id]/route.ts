import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextRequest } from 'next/server';
import prisma from "@/server/db/prismadb";
import { verifyAuth } from '@/lib/verifyAuth';
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// =======================================================================
// GET: Fetch a single destination by ID
// =======================================================================
async function getDestination(req: Request, { params }: Params) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  
    const cacheKey = buildTenantCacheKey(id, "destinations", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const destination = await prisma.destination.findUnique({
    where: { id },
  });


  if (!destination) {
    return formatResponse(false, null, 'Destination not found', 404);
  }

  
  try {
    if (destination) {
      await cacheSet(cacheKey, { data: destination }, 60);
    }
  } catch (e) {}
  
  return formatResponse(true, { data: destination }, null, 200);
}

// =======================================================================
// PATCH: Update an existing destination by ID
// =======================================================================
async function updateDestination(req: Request, { params }: Params) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await req.json();

  const updatedDestination = await prisma.destination.update({
    where: { id },
    data: body,
  });

  
    try {
      await cacheDel(`tenant:${id}:destinations:*`);
      await cacheDel(`admin:destinations:*`);
    } catch (e) {}
    return formatResponse(true, { data: updatedDestination }, null, 200);
}

// =======================================================================
// DELETE: Delete a destination by ID
// =======================================================================
async function deleteDestination(req: Request, { params }: Params) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  await prisma.destination.delete({
    where: { id },
  });

  
    try {
      await cacheDel(`tenant:${id}:destinations:*`);
      await cacheDel(`admin:destinations:*`);
    } catch (e) {}
    return formatResponse(true, { message: "Destination deleted successfully" }, null, 200);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDestination);
export const PATCH = withApiHandler(updateDestination);
export const DELETE = withApiHandler(deleteDestination);
