import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const type = searchParams.get("type"); // optional modifier filter flag: 'active' | 'all'

  if (!companyId)
    return formatResponse(false, null, "Company ID required", 400);

  const isOnlyActiveQuery = type === "active";
  const cacheKey = `admin:academicSession:${companyId}:${isOnlyActiveQuery ? "active" : "all"}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (cached)", 200);
  } catch {}

  try {
    if (isOnlyActiveQuery) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { companyId, isActive: true },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          terms: {
            where: { isActive: true },
            take: 1,
            select: {
              id: true,
              name: true,
              termNumber: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      });

      if (!activeYear)
        return formatResponse(false, null, "No active year assigned", 404);

      const result = {
        academicYear: { id: activeYear.id, name: activeYear.name },
        term: activeYear.terms[0] ?? null,
      };

      await cacheSet(cacheKey, result, 120);
      return formatResponse(
        true,
        result,
        "Active context configurations set",
        200,
      );
    }

    // Default 'all' logic fallback pathway processing
    const academicYears = await prisma.academicYear.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        isActive: true,
        terms: {
          select: { id: true, name: true, termNumber: true, isActive: true },
          orderBy: { termNumber: "asc" },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const activeYear = academicYears.find((y) => y.isActive);
    const result = {
      activeAcademicYearId: activeYear?.id ?? null,
      activeTermId: activeYear?.terms.find((t) => t.isActive)?.id ?? null,
      academicYears,
    };

    await cacheSet(cacheKey, result, 120);
    return formatResponse(true, result, "Academic sessions fetched", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed payload parsing lookup", 500);
  }
}
