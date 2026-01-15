// app/api/teacher/academic-levels/[academicLevelId]/students/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getStudents(req: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");
  const classId = searchParams.get("classId");

  // 1. Validate ObjectID lengths (Prevents "Malformed ObjectID" 500 crash)
  if (!academicLevelId || academicLevelId.length !== 24 || !teacherId || teacherId.length !== 24) {
    return formatResponse(false, {}, "Invalid ID format. IDs must be 24 characters.", 400);
  }

  try {
    // 2. Derive companyId from educator
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      // FIX: Changed null to {} to avoid the "payload must be object" error
      return formatResponse(false, {}, "Educator not found or not associated with a company", 404);
    }

    const companyId = educator.companyId;

    // 3. PREVENT CRASH: Fetch Mapping records separately 
    // We don't use 'include' here because if a student was deleted, Prisma will crash.
    const studentMappings = await prisma.studentAcademicLevel.findMany({
      where: {
        academicLevelId,
        // Using classroomId (lowercase 'r') to match your DB sample
        ...(classId && classId.length === 24 ? {  classRoomId: classId } : {}),
      },
      select: { studentId: true },
    });

    const studentIds = studentMappings.map((m) => m.studentId);

    // 4. Fetch the actual Student records
    // This effectively filters out any orphaned records automatically
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        companyId: companyId,
      },
      select: {
        id: true,
        parentId: true,
        user: { select: { name: true, email: true } },
        parent: { select: { user: { select: { name: true, email: true } } } },
      },
      orderBy: {
        user: { name: "asc" },
      },
    });

    // 5. Map the final response
    const studentOptions = students.map((s) => ({
      id: s.id,
      name: s.user?.name || "N/A",
      email: s.user?.email || "N/A",
      parentId: s.parentId,
      parentName: s.parent?.user?.name || null,
      parentEmail: s.parent?.user?.email || null,
    }));

    return formatResponse(true, studentOptions, "Students fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching students for academic level:", error);
    // FIX: Passing {} instead of null to prevent payload error
    return formatResponse(false, {}, error.message || "Internal Server Error", 500);
  }
}

export const GET = withApiHandler(getStudents, { requireAuth: true });