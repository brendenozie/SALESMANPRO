import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const GET = withApiHandler(
  async (req, context) => {
    const { searchParams } = new URL(req.url);
    const companyId = context.companyId;
    const academicYearId = searchParams.get("academicYearId");

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const cacheKey = buildTenantCacheKey(companyId, "academic-terms", {
      academicYearId: academicYearId || "all",
    });

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        const response = formatResponse(true, cached, "Fetched (Cached)", 200);
        response.headers.set(
          "Cache-Control",
          "private, s-maxage=60, stale-while-revalidate=120",
        );
        return response;
      }
    } catch (e) {}

    const terms = await prisma.term.findMany({
      where: {
        companyId,
        ...(academicYearId ? { academicYearId } : {}),
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        termNumber: true,
        isActive: true,
        academicYearId: true,
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    try {
      await cacheSet(cacheKey, terms, 60);
    } catch (e) {}

    const response = formatResponse(true, terms, "Fetched terms", 200);
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120",
    );
    return response;
  },
  { requireAuth: true, requireTenant: true },
);

export const POST = withApiHandler(
  async (req, context) => {
    const body = await req.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    let { name, startDate, endDate, termNumber, academicYearId } = body;

    if (!name || !startDate || !endDate) {
      return formatResponse(
        false,
        null,
        "Missing required payload fields: name, startDate, endDate",
        400,
      );
    }

    if (!academicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { companyId, isActive: true },
        select: { id: true },
      }) || await prisma.academicYear.findFirst({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (activeYear) {
        academicYearId = activeYear.id;
      } else {
        const currentYear = new Date().getFullYear();
        const createdYear = await prisma.academicYear.create({
          data: {
            name: `Academic Year ${currentYear}/${currentYear + 1}`,
            yearStart: new Date(`${currentYear}-01-01`),
            yearEnd: new Date(`${currentYear}-12-31`),
            companyId,
            isActive: true,
          },
        });
        academicYearId = createdYear.id;
      }
    }

    // Tenant boundary: verify academic year belongs to this company
    const academicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, companyId },
      select: { id: true },
    });

    if (!academicYear) {
      return formatResponse(
        false,
        null,
        "Specified academic year does not exist in this company",
        404,
      );
    }

    const effectiveTermNumber = termNumber ? parseInt(String(termNumber), 10) : 1;

    const newTerm = await prisma.term.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        termNumber: effectiveTermNumber,
        academicYearId,
        companyId,
        isActive: false,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:academic-terms:*`);
    } catch (e) {}

    return formatResponse(true, newTerm, "Term created successfully", 201);
  },
  { requireAuth: true, requireTenant: true },
);
