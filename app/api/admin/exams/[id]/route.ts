import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define valid ExamTypes (must match your Prisma enum)
const VALID_EXAM_TYPES = ["QUIZ", "UNIT_TEST", "MIDTERM", "FINAL", "ASSIGNMENT_BASED", "PRACTICE", "OTHER"];

// Helper function to format time (HH:MM) to ISO string with a dummy date
const formatTimeToISO = (time: string | null | undefined): Date | undefined => {
  if (!time) return undefined;
  const date = new Date(`1970-01-01T${time}:00Z`);
  return isNaN(date.getTime()) ? undefined : date;
};

// Helper function to format ISO string to HH:MM
const formatISOToHHMM = (isoString: Date | null | undefined): string | null => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// GET /api/exams/[id]
// Fetches a single Exam by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const exam = await prisma.exam.findUnique({
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
        createdByEducator: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    // Transform response
    const responseData = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      courseId: exam.courseId,
      courseTitle: exam.course?.title || 'N/A',
      courseAcademicLevels: exam.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      date: exam.date.toISOString().split('T')[0],
      startTime: formatISOToHHMM(exam.startTime),
      endTime: formatISOToHHMM(exam.endTime),
      location: exam.location,
      notes: exam.notes,
      type: exam.type,
      totalPoints: exam.totalPoints,
      isPublished: exam.isPublished,
      createdByEducatorId: exam.createdByEducatorId,
      createdByEducatorName: exam.createdByEducator?.user?.name || 'N/A',
      createdByEducatorEmail: exam.createdByEducator?.user?.email || 'N/A',
      isOnline: exam.isOnline,
      durationMinutes: exam.durationMinutes,
      autoGrade: exam.autoGrade,
      totalQuestions: exam._count.questions,
      totalSubmissions: exam._count.submissions,
      companyId: exam.companyId,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching exam with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch exam", error: error.message }, { status: 500 });
  }
}

// PATCH /api/exams/[id]
// Updates an existing Exam by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      courseId,
      date, // Expected YYYY-MM-DD
      startTime, // Expected HH:MM
      endTime,   // Expected HH:MM
      location,
      notes,
      type,
      totalPoints,
      isPublished,
      createdByEducatorId,
      isOnline,
      durationMinutes,
      autoGrade,
      companyId, // companyId should ideally not be changed after creation
      ...rest
    } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for exam:", rest);
    }

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (totalPoints !== undefined) updateData.totalPoints = totalPoints;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (autoGrade !== undefined) updateData.autoGrade = autoGrade;

    // Validate and update type
    if (type !== undefined) {
      if (!VALID_EXAM_TYPES.includes(type)) {
        return NextResponse.json({ message: `Invalid exam type: ${type}. Must be one of ${VALID_EXAM_TYPES.join(', ')}.` }, { status: 400 });
      }
      updateData.type = type;
    }

    // Validate and update courseId
    if (courseId !== undefined && courseId !== existingExam.courseId) {
      const newCourse = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!newCourse) {
        return NextResponse.json({ message: "Provided courseId does not exist for reassignment." }, { status: 400 });
      }
      updateData.courseId = courseId;
    }

    // Validate and update createdByEducatorId
    if (createdByEducatorId !== undefined && createdByEducatorId !== existingExam.createdByEducatorId) {
      const newEducator = await prisma.educator.findUnique({
        where: { id: createdByEducatorId },
      });
      if (!newEducator) {
        return NextResponse.json({ message: "Provided createdByEducatorId does not exist for reassignment." }, { status: 400 });
      }
      updateData.createdByEducatorId = createdByEducatorId;
    }

    // Parse and update date
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ message: "Invalid date format. Expected YYYY-MM-DD." }, { status: 400 });
      }
      updateData.date = parsedDate;
    }

    // Parse and update time fields
    if (startTime !== undefined) {
      const parsedStartTime = formatTimeToISO(startTime);
      if (!parsedStartTime) {
        return NextResponse.json({ message: "Invalid startTime format. Expected HH:MM." }, { status: 400 });
      }
      updateData.startTime = parsedStartTime;
    }
    if (endTime !== undefined) {
      const parsedEndTime = formatTimeToISO(endTime);
      if (!parsedEndTime) {
        return NextResponse.json({ message: "Invalid endTime format. Expected HH:MM." }, { status: 400 });
      }
      updateData.endTime = parsedEndTime;
    }

    // Re-validate start/end time relationship if both are provided or one is updated
    const finalStartTime = updateData.startTime || existingExam.startTime;
    const finalEndTime = updateData.endTime || existingExam.endTime;

    if (finalStartTime && finalEndTime && finalStartTime >= finalEndTime) {
      return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        createdByEducator: { select: { id: true, user: { select: { name: true, email: true } } } },
        _count: { select: { questions: true, submissions: true } },
      },
    });

    // Transform response
    const responseData = {
      id: updatedExam.id,
      title: updatedExam.title,
      description: updatedExam.description,
      courseId: updatedExam.courseId,
      courseTitle: updatedExam.course?.title || 'N/A',
      courseAcademicLevels: updatedExam.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      date: updatedExam.date.toISOString().split('T')[0],
      startTime: formatISOToHHMM(updatedExam.startTime),
      endTime: formatISOToHHMM(updatedExam.endTime),
      location: updatedExam.location,
      notes: updatedExam.notes,
      type: updatedExam.type,
      totalPoints: updatedExam.totalPoints,
      isPublished: updatedExam.isPublished,
      createdByEducatorId: updatedExam.createdByEducatorId,
      createdByEducatorName: updatedExam.createdByEducator?.user?.name || 'N/A',
      createdByEducatorEmail: updatedExam.createdByEducator?.user?.email || 'N/A',
      isOnline: updatedExam.isOnline,
      durationMinutes: updatedExam.durationMinutes,
      autoGrade: updatedExam.autoGrade,
      totalQuestions: updatedExam._count.questions,
      totalSubmissions: updatedExam._count.submissions,
      companyId: updatedExam.companyId,
      createdAt: updatedExam.createdAt,
      updatedAt: updatedExam.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating exam with ID ${id}:`, error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "An exam with the same course, date, and start time already exists for this company." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update exam", error: error.message }, { status: 500 });
  }
}

// DELETE /api/exams/[id]
// Deletes an Exam by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    // Prisma's onDelete: Cascade will handle deletion of related ExamQuestion and ExamSubmission records.
    // Ensure you have onDelete: Cascade set in your schema for ExamQuestion and ExamSubmission.
    const deletedExam = await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exam deleted successfully", deletedId: deletedExam.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting exam with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete exam: It has associated records that prevent deletion. Ensure onDelete: Cascade is properly configured for ExamQuestions and ExamSubmissions." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete exam", error: error.message }, { status: 500 });
  }
}
