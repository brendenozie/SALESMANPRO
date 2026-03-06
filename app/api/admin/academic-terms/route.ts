import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  const academicYearId = searchParams.get("academicYearId");

  if (!companyId)
    return formatResponse(false, null, "Company ID is required", 400);

  const cacheKey = `admin:terms:${companyId}:${academicYearId || "all"}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const terms = await prisma.term.findMany({
      where: {
        companyId,
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: {
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

    const response = NextResponse.json(terms);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    return response;
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch terms", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      startDate,
      endDate,
      academicYearId,
      companyId,
      termNumber,
    } = body;

    const term = await prisma.term.create({
      data: {
        name,
        termNumber,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        academicYearId,
        companyId,
      },
    });

    await cacheDel(`admin:terms:${companyId}:${academicYearId}`);

    return formatResponse(true, term, "Term created", 201);
  } catch (error) {
    return formatResponse(false, null, "Failed to create term", 500);
  }
}