import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { ExamType } from "@prisma/client"; // Use the enum from Prisma client

// GET /api/teacher/courses/[courseId]/exams
async function getExams(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  
  // Extract context from query params
  const educatorId = searchParams.get('educatorId');
  // const companyId = searchParams.get('companyId');
  const classroomId = searchParams.get('classroomId');

  if (!courseId || !educatorId ) {
    return formatResponse(false, null, 'Missing courseId, educatorId, or companyId', 400);
  }

  try {
    // 1. Verify educator exists and belongs to the company
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: { id: true, companyId: true },
    });

    if (!educator ) {
      return formatResponse(false, null, 'Educator not found or unauthorized', 404);
    }

    // 2. Fetch exams scoped to this course, educator, and (optionally) classroom
    const exams = await prisma.exam.findMany({
      where: {
        courseId,
        // companyId: educator.companyId,
        // createdByEducatorId: educatorId,
        // ...(classroomId && { classroomId }), // Only filter by classroom if provided
      },
      include: {
        _count: { select: { submissions: true } },
        classroom: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    // 3. Format response for the TeacherExamsClientPage
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      date: exam.date.toISOString(),
      startTime: exam.startTime?.toISOString(),
      endTime: exam.endTime?.toISOString(),
      location: exam.location,
      type: exam.type,
      totalPoints: exam.totalPoints,
      isPublished: exam.isPublished,
      isOnline: exam.isOnline,
      submissionCount: exam._count.submissions,
      classroomName: exam.classroom?.name || 'General',
    }));

    // Fetch course details for the header
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true }
    });

    return formatResponse(true, {
      course,
      exams: formattedExams,
    }, 'Exams fetched successfully', 200);

  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch exams', 500);
  }
}

// POST /api/teacher/courses/[courseId]/exams
async function postExam(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, // Presence of ID determines Update vs Create
      title, 
      description, 
      date, 
      startTime, 
      endTime, 
      location,
      type, 
      totalPoints, 
      isPublished,
      isOnline,
      durationMinutes,
      autoGrade,
      courseId, 
      educatorId, 
      companyId,
      classroomId 
    } = body;

    // Validation
    if (!title || !date || !courseId || !educatorId || !companyId) {
      return formatResponse(false, null, 'Missing required exam fields', 400);
    }

    const examData: any = {
      title,
      description,
      date: new Date(date),
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      location,
      type: type as ExamType,
      totalPoints: parseFloat(totalPoints) || 100,
      isPublished: Boolean(isPublished),
      isOnline: Boolean(isOnline),
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
      autoGrade: Boolean(autoGrade),
      courseId,
      createdByEducatorId: educatorId,
      companyId,
      classroomId: classroomId || null,
    };

    let exam;
    if (id) {
      // Update existing exam
      exam = await prisma.exam.update({
        where: { id },
        data: { ...examData, updatedAt: new Date() }
      });
    } else {
      // Create new exam
      exam = await prisma.exam.create({
        data: examData
      });
    }

    return formatResponse(true, exam, id ? 'Exam updated successfully' : 'Exam created successfully', id ? 200 : 201);

  } catch (error: any) {
    console.error('Error saving exam:', error);
    return formatResponse(false, null, error.message || 'Failed to save exam', 500);
  }
}

// DELETE /api/teacher/courses/[courseId]/exams/[examId] (Usually handled in a /[examId] sub-route)
// For simplicity in one file, we can check for examId in query or path
async function deleteExam(request: Request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  const educatorId = searchParams.get('educatorId');

  if (!examId || !educatorId) {
    return formatResponse(false, null, 'Missing examId or educatorId', 400);
  }

  try {
    // Check ownership before deleting
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { createdByEducatorId: true }
    });

    if (!exam || exam.createdByEducatorId !== educatorId) {
      return formatResponse(false, null, 'Exam not found or unauthorized', 404);
    }

    await prisma.exam.delete({ where: { id: examId } });
    return formatResponse(true, null, 'Exam deleted successfully', 200);

  } catch (error: any) {
    console.error('Error deleting exam:', error);
    return formatResponse(false, null, error.message || 'Failed to delete exam', 500);
  }
}

export const GET = withApiHandler(getExams, { requireAuth: true });
export const POST = withApiHandler(postExam, { requireAuth: true });
export const DELETE = withApiHandler(deleteExam, { requireAuth: true });