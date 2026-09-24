import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { AssetTrackingAction } from "@prisma/client";

// =======================================================================
// GET /api/admin/asset-tracking?assetId=...&companyId=...
// =======================================================================
async function handleGetAssetTracking(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");
  const companyId = searchParams.get("companyId");

  const whereClause: any = {};
  if (assetId) {
    whereClause.assetId = assetId;
  }
  if (companyId) {
    whereClause.asset = { companyId };
  }

  const logs = await prisma.assetTracking.findMany({
    where: whereClause,
    include: {
      asset: true,
      performer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
  });

  return formatResponse(true, logs, "Asset tracking logs retrieved successfully", 200);
}

// =======================================================================
// POST /api/admin/asset-tracking
// =======================================================================
async function handlePostAssetTracking(request: Request) {
  const body = await request.json();
  const { assetId, action = "ASSIGNED", performedBy, date, notes } = body;

  if (!assetId) {
    return formatResponse(false, null, "assetId is required", 400);
  }

  const log = await prisma.assetTracking.create({
    data: {
      assetId,
      action: (action as AssetTrackingAction) || AssetTrackingAction.ASSIGNED,
      performedBy: performedBy || null,
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
    },
    include: { asset: true, performer: true },
  });

  return formatResponse(true, log, "Asset tracking entry recorded successfully", 201);
}

export const GET = withApiHandler(handleGetAssetTracking);
export const POST = withApiHandler(handlePostAssetTracking);
