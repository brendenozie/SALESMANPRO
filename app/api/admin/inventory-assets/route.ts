import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { AssetCategory, AssetStatus } from "@prisma/client";

// =======================================================================
// GET /api/admin/inventory-assets?companyId=...
// =======================================================================
async function handleGetAssets(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const assets = await prisma.asset.findMany({
    where: { companyId },
    include: { tracking: true },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, assets, "Assets retrieved successfully", 200);
}

// =======================================================================
// POST /api/admin/inventory-assets
// =======================================================================
async function handlePostAsset(request: Request) {
  const body = await request.json();
  const {
    companyId,
    name,
    category = "EQUIPMENT",
    purchaseDate,
    purchaseValue,
    currentValue,
    status = "ACTIVE",
    serialNumber,
    location,
    notes,
  } = body;

  if (!companyId || !name || purchaseValue === undefined) {
    return formatResponse(false, null, "companyId, name, and purchaseValue are required", 400);
  }

  const asset = await prisma.asset.create({
    data: {
      companyId,
      name,
      category: (category as AssetCategory) || AssetCategory.EQUIPMENT,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      purchaseValue: parseFloat(purchaseValue),
      currentValue: currentValue !== undefined ? parseFloat(currentValue) : parseFloat(purchaseValue),
      status: (status as AssetStatus) || AssetStatus.ACTIVE,
      serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      location: location || "Main Facility",
      notes: notes || null,
    },
    include: { tracking: true },
  });

  try {
    await cacheDel(`tenant:${companyId}:assets:*`);
    await cacheDel(`admin:assets:*`);
  } catch (e) {}

  return formatResponse(true, asset, "Asset registered successfully", 201);
}

export const GET = withApiHandler(handleGetAssets);
export const POST = withApiHandler(handlePostAsset);
