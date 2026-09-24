import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { InventoryAuditStatus } from "@prisma/client";

// =======================================================================
// GET /api/admin/inventory-audits/:id
// =======================================================================
async function handleGetAudit(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const audit = await prisma.inventoryAudit.findUnique({
    where: { id },
    include: { conductor: { select: { id: true, name: true, email: true } } },
  });

  if (!audit) {
    return formatResponse(false, null, "Inventory audit not found", 404);
  }

  return formatResponse(true, audit, "Inventory audit retrieved successfully", 200);
}

// =======================================================================
// PUT /api/admin/inventory-audits/:id
// =======================================================================
async function handlePutAudit(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.inventoryAudit.findUnique({
    where: { id },
  });

  if (!existing) {
    return formatResponse(false, null, "Inventory audit not found", 404);
  }

  const updated = await prisma.inventoryAudit.update({
    where: { id },
    data: {
      ...(body.auditDate && { auditDate: new Date(body.auditDate) }),
      ...(body.status && { status: body.status as InventoryAuditStatus }),
      ...(body.findings !== undefined && { findings: body.findings }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    include: { conductor: { select: { id: true, name: true, email: true } } },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:audits:*`);
    await cacheDel(`admin:audits:*`);
  } catch (e) {}

  return formatResponse(true, updated, "Inventory audit updated successfully", 200);
}

// =======================================================================
// DELETE /api/admin/inventory-audits/:id
// =======================================================================
async function handleDeleteAudit(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.inventoryAudit.findUnique({
    where: { id },
  });

  if (!existing) {
    return formatResponse(false, null, "Inventory audit not found", 404);
  }

  await prisma.inventoryAudit.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:audits:*`);
    await cacheDel(`admin:audits:*`);
  } catch (e) {}

  return formatResponse(true, null, "Inventory audit deleted successfully", 200);
}

export const GET = withApiHandler(handleGetAudit);
export const PUT = withApiHandler(handlePutAudit);
export const DELETE = withApiHandler(handleDeleteAudit);
