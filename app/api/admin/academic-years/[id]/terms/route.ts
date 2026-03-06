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

    // const response = NextResponse.json(terms);
    // response.headers.set(
    //   "Cache-Control",
    //   "public, s-maxage=60, stale-while-revalidate=120"
    // );

    return formatResponse(true, terms, "Fetched terms", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch terms", 500);
  }
}

// POST: Create a new term
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, termNumber, academicYearId, companyId } = body;

    const newTerm = await prisma.term.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        termNumber: parseInt(termNumber),
        academicYearId,
        companyId,
        isActive: false, // Default to false on creation
      },
    });

    return formatResponse(true, newTerm, "Term created", 201);
  } catch (error) {
    return formatResponse(false, null, "Failed to create term", 500);
  }
}
