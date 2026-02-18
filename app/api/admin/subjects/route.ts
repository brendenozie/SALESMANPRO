import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/subjects
async function handleGET(request: Request) {
  


  try {
    // 
    const cacheKey = `admin:subjects:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const subjects = await prisma.subject.findMany({
    //   include: {
    //     _count: {
    //       select: { courses: true }, // Count of courses under this subject
    //     },
    //   },
    //   orderBy: { name: "asc" },
    // });

  try {
    if (subjects) {
      await cacheSet(cacheKey, subjects, 60);
    }
  } catch (e) {}

    // const response = subjects.map(subject => ({
    //   id: subject.id,
    //   name: subject.name,
    //   description: subject.description,
    //   type: subject.type,
    //   coursesCount: subject._count.courses,
    //   createdAt: subject.createdAt,
    //   updatedAt: subject.updatedAt,
    // }));

    return formatResponse(true, {response: "subjects"}, "Subjects fetched successfully.");
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// POST /api/subjects
async function handlePOST(request: Request) {
  


  try {
    const body = await request.json();
    const { name, description, type } = body;

    if (!name) {
      return formatResponse(false, null, "Subject name is required.", 400);
    }

    // const newSubject = await prisma.subject.create({
    //   data: { name, description, type },
    // });

    
    try { await cacheDel(`admin:subjects:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {newSubject:""}, "Subject created successfully.");
  } catch (error: any) {
    console.error("Error creating subject:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return formatResponse(false, null, "A subject with this name already exists.", 409);
    }

    return formatResponse(false, null, error.message, 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
