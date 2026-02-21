import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from "@/lib/verifyAuth"; // Existing import

// Define valid ExamTypes (must match your Prisma enum)
const VALID_EXAM_TYPES = ["QUIZ", "UNIT_TEST", "MIDTERM", "FINAL", "ASSIGNMENT_BASED", "PRACTICE", "OTHER"];

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// Helper function to format time (HH:MM) to ISO string with a dummy date
const formatTimeToISO = (time: string | null | undefined): Date | undefined => {
  if (!time) return undefined;
  // Use a fixed date to ensure only time component is relevant when storing as Date in Prisma
  const date = new Date(`1970-01-01T${time}:00Z`);
  return isNaN(date.getTime()) ? undefined : date;
};

// Helper function to format ISO string to HH:MM
const formatISOToHHMM = (isoString: Date | null | undefined): string | null => {
  if (!isoString) return null;
  // Ensure we use UTC conversion to handle the dummy date accurately
  const date = new Date(isoString);
  return date.toISOString().substring(11, 16); // Extracts HH:MM in UTC (which is how it was stored via formatTimeToISO)
};

// Helper function to transform the Prisma exam object into the desired API structure
function transformExamResponse(exam: any) {
  const courseAcademicLevels = exam.course?.academicLevels
    .map((al: any) => al.academicLevel)
    .filter(Boolean)
    .sort((a: any, b: any) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
    .map((level: any) => ({ id: level!.id, name: level!.name }));

  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    examCategoryId: exam.examCategoryId,
    examCategory: exam.examCategory ? { id: exam.examCategory.id, name: exam.examCategory.name } : null,
    courseId: exam.courseId,
    courseTitle: exam.course?.title || 'N/A',
    courseAcademicLevels: courseAcademicLevels || [],
    classroomId: exam.classroomId || (exam.classroom ? exam.classroom.id : null),
    classroom: exam.classroom ? { id: exam.classroom.id, name: exam.classroom.name, academicLevelId: exam.classroom.academicLevelId } : null,
    date: exam.date.toISOString().split('T')[0], // YYYY-MM-DD
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
}

// =======================================================================
// GET /api/exams/[id]
// Fetches a single Exam by its ID.
// =======================================================================
async function getExam(request: Request, { params }: Params) {
  
  const { id } = params;

  const cacheKey = `admin:exams:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          academicLevels: {
            include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
          },
        },
      },
      classroom: {
        select: { id: true, name: true, academicLevelId: true }
      },
      createdByEducator: {
        select: { id: true, user: { select: { name: true, email: true } } },
      },
      examCategory: {
        select: { id: true, name: true }
      },
      _count: { select: { questions: true, submissions: true } },
    },
  });


  if (!exam) {
    return formatResponse(false, null, "Exam not found", 404);
  }

  const responseData = transformExamResponse(exam);
  
  try {
    if (exam) {
      await cacheSet(cacheKey, { data: responseData }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// PATCH /api/exams/[id]
// Updates an existing Exam by ID.
// =======================================================================
async function updateExam(request: Request, { params }: Params) {
  
  const { id } = params;
  const body = await request.json();
  const {
    title, description, courseId, date, startTime, endTime, location, notes, type,
    totalPoints, isPublished, createdByEducatorId, isOnline, durationMinutes, autoGrade, classroomId, examCategoryId,
    companyId, // Ignored
    ...rest
  } = body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request for exam:", rest);
  }

  const existingExam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!existingExam) {
    return formatResponse(false, null, "Exam not found", 404);
  }

  const updateData: any = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (notes !== undefined) updateData.notes = notes;
  if (classroomId !== undefined) updateData.classroomId = classroomId;
  if (totalPoints !== undefined) updateData.totalPoints = totalPoints;
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (isOnline !== undefined) updateData.isOnline = isOnline;
  if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
  if (autoGrade !== undefined) updateData.autoGrade = autoGrade;
  if (examCategoryId !== undefined) updateData.examCategoryId = examCategoryId;
  
  // Validate and update type
  if (type !== undefined) {
    if (!VALID_EXAM_TYPES.includes(type)) {
      return formatResponse(false, null, `Invalid exam type: ${type}. Must be one of ${VALID_EXAM_TYPES.join(', ')}.`, 400);
    }
    updateData.type = type;
  }

  // Validate and update courseId
  if (courseId !== undefined && courseId !== existingExam.courseId) {
    const newCourse = await prisma.course.findUnique({ where: { id: courseId } });
    if (!newCourse) {
      return formatResponse(false, null, "Provided courseId does not exist for reassignment.", 400);
    }
    updateData.courseId = courseId;
  }

  // Validate and update createdByEducatorId
  if (createdByEducatorId !== undefined && createdByEducatorId !== existingExam.createdByEducatorId) {
    const newEducator = await prisma.educator.findUnique({ where: { id: createdByEducatorId } });
    if (!newEducator) {
      return formatResponse(false, null, "Provided createdByEducatorId does not exist for reassignment.", 400);
    }
    updateData.createdByEducatorId = createdByEducatorId;
  }

  // Parse and update date
  if (date !== undefined) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return formatResponse(false, null, "Invalid date format. Expected YYYY-MM-DD.", 400);
    }
    updateData.date = parsedDate;
  }

  // Parse and update time fields
  if (startTime !== undefined) {
    const parsedStartTime = formatTimeToISO(startTime);
    if (!parsedStartTime) {
      return formatResponse(false, null, "Invalid startTime format. Expected HH:MM.", 400);
    }
    updateData.startTime = parsedStartTime;
  }
  if (endTime !== undefined) {
    const parsedEndTime = formatTimeToISO(endTime);
    if (!parsedEndTime) {
      return formatResponse(false, null, "Invalid endTime format. Expected HH:MM.", 400);
    }
    updateData.endTime = parsedEndTime;
  }

  // Re-validate start/end time relationship
  const finalStartTime = updateData.startTime || existingExam.startTime;
  const finalEndTime = updateData.endTime || existingExam.endTime;

  if (finalStartTime && finalEndTime && finalStartTime >= finalEndTime) {
    return formatResponse(false, null, "Start time must be before end time.", 400);
  }

  try {
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        createdByEducator: { select: { id: true, user: { select: { name: true, email: true } } } },
        classroom: { select: { id: true, name: true, academicLevelId: true } },
        examCategory: { select: { id: true, name: true } },
        _count: { select: { questions: true, submissions: true } },
      },
    });

    const responseData = transformExamResponse(updatedExam);
    
    try { await cacheDel(`admin:exams:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: responseData }, null, 200);

  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "An exam with the same course, date, and start time already exists for this company.", 409);
    }
    throw error;
  }
}

// =======================================================================
// DELETE /api/exams/[id]
// Deletes an Exam by ID.
// =======================================================================
async function deleteExam(request: Request, { params }: Params) {
  
  const { id } = params;

  const existingExam = await prisma.exam.findUnique({ where: { id } });
  if (!existingExam) {
    return formatResponse(false, null, "Exam not found", 404);
  }

  try {
    const deletedExam = await prisma.exam.delete({
      where: { id },
    });
    
    try { await cacheDel(`admin:exams:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: "Exam deleted successfully", deletedId: deletedExam.id }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2003') {
      return formatResponse(false, null, "Cannot delete exam: It has associated records (like submissions) that prevent deletion. Ensure your schema has appropriate cascade rules.", 409);
    }
    throw error;
  }
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getExam);
export const PATCH = withApiHandler(updateExam);
export const DELETE = withApiHandler(deleteExam);
