// app/api/teacher/courses/[courseId]/assignments/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define ExamType enum for validation
enum ExamType {
  QUIZ = 'QUIZ',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
}

// GET /api/teacher/courses/[courseId]/assignments
async function getAssignments(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId');

  if (!courseId || !educatorId) {
    return formatResponse(false, null, 'Missing courseId or educatorId', 400);
  }

  try {
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: { id: true, companyId: true, user: { select: { name: true, email: true, role: true } } },
    });

    if (!educator || !educator.user) {
      return formatResponse(false, null, 'Educator not found', 404);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        academicLevels: { select: { academicLevel: { select: { id: true, name: true } } } },
      },
    });

    if (!course) {
      return formatResponse(false, null, 'Course not found', 404);
    }

    const assignments = await prisma.courseAssignment.findMany({
      where: {
        courseId,
        companyId: educator.companyId,
        // OR: [
        //   { type: 'HOMEWORK' },
        //   { type: 'PROJECT' },
        //   { type: 'QUIZ' },
        //   { type: 'OTHER' },
        // ],
      },
      include: { _count: { select: { submissions: true } }, course: true, classroom: true },
      orderBy: { publishedAt: 'asc' },
    });

    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate.toISOString().split('T')[0],
      publishedAt: a.publishedAt.toISOString().split('T')[0],
      maxGrade: a.maxGrade,
      isPublished: a.isPublished,
      location: a.location,
      instructions: a.instructions,
      startTime: a.startTime,
      endTime: a.endTime,
      classroomId: a.classroomId,
      classroomName: a.classroom ? a.classroom.name : null,
      durationMinutes: a.durationMinutes, 
      autoGrade: a.autoGrade,
      status: a.type,
      submissionCount: a._count.submissions,
      displayStatus: ['HOMEWORK', 'PROJECT', 'QUIZ'].includes(a.type) ? 'Published' : 'Draft',
    }));

    const academicLevel = course.academicLevels[0]?.academicLevel ?? { id: 'N/A', name: 'No Academic Level' };

    return formatResponse(true, {
      course: { id: course.id, title: course.title, academicLevelId: academicLevel.id, academicLevelName: academicLevel.name },
      assignments: formattedAssignments,
    }, 'Assignments fetched successfully', 200);

  } catch (error: any) {
    console.error('Error fetching course assignments:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch assignments', 500);
  }
}

// POST /api/teacher/courses/[courseId]/assignments
async function postAssignment(request: Request) {
  const body = await request.json();
  const { id, title, description, dueDate, maxGrade, status, courseId, educatorId, companyId,
    isOnline, durationMinutes, location, instructions, startTime, endTime, classroomId, autoGrade, isPublished
   } = body;

  // Validation
  if (!title || !dueDate || !status || !courseId || !educatorId) {
    return formatResponse(false, null, 'Missing required assignment data', 400);
  }

  const examType = status.toUpperCase() as ExamType;
  if (!(Object.values(ExamType) as string[]).includes(examType)) {
    return formatResponse(false, null, `Invalid assignment status. Must be one of: ${Object.values(ExamType).join(', ')}`, 400);
  }

  // Combine date and time if startTime is provided
    let finalDueDate = new Date(dueDate);
    if (startTime) {
      const [hours, minutes] = startTime.split(':');
      finalDueDate.setHours(parseInt(hours), parseInt(minutes));
    }

  const parsedDueDate = new Date(finalDueDate);
  if (isNaN(parsedDueDate.getTime())) return formatResponse(false, null, 'Invalid due date format', 400);

  try {

     const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: { id: true, companyId: true, user: { select: { name: true, email: true, role: true } } },
    });

    if (!educator || !educator.user) {
      return formatResponse(false, null, 'Educator not found', 404);
    }

    const assignmentData = {
      title,
      description,
      dueDate: parsedDueDate,
      maxGrade: maxGrade,
      type: examType,
      courseId,
      createdById: educator.id,
      companyId: educator.companyId,
      isOnline: isOnline || status === 'QUIZ', 
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
      location: location || null,
      instructions: instructions || null,
      startTime: startTime || null,
      endTime: endTime || null,
      classroomId: classroomId || null,
      autoGrade: autoGrade || false,
      isPublished: isPublished || false,
    };

    let assignment;
    if (id) {
      assignment = await prisma.courseAssignment.update({ where: { id }, data: { ...assignmentData, updatedAt: new Date() } });
    } else {
      assignment = await prisma.courseAssignment.create({ data: assignmentData });
    }

    const formattedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      maxGrade: assignment.maxGrade,
      publishedAt: assignment.publishedAt,
      isPublished: assignment.isPublished,
      status: assignment.type,
      submissionCount: 0,
      displayStatus: ['HOMEWORK', 'PROJECT', 'QUIZ'].includes(assignment.type) ? 'Published' : 'Draft',
    };

    return formatResponse(true, formattedAssignment, id ? 'Assignment updated successfully' : 'Assignment created successfully', id ? 200 : 201);

  } catch (error: any) {
    console.error('Error saving assignment:', error);
    return formatResponse(false, null, error.message || 'Failed to save assignment', 500);
  }
}

// DELETE /api/teacher/assignments/[assignmentId]
async function deleteAssignment(request: Request, { params }: { params: { assignmentId: string } }) {
  const { assignmentId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId');
  const companyId = searchParams.get('companyId');

  if (!assignmentId || !educatorId || !companyId) {
    return formatResponse(false, null, 'Missing assignmentId, educatorId, or companyId', 400);
  }

  try {
    const assignmentToDelete = await prisma.courseAssignment.findUnique({
      where: { id: assignmentId },
      select: { courseId: true, companyId: true, createdById: true },
    });

    if (!assignmentToDelete || assignmentToDelete.companyId !== companyId || assignmentToDelete.createdById !== educatorId) {
      return formatResponse(false, null, 'Assignment not found or unauthorized to delete', 404);
    }

    await prisma.courseAssignment.delete({ where: { id: assignmentId } });

    return formatResponse(true, null, 'Assignment deleted successfully', 200);
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return formatResponse(false, null, error.message || 'Failed to delete assignment', 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getAssignments, { requireAuth: true });
export const POST = withApiHandler(postAssignment, { requireAuth: true });
export const DELETE = withApiHandler(deleteAssignment, { requireAuth: true });
