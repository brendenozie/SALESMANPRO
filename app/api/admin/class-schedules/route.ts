// app/api/class-schedules/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const VALID_DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// GET /api/class-schedules
// Fetches all class schedules, optionally filtered by companyId, courseId, educatorId, or dayOfWeek.
export const GET = withApiHandler(async (request: Request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const courseId = searchParams.get("courseId");
  const educatorId = searchParams.get("educatorId");
  const classroomId = searchParams.get("classroomId");
  const dayOfWeek = searchParams.get("dayOfWeek");

  if (!companyId) {
    return NextResponse.json(
      { message: "Company ID is required to fetch class schedules." },
      { status: 400 }
    );
  }

  const whereClause: any = { companyId };
  if (courseId) whereClause.courseId = courseId;
  if (educatorId) whereClause.educatorId = educatorId;
  if (classroomId) whereClause.course = {
    some: {
      classrooms: {
        some: {
          id: classroomId
        }
      }
    }
  };
  if (dayOfWeek) {
    if (!VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
      return NextResponse.json(
        { message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(", ")}.` },
        { status: 400 }
      );
    }
    whereClause.dayOfWeek = dayOfWeek;
  }

  const classSchedules = await prisma.classSchedule.findMany({
    where: whereClause,
    include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        educator: {
          select: { id: true, user: { select: { name: true, email: true } } }
        },
        classroom: { select: { id: true, name: true, academicLevelId: true } },
        academicLevel: { select: { id: true, name: true } }, // ✅ ADD THIS
      },
    // include: {
    //   course: {
    //     select: {
    //       id: true,
    //       title: true,
    //       code: true,
    //       academicLevels: {
    //         include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
    //       },
    //     },
    //   },
    //   educator: {
    //     select: { id: true, user: { select: { name: true, email: true } } },
    //   },
    //   classroom: { select: { id: true, name: true, academicLevelId: true } },
    // },
    orderBy: [{ startTime: "asc" }],
  });

  const dayOrder: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
    Friday: 5, Saturday: 6, Sunday: 7,
  };

  const response = classSchedules
    .sort((a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek])
    .map((schedule) => {
      // const courseAcademicLevels = schedule.course?.academicLevels
      //   .map((cal) => cal.academicLevel)
      //   .filter(Boolean)
      //   .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      //   .map((level) => ({ id: level!.id, name: level!.name }));

        return {
          id: schedule.id,
          courseId: schedule.courseId,
          courseTitle: schedule.course?.title || "N/A",
          courseCode: schedule.course?.code || "N/A",

          academicLevel: schedule.academicLevel
            ? { id: schedule.academicLevel.id, name: schedule.academicLevel.name }
            : null,

          classroom: schedule.classroom
            ? {
                id: schedule.classroom.id,
                name: schedule.classroom.name,
                academicLevelId: schedule.classroom.academicLevelId,
              }
            : null,

          educatorId: schedule.educatorId,
          educatorName: schedule.educator?.user?.name || "N/A",
          educatorEmail: schedule.educator?.user?.email || "N/A",

          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          topic: schedule.topic,
          meetingLink: schedule.meetingLink,
        };


      // return {
      //   id: schedule.id,
      //   courseId: schedule.courseId,
      //   courseTitle: schedule.course?.title || "N/A",
      //   courseCode: schedule.course?.code || "N/A",
      //   courseAcademicLevels: courseAcademicLevels || [],
      //   courseClassrooms: schedule.classroom ? [{ id: schedule.classroom.id, name: schedule.classroom.name, academicLevelId: schedule.classroom.academicLevelId }] : [],
      //   educatorId: schedule.educatorId,
      //   educatorName: schedule.educator?.user?.name || "N/A",
      //   educatorEmail: schedule.educator?.user?.email || "N/A",
      //   dayOfWeek: schedule.dayOfWeek,
      //   startTime: schedule.startTime,
      //   endTime: schedule.endTime,
      //   topic: schedule.topic,
      //   meetingLink: schedule.meetingLink,
      //   companyId: schedule.companyId,
      //   createdAt: schedule.createdAt,
      //   updatedAt: schedule.updatedAt,
      // };
    });

  return NextResponse.json(response, { status: 200 });
},{requireAuth:true,requireRateLimit:true});

// POST /api/class-schedules
// Creates a new class schedule
export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { courseId, educatorId, classroomId, academicLevelId, dayOfWeek, startTime, endTime, topic, meetingLink, companyId } = body;

  if (!courseId || !educatorId || !classroomId || !academicLevelId || !dayOfWeek || !startTime || !endTime || !companyId) {
    return NextResponse.json(
      { message: "Course ID, Educator ID, Classroom ID, Academic Level ID, Day of Week, Start Time, End Time, and Company ID are required." },
      { status: 400 }
    );
  }

  if (!VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
    return NextResponse.json(
      { message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(", ")}.` },
      { status: 400 }
    );
  }

  const existingCourse = await prisma.course.findUnique({ where: { id: courseId, companyId } });
  if (!existingCourse) {
    return NextResponse.json(
      { message: "Provided courseId does not exist or does not belong to this company." },
      { status: 400 }
    );
  }

  if (academicLevelId) {
    const level = await prisma.academicLevel.findUnique({
      where: { id: academicLevelId }
    });
    if (!level) {
      return NextResponse.json({ message: "Invalid academic level" }, { status: 400 });
    }
  }

  const existingClassroom = await prisma.classroom.findUnique({ where: { id: classroomId, companyId } });
  if (!existingClassroom) {
    return NextResponse.json(
      { message: "Provided classroomId does not exist or does not belong to this company." },
      { status: 400 }
    );
  }

  const existingEducator = await prisma.educator.findUnique({ where: { id: educatorId, companyId } });
  if (!existingEducator) {
    return NextResponse.json(
      { message: "Provided educatorId does not exist or does not belong to this company." },
      { status: 400 }
    );
  }



  const parsedStartTime = new Date(`1970-01-01T${startTime}:00Z`);
  const parsedEndTime = new Date(`1970-01-01T${endTime}:00Z`);
  if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
    return NextResponse.json(
      { message: "Invalid startTime or endTime format. Expected HH:MM (e.g., '09:00')." },
      { status: 400 }
    );
  }
  if (parsedStartTime >= parsedEndTime) {
    return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
  }

  const newSchedule = await prisma.classSchedule.create({
    data: {
      courseId,
      educatorId,
      classroomId,
      dayOfWeek,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      topic,
      meetingLink,
      companyId,
      academicLevelId,
    },
    include: {
      course: { select: { id: true, title: true, code: true,} },
      educator: { select: { id: true, user: { select: { name: true, email: true } } } },
      classroom: { select: { id: true, name: true, academicLevelId: true } },
      academicLevel: { select: { id: true, name: true } },
    },
  });

  const responseData = {
    id: newSchedule.id,
    courseId: newSchedule.courseId,
    courseTitle: newSchedule.course?.title || "N/A",
    courseCode: newSchedule.course?.code || "N/A",
    academicLevelId: newSchedule.academicLevelId,
    academicLevelName: newSchedule.academicLevel?.name || "N/A",
    courseClassrooms: newSchedule.classroom ? [{ id: newSchedule.classroom.id, name: newSchedule.classroom.name, academicLevelId: newSchedule.classroom.academicLevelId }] : [],
    educatorId: newSchedule.educatorId,
    educatorName: newSchedule.educator?.user?.name || "N/A",
    educatorEmail: newSchedule.educator?.user?.email || "N/A",
    dayOfWeek: newSchedule.dayOfWeek,
    startTime: newSchedule.startTime,
    endTime: newSchedule.endTime,
    topic: newSchedule.topic,
    meetingLink: newSchedule.meetingLink,
    companyId: newSchedule.companyId,
    createdAt: newSchedule.createdAt,
    updatedAt: newSchedule.updatedAt,
  };

  return NextResponse.json(responseData, { status: 201 });
});
