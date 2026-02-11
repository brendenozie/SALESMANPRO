// // app/api/class-schedules/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

const VALID_DAYS = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

// Shared Selection to keep code DRY and responses consistent
const SCHEDULE_SELECT = {
  id: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  topic: true,
  meetingLink: true,
  academicLevel: { select: { id: true, name: true } },
  course: { select: { id: true, title: true, code: true } },
  classroom: { select: { id: true, name: true, academicLevelId: true } },
  educator: { select: { id: true, user: { select: { name: true, email: true } } } },
};

// --- GET: Single Schedule
const getClassSchedule = async (_req: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  const schedule = await prisma.classSchedule.findUnique({
    where: { id, companyId }, // Security: Scoped to company
    select: SCHEDULE_SELECT,
  });

  if (!schedule) return formatResponse(false, null, "Schedule not found", 404);

  return formatResponse(true, schedule, null, 200);
};

// --- PATCH: Update Schedule
const updateClassSchedule = async (req: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;
  const body = await req.json();

  if (body.dayOfWeek && !VALID_DAYS.has(body.dayOfWeek)) {
    return formatResponse(false, null, "Invalid day of week", 400);
  }

  // OPTIMIZATION: Build update object dynamically
  const updateData: any = {
    ...body,
    startTime: body.startTime ? new Date(`1970-01-01T${body.startTime}:00Z`) : undefined,
    endTime: body.endTime ? new Date(`1970-01-01T${body.endTime}:00Z`) : undefined,
  };

  // Prevent companyId hijacking
  delete updateData.companyId;
  delete updateData.id;

  try {
    // OPTIMIZATION: Atomic update with companyId scoping
    const updated = await prisma.classSchedule.update({
      where: { id, companyId },
      data: updateData,
      select: SCHEDULE_SELECT,
    });

    return formatResponse(true, updated, "Schedule updated", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return formatResponse(false, null, "Schedule not found", 404);
      if (error.code === 'P2003') return formatResponse(false, null, "Invalid Course, Educator, or Classroom ID", 400);
    }
    throw error;
  }
};

// --- DELETE: Remove Schedule
const deleteClassSchedule = async (_req: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  try {
    await prisma.classSchedule.delete({ where: { id, companyId } });
    return formatResponse(true, { id }, "Deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Schedule not found", 404);
    }
    throw error;
  }
};

export const GET = withApiHandler(getClassSchedule, { requireAuth: true });
export const PATCH = withApiHandler(updateClassSchedule, { requireAuth: true });
export const DELETE = withApiHandler(deleteClassSchedule, { requireAuth: true });
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// const VALID_DAYS_OF_WEEK = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
//   "Sunday",
// ];

// // --- GET a single class schedule
// const getClassSchedule = async (_req: Request,  context: { params: { id: string } , user?: any} ) => {
//   const { id } = context.params;

//   const schedule = await prisma.classSchedule.findUnique({
//     where: { id },
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//           code: true,
//         },
//       },
//       educator: {
//         select: { id: true, user: { select: { name: true, email: true } } },
//       },
//       classroom: { select: { id: true, name: true, academicLevelId: true } },
//       academicLevel: { select: { id: true, name: true } },
//     },
//   });

//   if (!schedule) {
//     return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
//   }

//   // const courseAcademicLevels =
//   //   schedule.course?.academicLevels
//   //     .map((cal) => cal.academicLevel)
//   //     .filter(Boolean)
//   //     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//   //     .map((level) => ({ id: level!.id, name: level!.name })) || [];

//   const responseData = {
//     id: schedule.id,
//     courseId: schedule.courseId,
//     courseTitle: schedule.course?.title || "N/A",
//     courseCode: schedule.course?.code || "N/A",
//     // courseAcademicLevels,
//     academicLevel: schedule.academicLevel,
//     academicLevelId: schedule.academicLevelId,
//     courseClassrooms: schedule.classroom ? [{ id: schedule.classroom.id, name: schedule.classroom.name, academicLevelId: schedule.classroom.academicLevelId }] : [],
//     educatorId: schedule.educatorId,
//     educatorName: schedule.educator?.user?.name || "N/A",
//     educatorEmail: schedule.educator?.user?.email || "N/A",
//     dayOfWeek: schedule.dayOfWeek,
//     startTime: schedule.startTime,
//     endTime: schedule.endTime,
//     topic: schedule.topic,
//     meetingLink: schedule.meetingLink,
//     companyId: schedule.companyId,
//     createdAt: schedule.createdAt,
//     updatedAt: schedule.updatedAt,
//   };

//   return NextResponse.json(responseData, { status: 200 });
// };

// // --- PATCH a class schedule
// const updateClassSchedule = async (req: Request,  context: { params: { id: string } , user?: any} ) => {
//   const { id } = context.params;
//   const body = await req.json();
//   const { courseId, educatorId, classroomId, academicLevelId, dayOfWeek, startTime, endTime, topic, meetingLink, companyId } =
//     body;

