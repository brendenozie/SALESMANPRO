// // app/api/teacher/courses/[courseId]/attendance-data/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { AttendanceStatus } from "@prisma/client";

async function getAttendanceData(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorUserId = searchParams.get('educatorId');
  const scheduleId = searchParams.get('scheduleId');
  const dateStr = searchParams.get('date');

  if (!courseId || !educatorUserId || !scheduleId || !dateStr) {
    return formatResponse(false, null, 'Missing required parameters', 400);
  }

  try {
    // 1. Get Educator Profile
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: { id: true, companyId: true }
    });
    if (!educator) return formatResponse(false, null, 'Educator not found', 404);

    // 2. Get Schedule details (This tells us WHICH classroom we are in)
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      select: {
        classroomId: true,
        academicLevelId: true,
        course: { select: { title: true } }
      }
    });

    if (!schedule || !schedule.classroomId) {
      return formatResponse(false, null, 'Schedule or Classroom not found', 404);
    }

    // 3. Get Students assigned to this CURRENT CLASSROOM
    // Based on StudentAcademicLevel model
    const classroomAssignments = await prisma.studentAcademicLevel.findMany({
      where: {
        classRoomId: schedule.classroomId,
        // Optional: Ensure they belong to the same company
        // student: { companyId: educator.companyId, user: { isNot: {} } } 
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, image: true } }
          }
        }
      },
      orderBy: { student: { user: { name: 'asc' } } }
    });

    // 4. Fetch existing records for this session
    const targetDate = new Date(dateStr);
    targetDate.setUTCHours(0, 0, 0, 0);

    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        classScheduleId: scheduleId,
        date: targetDate,
      },
      select: { studentId: true, status: true }
    });

    const attendanceMap = existingRecords.reduce((acc, curr) => {
      acc[curr.studentId] = curr.status;
      return acc;
    }, {} as Record<string, string>);

    // 5. Format response
    const students = classroomAssignments
      .filter(item => item.student !== null) // Safety check for orphaned records
      .map(item => ({
        id: item.student.id,
        name: item.student.user?.name || "Unknown",
        email: item.student.user?.email,
        image: item.student.profilePicture || item.student.user?.image,
      }));

      
    return formatResponse(true, {
      courseTitle: schedule.course.title,
      classroomId: schedule.classroomId,
      academicLevelId: schedule.academicLevelId,
      students,
      existingAttendance: attendanceMap
    }, 'Classroom attendance list loaded');

  } catch (error: any) {
    console.error(error);
    return formatResponse(false, null, error.message, 500);
  }
}

