import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/subjects
async function handleGET(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { courses: true }, // Count of courses under this subject
        },
      },
      orderBy: { name: "asc" },
    });

    const response = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      type: subject.type,
      coursesCount: subject._count.courses,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    }));

    return formatResponse(true, response);
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// POST /api/subjects
async function handlePOST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const body = await request.json();
    const { name, description, type } = body;

    if (!name) {
      return formatResponse(false, null, "Subject name is required.", 400);
    }

    const newSubject = await prisma.subject.create({
      data: { name, description, type },
    });

    return formatResponse(true, newSubject, "Subject created successfully.");
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
