import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { Prisma } from "@prisma/client";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID required", 400);
  }

  const cacheKey = `admin:academic-levels:${companyId}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const response = formatResponse(true, cached, "Fetched (Cached)", 200);
      response.headers.set(
        "Cache-Control",
        "private, s-maxage=30, stale-while-revalidate=15",
      );
      return response;
    }
  } catch (e) {
    // Log error internally if needed, don't crash
  }

  const academicLevels = await prisma.academicLevel.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  try {
    if (academicLevels?.length) {
      await cacheSet(cacheKey, academicLevels, 60);
    }
  } catch (e) {}

  const response = formatResponse(true, academicLevels, "Fetched", 200);
  response.headers.set(
    "Cache-Control",
    "private, s-maxage=30, stale-while-revalidate=15",
  );

  return response;
});

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { name, description, sortOrder, companyId } = body;

  if (!name || !companyId) {
    return formatResponse(false, null, "Required fields missing", 400);
  }

  try {
    const newAcademicLevel = await prisma.academicLevel.create({
      data: {
        name,
        description,
        sortOrder: sortOrder ?? 0,
        companyId,
      },
    });

    // Explicitly invalidate the list cache
    try {
      await cacheDel(`admin:academic-levels:${companyId}:all`);
    } catch (e) {}

    return formatResponse(true, newAcademicLevel, "Created", 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return formatResponse(
        false,
        null,
        "Level name already exists for this company",
        409,
      );
    }
    throw error;
  }
});
