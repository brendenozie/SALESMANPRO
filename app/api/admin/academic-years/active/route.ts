import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID required", 400);
  }

  const cacheKey = `admin:academicSession:${companyId}:active`;

  // Try cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return formatResponse(true, cached, "Active session fetched (cached)", 200);
    }
  } catch {}

  try {
    const activeYear = await prisma.academicYear.findFirst({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        terms: {
          where: { isActive: true },
          take: 1,
          orderBy: { termNumber: "asc" },
        },
      },
    });

    if (!activeYear) {
      return formatResponse(false, null, "No active academic year", 404);
    }

    const activeTerm = activeYear.terms[0] ?? null;

    const result = {
      academicYear: {
        id: activeYear.id,
        name: activeYear.name,
        startDate: activeYear.startDate,
        endDate: activeYear.endDate,
      },
      term: activeTerm
        ? {
            id: activeTerm.id,
            name: activeTerm.name,
            termNumber: activeTerm.termNumber,
            startDate: activeTerm.startDate,
            endDate: activeTerm.endDate,
          }
        : null,
    };

    try {
      await cacheSet(cacheKey, result, 60);
    } catch {}

    return formatResponse(true, result, "Active session fetched", 200);
  } catch (error) {
    console.error(error);
    return formatResponse(false, null, "Failed to fetch active session", 500);
  }
}