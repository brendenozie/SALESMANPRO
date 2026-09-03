import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const academicYearId = searchParams.get("academicYearId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  // Consistent key matching pattern
  const cacheKey = `admin:terms:${companyId}:${academicYearId || "all"}`;

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

  try {
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
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch terms", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, termNumber, academicYearId, companyId } =
      body;

    if (
      !name ||
      !startDate ||
      !endDate ||
      !termNumber ||
      !academicYearId ||
      !companyId
    ) {
      return formatResponse(
        false,
        null,
        "Missing required payload fields",
        400,
      );
    }

    const newTerm = await prisma.term.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        termNumber: parseInt(termNumber),
        academicYearId,
        companyId,
        isActive: false,
      },
    });

    // EVACUATE BOTH CACHE POSSIBILITIES
    try {
      await cacheDel(`tenant:${companyId}:terms:*`);
      await cacheDel(`admin:terms:*`);
      await cacheDel(`admin:terms:${companyId}:${academicYearId}`);
    } catch (e) {}

    return formatResponse(true, newTerm, "Term created successfully", 201);
  } catch (error) {
    return formatResponse(false, null, "Failed to create term", 500);
  }
}
