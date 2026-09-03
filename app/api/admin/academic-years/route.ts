import { cacheGet, cacheSet, cacheDel, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(false, null, "Company ID is required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "academic_years", {});


  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const academicYears = await prisma.academicYear.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
        terms: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            termNumber: true,
            isActive: true,
          },
          orderBy: { termNumber: "asc" },
        },
      },
      orderBy: { startDate: "desc" },
    });

    try {
      await cacheSet(cacheKey, academicYears, 60);
    } catch (e) {}

    return formatResponse(true, academicYears, "Fetched academic years", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch academic years", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, companyId } = body;

    if (!companyId || !name || !startDate || !endDate) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
        isActive: false,
      },
    });

    // Evacuate list and overall dynamic session layouts
    try {
      await cacheDel(`tenant:${companyId}:academic_years:*`);
      await cacheDel(`tenant:${companyId}:academic_session:*`);
      await cacheDel(`tenant:${companyId}:academicYears:*`);
      await cacheDel(`admin:academicYears:*`);
      await cacheDel(`tenant:${companyId}:academicSession:*`);
      await cacheDel(`admin:academicSession:*`);
    } catch (e) {}


    return formatResponse(true, academicYear, "Academic Year created", 201);
  } catch (error) {
    return formatResponse(false, null, "Failed to create academic year", 500);
  }
}
