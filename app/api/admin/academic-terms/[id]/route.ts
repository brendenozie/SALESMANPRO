import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const PATCH = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const termId = context.params?.id;

    if (!termId) {
      return formatResponse(false, null, "Term ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    // Verify existing record belongs to authorized tenant
    const existing = await prisma.term.findFirst({
      where: { id: termId, companyId },
      select: { id: true, academicYearId: true },
    });

    if (!existing) {
      return formatResponse(
        false,
        null,
        "Term not found in this company",
        404,
      );
    }

    const updatedTerm = await prisma.term.update({
      where: { id: termId },
      data: {
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        termNumber: body.termNumber
          ? parseInt(String(body.termNumber), 10)
          : undefined,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:academic-terms:*`);
    } catch (e) {}

    return formatResponse(true, updatedTerm, "Term updated successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

/**
 * PUT: Safely activate one single term per year and auto-deactivate previous choices
 */
export const PUT = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const termId = context.params?.id;

    if (!termId) {
      return formatResponse(false, null, "Term ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const body = await req.json().catch(() => null);
    const academicYearId = body?.academicYearId;

    if (!academicYearId) {
      return formatResponse(
        false,
        null,
        "academicYearId is required to activate a term",
        400,
      );
    }

    const existing = await prisma.term.findFirst({
      where: { id: termId, companyId, academicYearId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(
        false,
        null,
        "Term not found for the specified academic year in this company",
        404,
      );
    }

    const activatedTerm = await prisma.$transaction(async (tx) => {
      // 1. Deactivate other active items matching context bounds
      await tx.term.updateMany({
        where: { academicYearId, companyId, isActive: true },
        data: { isActive: false },
      });

      // 2. Safely perform target update
      return tx.term.update({
        where: { id: termId },
        data: { isActive: true },
      });
    });

    try {
      await cacheDel(`tenant:${companyId}:academic-terms:*`);
    } catch (e) {}

    return formatResponse(true, activatedTerm, "Term activated safely", 200);
  },
  { requireAuth: true, requireTenant: true },
);

export const DELETE = withApiHandler(
  async (_req, context) => {
    const companyId = context.companyId;
    const termId = context.params?.id;

    if (!termId) {
      return formatResponse(false, null, "Term ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const existing = await prisma.term.findFirst({
      where: { id: termId, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(
        false,
        null,
        "Term not found in this company",
        404,
      );
    }

    const term = await prisma.term.delete({
      where: { id: termId },
    });

    try {
      await cacheDel(`tenant:${companyId}:academic-terms:*`);
    } catch (e) {}

    return formatResponse(true, term, "Term purged successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);