//   const existingSchedule = await prisma.classSchedule.findUnique({ where: { id } });
//   if (!existingSchedule) {
//     return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
//   }

//   // ✅ Validate companyId immutability
//   if (companyId && existingSchedule.companyId !== companyId) {
//     return NextResponse.json(
//       { message: "Cannot change companyId for an existing class schedule." },
//       { status: 400 }
//     );
//   }

//   // ✅ Validate dayOfWeek
//   if (dayOfWeek && !VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
//     return NextResponse.json(
//       {
//         message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(", ")}.`,
//       },
//       { status: 400 }
//     );
//   }

//   // ✅ Validate courseId
//   if (courseId) {
//     const existingCourse = await prisma.course.findUnique({
//       where: { id: courseId, companyId: existingSchedule.companyId },
//     });
//     if (!existingCourse) {
//       return NextResponse.json(
//         { message: "Provided courseId does not exist or does not belong to this company." },
//         { status: 400 }
//       );
//     }
//   }

//   // ✅ Validate academicLevelId
//   if (academicLevelId) {
//     const level = await prisma.academicLevel.findUnique({
//       where: { id: academicLevelId }
//     });
//     if (!level) {
//       return NextResponse.json({ message: "Invalid academic level" }, { status: 400 });
//     }
//   }

//   // ✅ Validate classroomId
//   if (classroomId) {
//     const existingClassroom = await prisma.classroom.findUnique({
//       where: { id: classroomId, companyId: existingSchedule.companyId },
//     });
//     if (!existingClassroom) {
//       return NextResponse.json(
//         { message: "Provided classroomId does not exist or does not belong to this company." },
//         { status: 400 }
//       );
//     }
//   }

//   // ✅ Validate educatorId
//   if (educatorId) {
//     const existingEducator = await prisma.educator.findUnique({
//       where: { id: educatorId, companyId: existingSchedule.companyId },
//     });
//     if (!existingEducator) {
//       return NextResponse.json(
//         { message: "Provided educatorId does not exist or does not belong to this company." },
//         { status: 400 }
//       );
//     }
//   }

//   // ✅ Parse and validate times
//   let parsedStartTime = existingSchedule.startTime;
//   let parsedEndTime = existingSchedule.endTime;

//   if (startTime) {
//     parsedStartTime = new Date(`1970-01-01T${startTime}:00Z`);
//     if (isNaN(parsedStartTime.getTime())) {
//       return NextResponse.json({ message: "Invalid startTime format. Expected HH:MM." }, { status: 400 });
//     }
//   }

//   if (endTime) {
//     parsedEndTime = new Date(`1970-01-01T${endTime}:00Z`);
//     if (isNaN(parsedEndTime.getTime())) {
//       return NextResponse.json({ message: "Invalid endTime format. Expected HH:MM." }, { status: 400 });
//     }
//   }

//   if (parsedStartTime >= parsedEndTime) {
//     return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
//   }

//   const updatedSchedule = await prisma.classSchedule.update({
//     where: { id },
//     data: {
//       courseId: courseId || existingSchedule.courseId,
//       educatorId: educatorId || existingSchedule.educatorId,
//       classroomId: classroomId || existingSchedule.classroomId,
//       academicLevelId: academicLevelId || existingSchedule.academicLevelId,
//       dayOfWeek: dayOfWeek || existingSchedule.dayOfWeek,
//       startTime: startTime ? parsedStartTime : existingSchedule.startTime,
//       endTime: endTime ? parsedEndTime : existingSchedule.endTime,
//       topic: topic !== undefined ? topic : existingSchedule.topic,
//       meetingLink: meetingLink !== undefined ? meetingLink : existingSchedule.meetingLink,
//     },
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//           code: true,
//         },
//       },
//       educator: { select: { id: true, user: { select: { name: true, email: true } } } },
//       classroom: { select: { id: true, name: true, academicLevelId: true } },
//       academicLevel: { select: { id: true, name: true } },
//     },
//   });

//   return NextResponse.json(updatedSchedule, { status: 200 });
// };

// // --- DELETE a class schedule
// const deleteClassSchedule = async (_req: Request,  context: { params: { id: string } , user?: any} ) => {
//   const { id } = context.params;

//   const existingSchedule = await prisma.classSchedule.findUnique({ where: { id } });
//   if (!existingSchedule) {
//     return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
//   }

//   const deletedSchedule = await prisma.classSchedule.delete({ where: { id } });

//   return NextResponse.json(
//     { message: "Class schedule deleted successfully", deletedId: deletedSchedule.id },
//     { status: 200 }
//   );
// };

// // ✅ Wrap handlers with auth + rate limit + error handling
// export const GET = withApiHandler(getClassSchedule, { requireAuth: true, requireRateLimit: true });
// export const PATCH = withApiHandler(updateClassSchedule, { requireAuth: true, requireRateLimit: true });
// export const DELETE = withApiHandler(deleteClassSchedule, { requireAuth: true, requireRateLimit: true });
