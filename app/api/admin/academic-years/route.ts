import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(false, null, "Company ID is required", 400);

  const cacheKey = `admin:academicYears:${companyId}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const academicYears = await prisma.academicYear.findMany({
      where: { companyId },
      include: {
        terms: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    try {
      await cacheSet(cacheKey, academicYears, 60);
    } catch (e) {}

    // const response = NextResponse.json(academicYears);
    // response.headers.set(
    //   "Cache-Control",
    //   "public, s-maxage=60, stale-while-revalidate=120"
    // );

    return formatResponse(true, academicYears, "Fetched academic years", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch academic years", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, startDate, endDate, companyId } = body;

    if (!companyId)
      return formatResponse(false, null, "Company ID required", 400);

    if (!name || !startDate || !endDate)
      return formatResponse(false, null, "Missing fields", 400);

    const academicYear = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
      },
    });

    await cacheDel(`admin:academicYears:${companyId}:all`);

    return formatResponse(true, academicYear, "Academic Year created", 201);
  } catch (error) {
    // console.error("Academic Year Error:", error);
    return formatResponse(false, null, "Failed to create academic year", 500);
  }
}
