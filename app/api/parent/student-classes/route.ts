import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId"); // This is the Student.userId or Student.id

  if (!studentId) {
    return formatResponse(false, null, "Missing studentId", 400);
  }

  try {
    // 1. Get the Student and their most recent Academic Level/Room assignment
    const student = await prisma.student.findFirst({
      where: { 
        OR: [
          { id: studentId },
          { userId: studentId }
        ]
      },
      select: {
        id: true,
        companyId: true,
        firstName: true,
        lastName: true,
        StudentAcademicLevel: {
          orderBy: { assignedAt: "desc" },
          take: 1,
          select: {
            academicLevelId: true,
            classRoomId: true,
            academicLevel: { select: { name: true } },
            classRoom: { select: { name: true } }
          }
        }
      }
    });

    const activeLevel = student?.StudentAcademicLevel[0];

    if (!student || !activeLevel || !student.companyId) {
      return formatResponse(false, null, "Student or active academic level not found", 404);
    }

    const { academicLevelId, classRoomId } = activeLevel;

    // 2. Fetch Courses mapped to this Academic Level
    const courses = await prisma.course.findMany({
      where: {
        companyId: student.companyId,
        academicLevels: {
          some: { academicLevelId: academicLevelId }
        }
      },
      include: {
        // Fetch the specific schedule for this child's classroom
        classSchedules: {
          where: { classroomId: classRoomId },
          include: {
            educator: { include: { user: { select: { name: true } } } },
          },
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" }
          ]
        },
        // Fetch upcoming tasks specific to this class or the whole grade
        assignments: {
          where: {
            status: "Published",
            dueDate: { gte: new Date() },
            OR: [
              { classroomId: classRoomId },
              { classroomId: null }
            ]
          },
          orderBy: { dueDate: "asc" }
        },
        // Fetch the latest grade for this specific student in this course
        grades: {
          where: { studentId: student.id },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    // 3. Transform the data for the UI
    const studentEnrolledClasses = courses.map((course) => {
      const recentGrade = course.grades[0];
      
      // Format Schedule: "Mon 08:00 AM, Wed 10:00 AM"
      const formattedSchedule = course.classSchedules.length > 0
        ? course.classSchedules.map(s => {
            const time = new Date(s.startTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            });
            return `${s.dayOfWeek.slice(0, 3)} ${time}`;
          }).join(", ")
        : "TBA";

      // Identify the primary teacher from the schedule
      const teacherName = course.classSchedules[0]?.educator?.user?.name || "TBA";

      return {
        id: course.id,
        name: course.title,
        teacher: teacherName,
        schedule: formattedSchedule, 
        room: activeLevel.classRoom?.name || "General",
        currentGrade: recentGrade ? `${recentGrade.gradeValue}%` : "N/A",
        upcomingAssignmentsCount: course.assignments.length,
        nextAssignmentDue: course.assignments[0] 
          ? new Date(course.assignments[0].dueDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) 
          : "None"
      };
    });

    return formatResponse(true, {
      studentName: `${student.firstName} ${student.lastName}`,
      studentGradeLevel: `${activeLevel.academicLevel?.name} - ${activeLevel.classRoom?.name || ""}`.trim(),
      enrolledClasses: studentEnrolledClasses,
    });

  } catch (error) {
    console.error("Fetch Student Classes API Error:", error);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

export const GET = withApiHandler(getHandler);