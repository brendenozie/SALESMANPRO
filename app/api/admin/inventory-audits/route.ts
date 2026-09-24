import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { InventoryAuditStatus } from "@prisma/client";

// =======================================================================
// GET /api/admin/inventory-audits?companyId=...
// =======================================================================
async function handleGetAudits(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const audits = await prisma.inventoryAudit.findMany({
    where: { companyId },
    include: { conductor: { select: { id: true, name: true, email: true } } },
    orderBy: { auditDate: "desc" },
  });

  return formatResponse(true, audits, "Inventory audits retrieved successfully", 200);
}

// =======================================================================
// POST /api/admin/inventory-audits
// =======================================================================
async function handlePostAudit(request: Request) {
  const body = await request.json();
  const { companyId, conductedBy, auditDate, status = "SCHEDULED", findings, notes } = body;

  if (!companyId || !conductedBy) {
    return formatResponse(false, null, "companyId and conductedBy are required", 400);
  }

  const audit = await prisma.inventoryAudit.create({
    data: {
      companyId,
      conductedBy,
      auditDate: auditDate ? new Date(auditDate) : new Date(),
      status: (status as InventoryAuditStatus) || InventoryAuditStatus.SCHEDULED,
      findings: findings || null,
      notes: notes || null,
    },
    include: { conductor: { select: { id: true, name: true, email: true } } },
  });

  try {
    await cacheDel(`tenant:${companyId}:audits:*`);
    await cacheDel(`admin:audits:*`);
  } catch (e) {}

  return formatResponse(true, audit, "Inventory audit scheduled successfully", 201);
}

export const GET = withApiHandler(handleGetAudits);
export const POST = withApiHandler(handlePostAudit);
