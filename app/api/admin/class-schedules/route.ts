import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper to validate day of week
const VALID_DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// GET /api/class-schedules
// Fetches all class schedules, optionally filtered by companyId, courseId, educatorId, or dayOfWeek.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const courseId = searchParams.get('courseId');
    const educatorId = searchParams.get('educatorId');
    const dayOfWeek = searchParams.get('dayOfWeek');

    const whereClause: any = {};

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch class schedules." }, { status: 400 });
    }
    whereClause.companyId = companyId;

    if (courseId) {
      whereClause.courseId = courseId;
    }
    if (educatorId) {
      whereClause.educatorId = educatorId;
    }
    if (dayOfWeek) {
      if (!VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
        return NextResponse.json({ message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(', ')}.` }, { status: 400 });
      }
      whereClause.dayOfWeek = dayOfWeek;
    }

    const classSchedules = await prisma.classSchedule.findMany({
      where: whereClause,
      include: {
        course: { // Include course details
          select: {
            id: true,
            title: true,
            academicLevels: { // Include academic levels through the course
              include: {
                academicLevel: {
                  select: { id: true, name: true, sortOrder: true },
                },
              },
            },
          },
        },
        educator: { // Include educator details
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' }, // Order by day of week (needs custom sorting on frontend if not enum)
        { startTime: 'asc' }, // Then by start time
      ],
    });

    // Custom sort by day of week if you want a specific order (e.g., Mon-Sun)
    const sortedClassSchedules = classSchedules.sort((a, b) => {
      const dayOrder: { [key: string]: number } = {
        "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7
      };
      return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
    });


    // Transform the data to include flattened relations
    const response = sortedClassSchedules.map((schedule) => {
      const courseAcademicLevels = schedule.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name }));

      return {
        id: schedule.id,
        courseId: schedule.courseId,
        courseTitle: schedule.course?.title || 'N/A',
        courseAcademicLevels: courseAcademicLevels || [],
        educatorId: schedule.educatorId,
        educatorName: schedule.educator?.user?.name || 'N/A',
        educatorEmail: schedule.educator?.user?.email || 'N/A',
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime, // Still a Date object, frontend will format
        endTime: schedule.endTime,     // Still a Date object, frontend will format
        topic: schedule.topic,
        meetingLink: schedule.meetingLink,
        companyId: schedule.companyId,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching class schedules:", error);
    return NextResponse.json({ message: "Failed to fetch class schedules", error: error.message }, { status: 500 });
  }
}

// POST /api/class-schedules
// Creates a new ClassSchedule.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, educatorId, dayOfWeek, startTime, endTime, topic, meetingLink, companyId } = body;

    // Basic validation
    if (!courseId || !educatorId || !dayOfWeek || !startTime || !endTime || !companyId) {
      return NextResponse.json({ message: "Course ID, Educator ID, Day of Week, Start Time, End Time, and Company ID are required to create a class schedule." }, { status: 400 });
    }

    // Validate dayOfWeek
    if (!VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
      return NextResponse.json({ message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(', ')}.` }, { status: 400 });
    }

    // Validate courseId exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!existingCourse) {
      return NextResponse.json({ message: "Provided courseId does not exist." }, { status: 400 });
    }

    // Validate educatorId exists
    const existingEducator = await prisma.educator.findUnique({
      where: { id: educatorId },
    });
    if (!existingEducator) {
      return NextResponse.json({ message: "Provided educatorId does not exist." }, { status: 400 });
    }

    // Parse time strings into Date objects. Use a dummy date (e.g., 1970-01-01) for the date part.
    // Frontend should send times in a format like "HH:MM" or "YYYY-MM-DDTHH:MM:SSZ"
    const parsedStartTime = new Date(`1970-01-01T${startTime}:00Z`); // Assuming startTime is "HH:MM"
    const parsedEndTime = new Date(`1970-01-01T${endTime}:00Z`);     // Assuming endTime is "HH:MM"

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return NextResponse.json({ message: "Invalid startTime or endTime format. Expected HH:MM." }, { status: 400 });
    }

    if (parsedStartTime >= parsedEndTime) {
      return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
    }

    // Check for educator schedule conflict using the unique constraint
    // Prisma's `create` will throw P2002 if the unique constraint is violated.

    const newSchedule = await prisma.classSchedule.create({
      data: {
        courseId,
        educatorId,
        dayOfWeek,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        topic,
        meetingLink,
        companyId,
      },
      include: {
        course: { select: { id: true, title: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        educator: { select: { id: true, user: { select: { name: true, email: true } } } },
      },
    });

    // Transform response
    const responseData = {
      id: newSchedule.id,
      courseId: newSchedule.courseId,
      courseTitle: newSchedule.course?.title || 'N/A',
      courseAcademicLevels: newSchedule.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      educatorId: newSchedule.educatorId,
      educatorName: newSchedule.educator?.user?.name || 'N/A',
      educatorEmail: newSchedule.educator?.user?.email || 'N/A',
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
  } catch (error: any) {
    console.error("Error creating class schedule:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "A class schedule already exists for this educator at the specified day and time." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create class schedule", error: error.message }, { status: 500 });
  }
}
