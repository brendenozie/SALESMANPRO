// app/api/class-teacher-academic-levels/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getClassTeacherAcademicLevels(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId"); // User.id linked to Educator

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

    // 2. Fetch AcademicLevel assignments for this Educator
    const academicLevelAssignments = await prisma.educatorAcademicLevelAssignment.findMany({
      where: { educatorId: educator.id },
      include: {
        academicLevel: {
          include: {
            StudentAcademicLevel: {
              include: {
                student: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                    parent: { include: { user: { select: { email: true } } } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { academicLevel: { sortOrder: "asc" } },
    });

    const assignedAcademicLevels = academicLevelAssignments.map((assignment) => {
      const academicLevel = assignment.academicLevel;

      const studentsInLevel = academicLevel.StudentAcademicLevel.map((sal) => {
        const student = sal.student;
        return {
          studentId: student.id,
          name: student.user?.name || "N/A",
          email: student.user?.email || "N/A",
          parentEmail: student.parent?.user?.email || null,
        };
      });

      // Mock events/announcements (replace with DB queries if needed)
      const mockAcademicLevelEvents = [
        { id: `ALE-${academicLevel.id}-001`, name: `Parent-Teacher Meeting for ${academicLevel.name}`, date: new Date('2025-08-01T15:00:00Z').toISOString(), time: '3:00 PM' },
        { id: `ALE-${academicLevel.id}-002`, name: `Field Trip to Museum for ${academicLevel.name}`, date: new Date('2025-09-10T09:00:00Z').toISOString(), time: '9:00 AM' },
      ];
      const mockAcademicLevelAnnouncements = [
        { id: `ALA-${academicLevel.id}-001`, text: `Reminder: ${academicLevel.name} project deadline is next Friday.`, type: 'info' as const },
        { id: `ALA-${academicLevel.id}-002`, text: `Urgent: ${academicLevel.name} class photo rescheduled.`, type: 'warning' as const },
      ];

      return {
        id: academicLevel.id,
        name: academicLevel.name,
        description: academicLevel.description,
        roleInLevel: assignment.roleInLevel,
        studentsCount: studentsInLevel.length,
        students: studentsInLevel,
        academicLevelEvents: mockAcademicLevelEvents,
        academicLevelAnnouncements: mockAcademicLevelAnnouncements,
      };
    });

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
    return formatResponse(false, null, error.message, 500);
  }
}

export const GET = withApiHandler(getClassTeacherAcademicLevels, { requireAuth: true });
