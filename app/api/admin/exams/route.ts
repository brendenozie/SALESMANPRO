

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from "@/lib/verifyAuth"; // Existing import

// Define valid ExamTypes (must match your Prisma enum)
const VALID_EXAM_TYPES = ["QUIZ", "UNIT_TEST", "MIDTERM", "FINAL", "ASSIGNMENT_BASED", "PRACTICE", "OTHER"];

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
  const date = new Date(isoString);
  // Extract HH:MM in UTC (which is how it was stored via formatTimeToISO)
  return date.toISOString().substring(11, 16);
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
    courseId: exam.courseId,
    courseTitle: exam.course?.title || 'N/A',
    courseAcademicLevels: courseAcademicLevels || [],
    classroomId: exam.classroomId || (exam.classroom ? exam.classroom.id : null),
    classroom: exam.classroom ? { id: exam.classroom.id, name: exam.classroom.name, academicLevelId: exam.classroom.academicLevelId } : null,
    date: exam.date.toISOString().split('T')[0], // YYYY-MM-DD
    startTime: formatISOToHHMM(exam.startTime), // HH:MM
    endTime: formatISOToHHMM(exam.endTime),     // HH:MM
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
// GET /api/exams
// Fetches all exams with optional filters.
// =======================================================================
async function getExams(request: Request) {
  


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const courseId = searchParams.get('courseId');
  const createdByEducatorId = searchParams.get('createdByEducatorId');
  const type = searchParams.get('type');
  const isPublished = searchParams.get('isPublished');

  const whereClause: any = {};

  if (companyId) {
    // return formatResponse(false, null, "Company ID is required to fetch exams.", 400);
    whereClause.companyId = companyId;
  }
  
  if (courseId) {
    whereClause.courseId = courseId;
  }
  if (createdByEducatorId) {
    whereClause.createdByEducatorId = createdByEducatorId;
  }
  if (type) {
    const upperType = type.toUpperCase();
    if (!VALID_EXAM_TYPES.includes(upperType)) {
      return formatResponse(false, null, `Invalid exam type: ${type}. Must be one of ${VALID_EXAM_TYPES.join(', ')}.`, 400);
    }
    whereClause.type = upperType;
  }
  if (isPublished !== null) {
    whereClause.isPublished = isPublished === 'true';
  }

  const exams = await prisma.exam.findMany({
    where: {
      ...whereClause,
    //   OR: [
    //   { courseId: null },
    //   { course: null } // This checks for records where the relation is missing
    // ]
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        },
      },
      classroom: {
        select: { id: true, name: true, academicLevelId: true }
      },
      createdByEducator: {
        select: { id: true, user: { select: { name: true, email: true } } },
      },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: {
      date: 'desc',
    },
  });

  const responseData = exams.map(transformExamResponse);
  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// POST /api/exams
// Creates a new Exam.
// =======================================================================
async function createExam(request: Request) {
  
  const body = await request.json();
  const {
    companyId, title, description, courseId, date, startTime, endTime, location,
    notes, type, totalPoints, isPublished, createdByEducatorId, isOnline,
    durationMinutes, autoGrade, classroomId,
  } = body;

  // Basic validation
  if (!companyId || !title || !courseId || !date || !createdByEducatorId || !type) {
    return formatResponse(false, null, "Company ID, Title, Course ID, Date, Created By Educator ID, and Type are required to create an exam.", 400);
  }

  // Validate ExamType
  if (!VALID_EXAM_TYPES.includes(type)) {
    return formatResponse(false, null, `Invalid exam type: ${type}. Must be one of ${VALID_EXAM_TYPES.join(', ')}.`, 400);
  }

  // Validate courseId exists
  const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) {
    return formatResponse(false, null, "Provided courseId does not exist.", 400);
  }

  // Validate createdByEducatorId exists
  const existingEducator = await prisma.educator.findUnique({ where: { id: createdByEducatorId } });
  if (!existingEducator) {
    return formatResponse(false, null, "Provided createdByEducatorId does not exist.", 400);
  }

  // Parse date and time fields
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return formatResponse(false, null, "Invalid date format. Expected YYYY-MM-DD.", 400);
  }

  const parsedStartTime = formatTimeToISO(startTime);
  const parsedEndTime = formatTimeToISO(endTime);

  if (parsedStartTime && parsedEndTime && parsedStartTime >= parsedEndTime) {
    return formatResponse(false, null, "Start time must be before end time.", 400);
  }

  const durationMinutesNumber = parseInt(durationMinutes, 10);
  if (isNaN(durationMinutesNumber) || durationMinutesNumber <= 0) {
    return formatResponse(false, null, "Invalid durationMinutes. Must be a positive number.", 400);
  }

  try {
    const newExam = await prisma.exam.create({
      data: {
        companyId,
        title,
        description,
        courseId,
        classroomId: classroomId || null,
        date: parsedDate,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        location,
        notes,
        type,
        totalPoints: totalPoints !== undefined ? totalPoints : 100,
        isPublished: isPublished !== undefined ? isPublished : false,
        createdByEducatorId,
        isOnline: isOnline !== undefined ? isOnline : false,
        durationMinutes: durationMinutesNumber,
        autoGrade: autoGrade !== undefined ? autoGrade : false,
      },
      include: {
        course: { select: { id: true, title: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        createdByEducator: { select: { id: true, user: { select: { name: true, email: true } } } },
        _count: { select: { questions: true, submissions: true } },
      },
    });

    const responseData = transformExamResponse(newExam);
    return formatResponse(true, { data: responseData }, null, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "An exam with the same course, date, and start time already exists for this company.", 409);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getExams);
export const POST = withApiHandler(createExam);