async function postAttendanceData(request: Request) {
  const body = await request.json();
  const { courseId, scheduleId, date, educatorId, attendance, classroomId, academicLevelId } = body;

  try {
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: { id: true, companyId: true }
    });

    if (!educator) return formatResponse(false, null, 'Unauthorized', 403);

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Transaction to update/create all records
    await prisma.$transaction(
      Object.entries(attendance as Record<string, AttendanceStatus>).map(([studentId, status]) => {
        return prisma.attendanceRecord.upsert({
          where: {
            // Using your schema's specific unique index
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
            classScheduleId: scheduleId // Ensure it's linked to the schedule
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

    return formatResponse(true, null, 'Attendance saved successfully');
  } catch (error: any) {
    return formatResponse(false, null, 'Failed to save attendance', 500);
  }
}

export const GET = withApiHandler(getAttendanceData, { requireAuth: true });
export const POST = withApiHandler(postAttendanceData, { requireAuth: true });

// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // Define AttendanceStatus to match your Prisma schema
// export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED';

// // Define types for API request/response
// export interface StudentAttendanceData {
//   studentId: string;
//   name: string;
//   email: string;
//   avatarUrl: string | null;
// }

// export interface CourseAttendanceInfo {
//   id: string;
//   title: string;
//   academicLevelId?: string;
//   academicLevelName?: string;
// }

// export interface AttendancePageDataAPI {
//   course: CourseAttendanceInfo;
//   students: StudentAttendanceData[];
//   existingAttendance: { [studentId: string]: AttendanceStatus };
// }

// // GET /api/teacher/courses/[courseId]/attendance-data
// async function getAttendanceData(request: Request, { params }: { params: { courseId: string } }) {
//   const { courseId } = params;
//   const { searchParams } = new URL(request.url);
//   const educatorUserId = searchParams.get('educatorId');
//   const dateStr = searchParams.get('date');

//   if (!courseId || !educatorUserId) {
//     return formatResponse(false, null, 'Missing courseId or educatorId', 400);
//   }

//   try {
//     const educatorProfile = await prisma.educator.findUnique({
//       where: { userId: educatorUserId },
//       select: { id: true, companyId: true },
//     });

//     if (!educatorProfile || !educatorProfile.companyId) {
//       return formatResponse(false, null, 'Educator not found or not authorized', 403);
//     }

//     const course = await prisma.course.findUnique({
//       where: { id: courseId, companyId: educatorProfile.companyId },
//       select: {
//         id: true,
//         title: true,
//         academicLevels: { select: { academicLevel: { select: { id: true, name: true } } } },
//       },
//     });

//     if (!course) {
//       return formatResponse(false, null, 'Course not found or not associated with this company', 404);
//     }

//     const primaryAcademicLevel = course.academicLevels[0]?.academicLevel;

//     const studentsInCourse = await prisma.courseEnrollment.findMany({
//       where: {
//         courseId,
//         student: { companyId: educatorProfile.companyId },
//       },
//       select: {
//         student: {
//           select: {
//             id: true,
//             profilePicture: true,
//             user: { select: { name: true, email: true, image: true } },
//           },
//         },
//       },
//       orderBy: { student: { user: { name: 'asc' } } },
//     });

//     const studentIdsInCourse = studentsInCourse.map(ce => ce.student.id);

//     let normalizedAttendanceDate: Date | undefined;
//     if (dateStr) {
//       const parsedDate = new Date(dateStr);
//       if (!isNaN(parsedDate.getTime())) normalizedAttendanceDate = new Date(parsedDate.setUTCHours(0, 0, 0, 0));
//     }

//     const existingAttendanceRecords: { [studentId: string]: AttendanceStatus } = {};
//     if (normalizedAttendanceDate) {
//       const records = await prisma.attendanceRecord.findMany({
//         where: {
//           studentId: { in: studentIdsInCourse },
//           courseId,
//           date: normalizedAttendanceDate,
//           companyId: educatorProfile.companyId,
//           classScheduleId: null,
//         },
//         select: { studentId: true, status: true, createdAt: true },
//         orderBy: { createdAt: 'desc' },
//       });
//       records.forEach(r => {
//         if (!existingAttendanceRecords[r.studentId]) {
//           existingAttendanceRecords[r.studentId] = r.status as AttendanceStatus;
//         }
//       });
//     }

//     const formattedStudents: StudentAttendanceData[] = studentsInCourse.map(ce => {
//       const student = ce.student;
//       return {
//         studentId: student.id,
//         name: student.user?.name || 'Unknown Student',
//         email: student.user?.email || 'N/A',
//         avatarUrl: student.profilePicture || student.user?.image || null,
//       };
//     });

//     return formatResponse(true, {
//       course: {
//         id: course.id,
//         title: course.title,
//         academicLevelId: primaryAcademicLevel?.id,
//         academicLevelName: primaryAcademicLevel?.name,
//       },
//       students: formattedStudents,
//       existingAttendance: existingAttendanceRecords,
//     }, 'Attendance data fetched successfully', 200);

//   } catch (error: any) {
//     console.error('Error fetching attendance data:', error);
//     return formatResponse(false, null, error.message || 'Failed to fetch attendance data', 500);
//   }
// }

// // POST /api/teacher/courses/[courseId]/attendance-data
// async function postAttendanceData(request: Request) {
//   const body = await request.json();
//   const { courseId, academicLevelId, attendanceDate, educatorId, companyId, attendance } = body;

//   if (!courseId || !academicLevelId || !attendanceDate || !educatorId || !companyId || !attendance) {
//     return formatResponse(false, null, 'Missing required attendance data', 400);
//   }

//   try {
//     const recordDate = new Date(attendanceDate);
//     recordDate.setUTCHours(0, 0, 0, 0);

//     const educatorProfile = await prisma.educator.findUnique({
//       where: { userId: educatorId },
//       select: { id: true, companyId: true },
//     });

//     if (!educatorProfile || educatorProfile.companyId !== companyId) {
//       return formatResponse(false, null, 'Educator not found or not authorized', 403);
//     }
//     const educatorDbId = educatorProfile.id;

//     const isAssignedToCourse = await prisma.courseEducatorAssignment.findFirst({
//       where: { educatorId: educatorDbId, courseId },
//     });
//     const isAssignedToAcademicLevel = await prisma.educatorAcademicLevelAssignment.findFirst({
//       where: { educatorId: educatorDbId, academicLevelId },
//     });

//     if (!isAssignedToCourse && !isAssignedToAcademicLevel) {
//       return formatResponse(false, null, 'Educator not assigned to this course/academic level', 403);
//     }

//     await prisma.$transaction(async (tx) => {
//       const ops: Promise<any>[] = [];
//       for (const [studentId, status] of Object.entries(attendance)) {
//         const existingRecord = await tx.attendanceRecord.findFirst({
//           where: { studentId, courseId, academicLevelId, date: recordDate, companyId, classScheduleId: null },
//         });

//         if (existingRecord) {
//           ops.push(tx.attendanceRecord.update({
//             where: { id: existingRecord.id },
//             data: { status: status as AttendanceStatus, recordedById: educatorDbId, updatedAt: new Date() },
//           }));
//         } else {
//           ops.push(tx.attendanceRecord.create({
//             data: { studentId, courseId, academicLevelId, date: recordDate, status: status as AttendanceStatus, recordedById: educatorDbId, companyId, classScheduleId: null },
//           }));
//         }
//       }
//       await Promise.all(ops);
//     });

//     return formatResponse(true, null, 'Attendance saved successfully', 200);

//   } catch (error: any) {
//     console.error('Error saving attendance:', error);
//     return formatResponse(false, null, error.message || 'Failed to save attendance', 500);
//   }
// }

// // Export handlers wrapped with withApiHandler
// export const GET = withApiHandler(getAttendanceData, { requireAuth: true });
// export const POST = withApiHandler(postAttendanceData, { requireAuth: true });
