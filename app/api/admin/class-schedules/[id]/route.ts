import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Helper to validate day of week
const VALID_DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// GET /api/class-schedules/[id]
// Fetches a single ClassSchedule by its ID.


// GET /api/class-schedules/[id]
// Fetches a single class schedule by ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;

  try {
    const schedule = await prisma.classSchedule.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true, // Include course code
            academicLevels: {
              include: {
                academicLevel: {
                  select: { id: true, name: true, sortOrder: true },
                },
              },
            },
          },
        },
        educator: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
    }

    const courseAcademicLevels = schedule.course?.academicLevels
      .map(cal => cal.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: schedule.id,
      courseId: schedule.courseId,
      courseTitle: schedule.course?.title || 'N/A',
      courseCode: schedule.course?.code || 'N/A',
      courseAcademicLevels: courseAcademicLevels || [],
      educatorId: schedule.educatorId,
      educatorName: schedule.educator?.user?.name || 'N/A',
      educatorEmail: schedule.educator?.user?.email || 'N/A',
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      topic: schedule.topic,
      meetingLink: schedule.meetingLink,
      companyId: schedule.companyId,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching class schedule with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch class schedule", error: error.message }, { status: 500 });
  }
}

// PATCH /api/class-schedules/[id]
// Updates an existing ClassSchedule.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

const { id } = params;

  try {
    const body = await request.json();
    const { courseId, educatorId, dayOfWeek, startTime, endTime, topic, meetingLink, companyId } = body;

    const existingSchedule = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
    }

    // Validate companyId if provided and it's changing (shouldn't typically change)
    if (companyId && existingSchedule.companyId !== companyId) {
      return NextResponse.json({ message: "Cannot change companyId for an existing class schedule." }, { status: 400 });
    }

    // Validate dayOfWeek if provided
    if (dayOfWeek && !VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
      return NextResponse.json({ message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(', ')}.` }, { status: 400 });
    }

    // Validate courseId if provided
    if (courseId) {
      const existingCourse = await prisma.course.findUnique({
        where: { id: courseId, companyId: existingSchedule.companyId },
      });
      if (!existingCourse) {
        return NextResponse.json({ message: "Provided courseId does not exist or does not belong to this company." }, { status: 400 });
      }
    }

    // Validate educatorId if provided
    if (educatorId) {
      const existingEducator = await prisma.educator.findUnique({
        where: { id: educatorId, companyId: existingSchedule.companyId },
      });
      if (!existingEducator) {
        return NextResponse.json({ message: "Provided educatorId does not exist or does not belong to this company." }, { status: 400 });
      }

      // Check if the new educator is assigned to the course (optional but good practice for consistency)
      if (courseId) { // Only check if courseId is also provided or already exists
        const currentCourseId = courseId || existingSchedule.courseId;
        const isEducatorAssignedToCourse = await prisma.courseEducatorAssignment.findUnique({
          where: {
            educatorId_courseId: {
              educatorId: educatorId,
              courseId: currentCourseId,
            },
          },
        });

        if (!isEducatorAssignedToCourse) {
          console.warn(`Educator ${educatorId} is not formally assigned to course ${currentCourseId} via CourseEducatorAssignment, but is being scheduled.`);
          // return NextResponse.json({ message: "Educator is not assigned to this course. Please assign the educator to the course first." }, { status: 400 });
        }
      }
    }

    let parsedStartTime = existingSchedule.startTime;
    let parsedEndTime = existingSchedule.endTime;

    if (startTime) {
      parsedStartTime = new Date(`1970-01-01T${startTime}:00Z`);
      if (isNaN(parsedStartTime.getTime())) {
        return NextResponse.json({ message: "Invalid startTime format. Expected HH:MM." }, { status: 400 });
      }
    }

    if (endTime) {
      parsedEndTime = new Date(`1970-01-01T${endTime}:00Z`);
      if (isNaN(parsedEndTime.getTime())) {
        return NextResponse.json({ message: "Invalid endTime format. Expected HH:MM." }, { status: 400 });
      }
    }

    if (parsedStartTime >= parsedEndTime) {
      return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
    }

    const updatedSchedule = await prisma.classSchedule.update({
      where: { id },
      data: {
        courseId: courseId || existingSchedule.courseId,
        educatorId: educatorId || existingSchedule.educatorId,
        dayOfWeek: dayOfWeek || existingSchedule.dayOfWeek,
        startTime: startTime ? parsedStartTime : existingSchedule.startTime,
        endTime: endTime ? parsedEndTime : existingSchedule.endTime,
        topic: topic !== undefined ? topic : existingSchedule.topic, // Allow null/empty string for topic
        meetingLink: meetingLink !== undefined ? meetingLink : existingSchedule.meetingLink, // Allow null/empty string for meetingLink
      },
      include: {
        course: { select: { id: true, title: true, code: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        educator: { select: { id: true, user: { select: { name: true, email: true } } } },
      },
    });

    // Transform response
    const responseData = {
      id: updatedSchedule.id,
      courseId: updatedSchedule.courseId,
      courseTitle: updatedSchedule.course?.title || 'N/A',
      courseCode: updatedSchedule.course?.code || 'N/A',
      courseAcademicLevels: updatedSchedule.course?.academicLevels
        .map(cal => cal.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      educatorId: updatedSchedule.educatorId,
      educatorName: updatedSchedule.educator?.user?.name || 'N/A',
      educatorEmail: updatedSchedule.educator?.user?.email || 'N/A',
      dayOfWeek: updatedSchedule.dayOfWeek,
      startTime: updatedSchedule.startTime,
      endTime: updatedSchedule.endTime,
      topic: updatedSchedule.topic,
      meetingLink: updatedSchedule.meetingLink,
      companyId: updatedSchedule.companyId,
      createdAt: updatedSchedule.createdAt,
      updatedAt: updatedSchedule.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating class schedule with ID ${id}:`, error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "A class schedule already exists for this educator at the specified day and time within this company." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update class schedule", error: error.message }, { status: 500 });
  }
}

// DELETE /api/class-schedules/[id]
// Deletes a class schedule by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

const { id } = params;

  try {
    const existingSchedule = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
    }

    // Note: If AttendanceRecord has a strict onDelete: Restrict on classScheduleId,
    // you might need to delete related AttendanceRecords first or configure cascade delete.
    const deletedSchedule = await prisma.classSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Class schedule deleted successfully", deletedId: deletedSchedule.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting class schedule with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete class schedule: It is linked to existing attendance records. Please delete associated records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete class schedule", error: error.message }, { status: 500 });
  }
}
