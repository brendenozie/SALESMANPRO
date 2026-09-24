import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// ✅ GET all Exam Categories
const getExamCategories = async (_request: Request, _context: { user?: any }) => {
  const searchParams = new URL(_request.url).searchParams;
  const schoolId = searchParams.get("schoolId") || searchParams.get("companyId");

  if (!schoolId) {
    return NextResponse.json(
      { message: "Missing required query parameter: schoolId or companyId" },
      { status: 400 }
    );
  }

  const cacheKey = `admin:exam-categories:school:${schoolId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {
    // Silent catch for cache misses/errors
  }

  const categories = await prisma.examCategory.findMany({
    where: {
      companyId: schoolId,
    },
    include: {
      company: true, // Includes company details
      _count: {
        select: { exams: true }, // Returns count of related exams
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  try {
    await cacheSet(cacheKey, categories, 60);
  } catch (e) {}

  return NextResponse.json(categories, { status: 200 });
};

// ✅ POST a new Exam Category
const createExamCategory = async (request: Request, _context: { user?: any }) => {
  const body = await request.json();
  const { name, description, companyId: cId, schoolId } = body;
  const companyId = cId || schoolId;

  // Basic validation
  if (!name || !companyId) {
    return NextResponse.json(
      { message: "Missing required fields: name and companyId are mandatory." },
      { status: 400 }
    );
  }

  try {
    // Check if category already exists for this company (Handling @@unique constraint)
    const existingCategory = await prisma.examCategory.findUnique({
      where: {
        companyId_name: {
          companyId,
          name,
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "An exam category with this name already exists for this school/company." },
        { status: 409 }
      );
    }

    const newCategory = await prisma.examCategory.create({
      data: {
        name,
        description,
        companyId,
      },
    });

    // Invalidate relevant caches
    try {
      await cacheDel(`admin:exam-categories:school:${companyId}`);
    } catch (e) {}

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
};

// ✅ Export wrapped handlers
export const GET = withApiHandler(getExamCategories, { requireAuth: true, requireRateLimit: true });
export const POST = withApiHandler(createExamCategory, { requireAuth: true, requireRateLimit: true });