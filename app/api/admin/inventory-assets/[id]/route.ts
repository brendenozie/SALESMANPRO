import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { AssetCategory, AssetStatus } from "@prisma/client";

// =======================================================================
// GET /api/admin/inventory-assets/:id
// =======================================================================
async function handleGetAsset(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { tracking: true },
  });

  if (!asset) {
    return formatResponse(false, null, "Asset not found", 404);
  }

  return formatResponse(true, asset, "Asset retrieved successfully", 200);
}

// =======================================================================
// PUT /api/admin/inventory-assets/:id
// =======================================================================
async function handlePutAsset(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.asset.findUnique({
    where: { id },
  });

  if (!existing) {
    return formatResponse(false, null, "Asset not found", 404);
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.category && { category: body.category as AssetCategory }),
      ...(body.purchaseDate && { purchaseDate: new Date(body.purchaseDate) }),
      ...(body.purchaseValue !== undefined && { purchaseValue: parseFloat(body.purchaseValue) }),
      ...(body.currentValue !== undefined && { currentValue: parseFloat(body.currentValue) }),
      ...(body.status && { status: body.status as AssetStatus }),
      ...(body.serialNumber !== undefined && { serialNumber: body.serialNumber }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    include: { tracking: true },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:assets:*`);
    await cacheDel(`admin:assets:*`);
  } catch (e) {}

  return formatResponse(true, updated, "Asset updated successfully", 200);
}

// =======================================================================
// DELETE /api/admin/inventory-assets/:id
// =======================================================================
async function handleDeleteAsset(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.asset.findUnique({
    where: { id },
  });

  if (!existing) {
    return formatResponse(false, null, "Asset not found", 404);
  }

  // Delete tracking history first
  await prisma.assetTracking.deleteMany({
    where: { assetId: id },
  }).catch(() => {});

  await prisma.asset.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:assets:*`);
    await cacheDel(`admin:assets:*`);
  } catch (e) {}

  return formatResponse(true, null, "Asset deleted successfully", 200);
}

export const GET = withApiHandler(handleGetAsset);
export const PUT = withApiHandler(handlePutAsset);
export const DELETE = withApiHandler(handleDeleteAsset);
