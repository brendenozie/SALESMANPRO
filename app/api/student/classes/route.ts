import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("studentId");

  if (!userId) {
    return formatResponse(false, null, "Missing studentId", 400);
  }

  try {
    // 1. Get the Student and their active Grade/Room
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        companyId: true,
        user: { select: { name: true } },
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
      return formatResponse(false, null, "No academic level assigned", 404);
    }

    const { academicLevelId, classRoomId, } = activeLevel;

    // 2. Fetch all Courses linked to this Academic Level (e.g., Grade 3)
    // We filter by AcademicLevel because that's the "Parent" of the Classroom
    // ... inside the try block of your GET handler

    // 1. Fetch courses with nested schedules filtered by the student's classroom
    const courses = await prisma.course.findMany({
      where: {
        companyId: student.companyId,
        academicLevels: {
          some: { academicLevelId: academicLevelId }
        }
      },
      include: {
        CourseEducatorAssignment: {
          where: { classRoomId: classRoomId },
          // include: { educator: { include: { user: { select: { name: true } } } } },
          take: 1
        },
        // FETCH THE SCHEDULES HERE
        classSchedules: {
          where: { classroomId: classRoomId },
          include: {
            educator: { include: { user: { select: { name: true } } } },
            // classroom: { select: { name: true } }
          },
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" }
          ],
          take: 1
        },
        assignments: {
          where: {
            // startTime: { gte: new Date() },
            // endTime: { gte: new Date() },
            // dueDate: { gte: new Date() },
            OR: [{ classroomId: classRoomId }, { classroomId: null }, { status: "Upcoming" }, { status: "Published" }]
          },
          orderBy: { startTime: "asc" }
        },
        grades: {
          where: { studentId: student.id },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    // 2. Transform the data and format the schedule string
    const studentEnrolledClasses = courses.map((course) => {
      const assignment = course.CourseEducatorAssignment[0];
      const recentGrade = course.grades[0];
      
      // Format the schedule array into a readable string: "Mon 08:00, Wed 10:00"
      const formattedSchedule = course.classSchedules.length > 0
        ? course.classSchedules.map(s => {
            const time = new Date(s.startTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            });
            return `${s.dayOfWeek.slice(0, 3)} ${time}`;
          }).join(", ")
        : "No schedule set";

      return {
        id: course.id,
        name: course.title,
        teacher: course.classSchedules[0]?.educator?.user?.name || "TBA",
        schedule: formattedSchedule, 
        room: activeLevel.classRoom?.name || "General",
        currentGrade: recentGrade ? `${recentGrade.gradeValue}%` : "N/A",
        upcomingAssignmentsCount: course.assignments.length,
        nextAssignmentDue: course.assignments[0] 
          ? course.assignments[0].endTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
          : "None"
      };
    });

    // const courses = await prisma.course.findMany({
    //   where: {
    //     companyId: student.companyId,
    //     academicLevels: {
    //       some: { academicLevelId: academicLevelId }
    //     }
    //   },
    //   include: {
    //     // Fetch the specific teacher for THIS student's classroom
    //     CourseEducatorAssignment: {
    //       where: { classRoomId: classRoomId },
    //       include: { educator: { include: { user: { select: { name: true } } } } },
    //       take: 1
    //     },
    //     // Fetch upcoming assignments from the CourseAssignment model
    //     assignments: {
    //       where: {
    //         status: "Published",
    //         dueDate: { gte: new Date() },
    //         OR: [
    //           { classroomId: classRoomId },
    //           { classroomId: null } // General assignments for the whole grade
    //         ]
    //       },
    //       orderBy: { dueDate: "asc" }
    //     },
    //     // Fetch Grades for this specific student in this course
    //     grades: {
    //       where: { studentId: student.id },
    //       orderBy: { createdAt: "desc" },
    //       take: 1
    //     }
    //   }
    // });

    // // 3. Transform for Frontend
    // const studentEnrolledClasses = courses.map((course) => {
    //   const assignment = course.CourseEducatorAssignment[0];
    //   const recentGrade = course.grades[0];
      
    //   // Calculate schedule (Look into Course's classSchedules)
    //   // For this example, we assume schedules are linked to the classroom
    //   const nextAssignment = course.assignments[0];

    //   return {
    //     id: course.id,
    //     name: course.title,
    //     teacher: assignment?.educator?.user?.name || "TBA",
    //     schedule: "View Schedule", // You can expand this with classSchedules query
    //     room: activeLevel.classRoom?.name || "General",
    //     currentGrade: recentGrade ? `${recentGrade.gradeValue}%` : "N/A",
    //     upcomingAssignmentsCount: course.assignments.length,
    //     nextAssignmentDue: nextAssignment 
    //       ? nextAssignment.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    //       : "None"
    //   };
    // });

    return formatResponse(true, {
      studentName: student.user.name,
      studentGradeLevel: `${activeLevel.classRoom?.name || ""} (${activeLevel.academicLevel?.name})`.trim(),
      enrolledClasses: studentEnrolledClasses,
    });

  } catch (error) {
    console.error("Fetch Classes Error:", error);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

export const GET = withApiHandler(getHandler);