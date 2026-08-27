
// //enrolled students route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { AttendanceStatus } from "@prisma/client";

async function getAttendanceData(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorUserId = searchParams.get('educatorId');
  const scheduleId = searchParams.get('scheduleId');
  // const dateStr = searchParams.get('date');
  // || !dateStr

  if (!courseId || !educatorUserId || !scheduleId ) {
    return formatResponse(false, null, 'Missing required parameters', 400);
  }

  try {
    // 1. Verify Educator
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: { id: true }
    });
    if (!educator) return formatResponse(false, null, 'Educator not found', 404);

    // 2. Get Schedule & Classroom context
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      select: {
        classroomId: true,
        academicLevelId: true,
        course: { select: { title: true } }
      }
    });

    if (!schedule || !schedule.classroomId) {
      return formatResponse(false, null, 'Schedule or Classroom assignment not found', 404);
    }

    // 3. Fetch Students from the specific Classroom/Level Junction
    const classroomAssignments = await prisma.studentAcademicLevel.findMany({
      where: {
        classRoomId: schedule.classroomId,
        // academicLevelId: schedule.academicLevelId
      },
      include: {
        student: {
          include: {
            user: { select: { image: true, email: true } }
          }
        }
      },
      orderBy: { student: { lastName: 'asc' } } // Standard roster sorting
    });

    // 4. Fetch existing records for this specific day
    // const targetDate = new Date(dateStr);
    // targetDate.setUTCHours(0, 0, 0, 0);

    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        classScheduleId: scheduleId,
        // date: targetDate,
      },
      select: { studentId: true, status: true }
    });

    const attendanceMap = existingRecords.reduce((acc, curr) => {
      acc[curr.studentId] = curr.status;
      return acc;
    }, {} as Record<string, string>);

    // 5. Map to UI-friendly Roster
    const students = classroomAssignments
      .filter(item => item.student !== null)
      .map(item => ({
        id: item.student.id,
        // Prioritize Student model names over User model names for academic accuracy
        name: `${item.student.firstName} ${item.student.lastName}`,
        admissionNumber: item.student.admissionNumber,
        email: item.student.contactEmail || item.student.user?.email,
        image: item.student.profilePicture || item.student.user?.image,
        levelStatus: item.levelStatus || item.student.academicLevel
      }));

    return formatResponse(true, {
      courseTitle: schedule.course.title,
      classroomId: schedule.classroomId,
      academicLevelId: schedule.academicLevelId,
      students,
      existingAttendance: attendanceMap
    }, 'Student roster and attendance loaded');

  } catch (error: any) {
    console.error("[ATTENDANCE_GET_ERROR]", error);
    return formatResponse(false, null, error.message, 500);
  }
}

async function postAttendanceData(request: Request) {
  try {
    const body = await request.json();
    const { courseId, scheduleId, date, educatorId, attendance, classroomId, academicLevelId } = body;

    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: { id: true, companyId: true }
    });

    if (!educator) return formatResponse(false, null, 'Unauthorized', 403);

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Perform bulk upsert via transaction
    await prisma.$transaction(
      Object.entries(attendance as Record<string, AttendanceStatus>).map(([studentId, status]) => {
        return prisma.attendanceRecord.upsert({
          where: {
            // This must match your schema's @@unique constraint exactly
            academicLevelId_classroomId_studentId_date: {
              academicLevelId,
              classroomId,
              studentId,
              date: targetDate
            }
          },
          update: {
            status,
            recordedById: educator.id,
            classScheduleId: scheduleId
          },
          create: {
            studentId,
            courseId,
            classScheduleId: scheduleId,
            academicLevelId,
            classroomId,
            date: targetDate,
            status,
            recordedById: educator.id,
            companyId: educator.companyId
          }
        });
      })
    );

    return formatResponse(true, null, 'Attendance records synchronized');
  } catch (error: any) {
    console.error("[ATTENDANCE_POST_ERROR]", error);
    return formatResponse(false, null, 'Failed to save roster attendance', 500);
  }
}

export const GET = withApiHandler(getAttendanceData, { requireAuth: true });
export const POST = withApiHandler(postAttendanceData, { requireAuth: true });

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { verifyAuth } from "@/lib/verifyAuth";

// export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
//   const auth = await verifyAuth(request);
//   if (!auth.success) return formatResponse(false, null, auth.error, 401);
//   const { courseId } = params;

//   if (!courseId) {
//     return formatResponse(false, null, "Missing courseId", 400);
//   }

//   try {
//     // Fetch enrolled students for the course
//     const enrollments = await prisma.courseEnrollment.findMany({
//       where: { courseId },
//       select: {
//         student: {
//           select: {
//             id: true,
//             user: {
//               select: {
//                 name: true,
//                 email: true,
//                 image: true,
//               },
//             },
//             profilePicture: true,
//           },
//         },
//       },
//       orderBy: { student: { user: { name: "asc" } } },
//     });
//     const enrolledStudents = enrollments.map(enrollment => ({
//       studentId: enrollment.student.id,
//       name: enrollment.student.user?.name || "Unknown",
//       email: enrollment.student.user?.email || "N/A",
//       avatarUrl: enrollment.student.profilePicture || enrollment.student.user?.image || null,
//     }));
//     return formatResponse(true, { students: enrolledStudents }, null, 200);
//   } catch (error) {
//     console.error("Error fetching enrolled students:", error);
//     return formatResponse(false, null, "Internal server error", 500);
//   };
// });