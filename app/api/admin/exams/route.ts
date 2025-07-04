import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid ExamTypes (must match your Prisma enum)
const VALID_EXAM_TYPES = ["QUIZ", "UNIT_TEST", "MIDTERM", "FINAL", "ASSIGNMENT_BASED", "PRACTICE", "OTHER"];

// Helper function to format time (HH:MM) to ISO string with a dummy date
const formatTimeToISO = (time: string | null | undefined): Date | undefined => {
  if (!time) return undefined;
  // Use a dummy date (e.g., 1970-01-01) for the date part, only time is relevant
  const date = new Date(`1970-01-01T${time}:00Z`);
  return isNaN(date.getTime()) ? undefined : date;
};

// Helper function to format ISO string to HH:MM
const formatISOToHHMM = (isoString: Date | null | undefined): string | null => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};


// GET /api/exams
// Fetches all exams, optionally filtered by companyId, courseId, educatorId, type, isPublished.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const courseId = searchParams.get('courseId');
    const createdByEducatorId = searchParams.get('createdByEducatorId');
    const type = searchParams.get('type'); // Filter by ExamType
    const isPublished = searchParams.get('isPublished'); // Filter by boolean 'true' or 'false'

    const whereClause: any = {};

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch exams." }, { status: 400 });
    }
    whereClause.companyId = companyId;

    if (courseId) {
      whereClause.courseId = courseId;
    }
    if (createdByEducatorId) {
      whereClause.createdByEducatorId = createdByEducatorId;
    }
    if (type) {
      if (!VALID_EXAM_TYPES.includes(type.toUpperCase())) {
        return NextResponse.json({ message: `Invalid exam type: ${type}. Must be one of ${VALID_EXAM_TYPES.join(', ')}.` }, { status: 400 });
      }
      whereClause.type = type.toUpperCase();
    }
    if (isPublished !== null) { // Check if parameter exists
      whereClause.isPublished = isPublished === 'true';
    }

    const exams = await prisma.exam.findMany({
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
        createdByEducator: { // Include educator details
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        _count: { // Count related questions and submissions
          select: {
            questions: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        date: 'desc', // Order by most recent exam date
      },
    });

    // Transform the data to include flattened relations and calculated counts
    const response = exams.map((exam) => {
      const courseAcademicLevels = exam.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name }));

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId,
        courseTitle: exam.course?.title || 'N/A',
        courseAcademicLevels: courseAcademicLevels || [],
        date: exam.date.toISOString().split('T')[0], // Return date as YYYY-MM-DD
        startTime: formatISOToHHMM(exam.startTime), // Return time as HH:MM
        endTime: formatISOToHHMM(exam.endTime),     // Return time as HH:MM
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
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ message: "Failed to fetch exams", error: error.message }, { status: 500 });
  }
}

// POST /api/exams
// Creates a new Exam.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
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
    } = body;

    // Basic validation
    if (!companyId || !title || !courseId || !date || !createdByEducatorId || !type) {
      return NextResponse.json({ message: "Company ID, Title, Course ID, Date, Created By Educator ID, and Type are required to create an exam." }, { status: 400 });
    }

    // Validate ExamType
    if (!VALID_EXAM_TYPES.includes(type)) {
      return NextResponse.json({ message: `Invalid exam type: ${type}. Must be one of ${VALID_EXAM_TYPES.join(', ')}.` }, { status: 400 });
    }

    // Validate courseId exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!existingCourse) {
      return NextResponse.json({ message: "Provided courseId does not exist." }, { status: 400 });
    }

    // Validate createdByEducatorId exists
    const existingEducator = await prisma.educator.findUnique({
      where: { id: createdByEducatorId },
    });
    if (!existingEducator) {
      return NextResponse.json({ message: "Provided createdByEducatorId does not exist." }, { status: 400 });
    }

    // Parse date and time fields
    const parsedDate = new Date(date); // YYYY-MM-DD will parse correctly to start of day UTC
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: "Invalid date format. Expected YYYY-MM-DD." }, { status: 400 });
    }

    const parsedStartTime = formatTimeToISO(startTime);
    const parsedEndTime = formatTimeToISO(endTime);

    if (parsedStartTime && parsedEndTime && parsedStartTime >= parsedEndTime) {
      return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
    }

    const durationMinutesNumber = parseInt(durationMinutes, 10);
    if (isNaN(durationMinutesNumber) || durationMinutesNumber <= 0) {
      return NextResponse.json({ message: "Invalid durationMinutes. Must be a positive number." }, { status: 400 });
    } 

    const newExam = await prisma.exam.create({
      data: {
        companyId,
        title,
        description,
        courseId,
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
        durationMinutes:durationMinutesNumber,
        autoGrade: autoGrade !== undefined ? autoGrade : false,
      },
      include: {
        course: { select: { id: true, title: true, academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } } } },
        createdByEducator: { select: { id: true, user: { select: { name: true, email: true } } } },
        _count: { select: { questions: true, submissions: true } },
      },
    });

    // Transform response
    const responseData = {
      id: newExam.id,
      title: newExam.title,
      description: newExam.description,
      courseId: newExam.courseId,
      courseTitle: newExam.course?.title || 'N/A',
      courseAcademicLevels: newExam.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      date: newExam.date.toISOString().split('T')[0],
      startTime: formatISOToHHMM(newExam.startTime),
      endTime: formatISOToHHMM(newExam.endTime),
      location: newExam.location,
      notes: newExam.notes,
      type: newExam.type,
      totalPoints: newExam.totalPoints,
      isPublished: newExam.isPublished,
      createdByEducatorId: newExam.createdByEducatorId,
      createdByEducatorName: newExam.createdByEducator?.user?.name || 'N/A',
      createdByEducatorEmail: newExam.createdByEducator?.user?.email || 'N/A',
      isOnline: newExam.isOnline,
      durationMinutes: newExam.durationMinutes,
      autoGrade: newExam.autoGrade,
      totalQuestions: newExam._count.questions,
      totalSubmissions: newExam._count.submissions,
      companyId: newExam.companyId,
      createdAt: newExam.createdAt,
      updatedAt: newExam.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "An exam with the same course, date, and start time already exists for this company." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create exam", error: error.message }, { status: 500 });
  }
}
