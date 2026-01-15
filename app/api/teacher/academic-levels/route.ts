// app/api/class-teacher-academic-levels/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getClassTeacherAcademicLevelsv1(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return formatResponse(false, null, "Teacher User ID is required", 400);
  }

  try {
    // 1. Fetch Educator profile
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!educator) {
      return formatResponse(false, null, "Teacher not found", 404);
    }

    // 2. Fetch AcademicLevel assignments 
    // REMOVED the deep include here because you fetch students inside the loop anyway.
    // This prevents the "Inconsistent query result" crash during the initial fetch.
    const academicLevelAssignments = await prisma.educatorAcademicLevelAssignment.findMany({
      where: { educatorId: educator.id },
      include: {
        academicLevel: true,
        classRoom: true,
      },
      orderBy: { academicLevel: { sortOrder: "asc" } },
    });

    // 3. Use Promise.all to resolve the async map
    const assignedAcademicLevels = await Promise.all(
      academicLevelAssignments.map(async (assignment) => {
        const academicLevel = assignment.academicLevel;

        // Fetch students for this specific level/classroom
        const students = await prisma.studentAcademicLevel.findMany({
          where: {
            academicLevelId: assignment.academicLevelId,
            ...(assignment.classRoomId && { classRoomId: assignment.classRoomId }),
            // This filter helps skip orphaned records that cause the crash
            studentId: { not: "" } 
          },
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
                parent: { include: { user: { select: { email: true } } } },
              },
            },
          },
        });

        return {
          id: academicLevel.id,
          name: academicLevel.name,
          description: academicLevel.description,
          classroom: assignment.classRoom
            ? { id: assignment.classRoom.id, name: assignment.classRoom.name }
            : null,
          roleInLevel: assignment.roleInLevel,
          studentsCount: students.length,
          students: students
            .filter(sal => sal.student) // Extra safety check
            .map((sal) => ({
              studentId: sal.student.id,
              name: sal.student.user?.name ?? "N/A",
              email: sal.student.user?.email ?? "N/A",
              parentEmail: sal.student.parent?.user?.email ?? null,
            })),
          academicLevelEvents: [],
          academicLevelAnnouncements: [],
        };
      })
    );

    const responseData = {
      classTeacherInfo: {
        id: educator.user?.id,
        name: educator.user?.name || "N/A",
        email: educator.user?.email || "N/A",
        role: educator.user?.role || "EDUCATOR",
      },
      themeSettings: {
        primaryColor: "#4A90E2",
        accentColor: "#F5A623",
      },
      assignedAcademicLevels, // Now a resolved array
    };

    return formatResponse(true, responseData, "Class teacher academic levels fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching class teacher academic levels:", error);
    // Ensure we send a string message to avoid the "payload must be object" error
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}
// app/api/class-teacher-academic-levels/route.ts

async function getClassTeacherAcademicLevels(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    // FIX: Changed null to {} to avoid the payload TypeError
    return formatResponse(false, {}, "Teacher User ID is required", 400);
  }

  try {
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!educator) {
      return formatResponse(false, {}, "Teacher not found", 404);
    }

    const academicLevelAssignments = await prisma.educatorAcademicLevelAssignment.findMany({
      where: { educatorId: educator.id },
      include: {
        academicLevel: true,
        classRoom: true,
      },
      orderBy: { academicLevel: { sortOrder: "asc" } },
    });

    const assignedAcademicLevels = await Promise.all(
      academicLevelAssignments.map(async (assignment) => {
        const academicLevel = assignment.academicLevel;

        // 1. Fetch only the mapping records (No include here to prevent the crash)
        const salRecords = await prisma.studentAcademicLevel.findMany({
          where: {
            academicLevelId: assignment.academicLevelId,
            ...(assignment.classRoomId && { classRoomId: assignment.classRoomId }),
          },
          select: { studentId: true },
        });

        // 2. Extract IDs and filter out any nulls/undefined manually
        const validStudentIds = salRecords
          .map((rec) => rec.studentId)
          .filter((id): id is string => Boolean(id) && id.length === 24);

        // 3. Fetch the actual student data using the valid IDs
        const studentsData = await prisma.student.findMany({
          where: {
            id: { in: validStudentIds },
          },
          include: {
            user: { select: { name: true, email: true } },
            parent: { include: { user: { select: { email: true } } } },
          },
        });

        return {
          id: academicLevel.id,
          name: academicLevel.name,
          description: academicLevel.description,
          classroom: assignment.classRoom
            ? { id: assignment.classRoom.id, name: assignment.classRoom.name }
            : null,
          roleInLevel: assignment.roleInLevel,
          studentsCount: studentsData.length,
          students: studentsData.map((s) => ({
            studentId: s.id,
            name: s.user?.name ?? "N/A",
            email: s.user?.email ?? "N/A",
            parentEmail: s.parent?.user?.email ?? null,
          })),
          academicLevelEvents: [],
          academicLevelAnnouncements: [],
        };
      })
    );

    const responseData = {
      classTeacherInfo: {
        id: educator.user?.id,
        name: educator.user?.name || "N/A",
        email: educator.user?.email || "N/A",
        role: educator.user?.role || "EDUCATOR",
      },
      themeSettings: {
        primaryColor: "#4A90E2",
        accentColor: "#F5A623",
      },
      assignedAcademicLevels,
    };

    return formatResponse(true, responseData, "Class teacher academic levels fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching class teacher academic levels:", error);
    // FIX: Passing an empty object {} instead of null to prevent the payload error
    return formatResponse(false, {}, error.message || "Internal Server Error", 500);
  }
}
export const GET = withApiHandler(getClassTeacherAcademicLevels, { requireAuth: false });