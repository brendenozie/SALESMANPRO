import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID required", 400);
  }

  const cacheKey = `admin:academicSession:${companyId}:all`;

  // Try cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return formatResponse(true, cached, "Fetched (cached)", 200);
    }
  } catch {}

  try {

    const academicYears = await prisma.academicYear.findMany({
      where: { companyId },
      include: {
        terms: {
          select: {
            id: true,
            name: true,
            termNumber: true,
            startDate: true,
            endDate: true,
            isActive: true
          },
          orderBy: {
            termNumber: "asc"
          }
        }
      },
      orderBy: {
        startDate: "desc"
      }
    });

    const activeYear = academicYears.find((y) => y.isActive);
    const activeTerm = activeYear?.terms.find((t) => t.isActive);

    const result = {
      activeAcademicYearId: activeYear?.id ?? null,
      activeTermId: activeTerm?.id ?? null,
      academicYears
    };

    try {
      await cacheSet(cacheKey, result, 120);
    } catch {}

    return formatResponse(true, result, "Academic session fetched", 200);

  } catch (error) {

    console.error(error);

    return formatResponse(
      false,
      null,
      "Failed to fetch academic sessions",
      500
    );
  }
}