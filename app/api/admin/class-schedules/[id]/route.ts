import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper to validate day of week
const VALID_DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// GET /api/class-schedules/[id]
// Fetches a single ClassSchedule by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const schedule = await prisma.classSchedule.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
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

    // Transform response
    const responseData = {
      id: schedule.id,
      courseId: schedule.courseId,
      courseTitle: schedule.course?.title || 'N/A',
      courseAcademicLevels: schedule.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
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
// Updates an existing ClassSchedule by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { courseId, educatorId, dayOfWeek, startTime, endTime, topic, meetingLink, companyId, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for class schedule:", rest);
    }

    const existingSchedule = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
    }

    // Validate dayOfWeek if provided
    if (dayOfWeek !== undefined && !VALID_DAYS_OF_WEEK.includes(dayOfWeek)) {
      return NextResponse.json({ message: `Invalid dayOfWeek: ${dayOfWeek}. Must be one of ${VALID_DAYS_OF_WEEK.join(', ')}.` }, { status: 400 });
    }

    // Validate courseId if provided
    if (courseId !== undefined && courseId !== existingSchedule.courseId) {
      const newCourse = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!newCourse) {
        return NextResponse.json({ message: "Provided courseId does not exist for reassignment." }, { status: 400 });
      }
    }

    // Validate educatorId if provided
    if (educatorId !== undefined && educatorId !== existingSchedule.educatorId) {
      const newEducator = await prisma.educator.findUnique({
        where: { id: educatorId },
      });
      if (!newEducator) {
        return NextResponse.json({ message: "Provided educatorId does not exist for reassignment." }, { status: 400 });
      }
    }

    // Handle startTime and endTime parsing
    let parsedStartTime: Date | undefined;
    let parsedEndTime: Date | undefined;

    if (startTime !== undefined) {
      parsedStartTime = new Date(`1970-01-01T${startTime}:00Z`);
      if (isNaN(parsedStartTime.getTime())) {
        return NextResponse.json({ message: "Invalid startTime format. Expected HH:MM." }, { status: 400 });
      }
    }
    if (endTime !== undefined) {
      parsedEndTime = new Date(`1970-01-01T${endTime}:00Z`);
      if (isNaN(parsedEndTime.getTime())) {
        return NextResponse.json({ message: "Invalid endTime format. Expected HH:MM." }, { status: 400 });
      }
    }

    // Validate start/end time relationship if both are provided or one is updated
    const finalStartTime = parsedStartTime || existingSchedule.startTime;
    const finalEndTime = parsedEndTime || existingSchedule.endTime;

    if (finalStartTime && finalEndTime && finalStartTime >= finalEndTime) {
      return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
    }

    const updatedSchedule = await prisma.classSchedule.update({
      where: { id },
      data: {
        courseId,
        educatorId,
        dayOfWeek,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        topic,
        meetingLink,
        companyId, // companyId should ideally not be changed after creation
      },
      include: {
        course: { select: { id: true, title: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        educator: { select: { id: true, user: { select: { name: true, email: true } } } },
      },
    });

    // Transform response
    const responseData = {
      id: updatedSchedule.id,
      courseId: updatedSchedule.courseId,
      courseTitle: updatedSchedule.course?.title || 'N/A',
      courseAcademicLevels: updatedSchedule.course?.academicLevels
        .map(al => al.academicLevel)
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
      return NextResponse.json({ message: "A class schedule already exists for this educator at the specified day and time." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update class schedule", error: error.message }, { status: 500 });
  }
}

// DELETE /api/class-schedules/[id]
// Deletes a ClassSchedule by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingSchedule = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ message: "Class schedule not found" }, { status: 404 });
    }

    // If AttendanceRecord has onDelete: Cascade, records will be deleted automatically.
    // Otherwise, you might get a P2003 error if attendance records exist.
    const deletedSchedule = await prisma.classSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Class schedule deleted successfully", deletedId: deletedSchedule.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting class schedule with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete class schedule: It has associated attendance records. Please delete attendance records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete class schedule", error: error.message }, { status: 500 });
  }
}
