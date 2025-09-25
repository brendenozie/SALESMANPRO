import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/exam-submissions
// Fetches exam submissions, filtered by companyId (required) and optionally by examId, studentId, courseId, or createdByEducatorId.
export async function GET(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId'); // Filter by exam's course
    const createdByEducatorId = searchParams.get('createdByEducatorId'); // Filter by exam's creator

    const whereClause: any = {};

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch exam submissions." }, { status: 400 });
    }

    // Always filter by companyId, either directly or via exam relation
    whereClause.exam = { companyId: companyId };

    if (examId) {
      whereClause.examId = examId;
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }
    if (courseId) {
      whereClause.exam.courseId = courseId; // Filter via the nested exam relation
    }
    if (createdByEducatorId) {
      whereClause.exam.createdByEducatorId = createdByEducatorId; // Filter via the nested exam relation
    }

    const submissions = await prisma.examSubmission.findMany({
      where: whereClause,
      include: {
        exam: { // Include comprehensive exam details
          select: {
            id: true,
            title: true,
            type: true, // ExamType
            totalPoints: true,
            isOnline: true,
            date: true, // Include exam date for sorting/filtering
            course: {
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
            createdByEducator: { // Include educator who created the exam
              select: {
                id: true,
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
        student: { // Include student details
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
            academicLevel: { // Include academic level for student profile
                select: { id: true, name: true }
            }
          },
        },
      },
      orderBy: {
        submittedAt: 'desc', // Default order by most recent submission
      },
    });

    // Transform the data to include flattened relations
    const response = submissions.map((submission) => {
      const courseAcademicLevels = submission.exam?.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name }));

      return {
        id: submission.id,
        examId: submission.examId,
        examTitle: submission.exam?.title || 'N/A',
        examType: submission.exam?.type || 'N/A',
        examTotalPoints: submission.exam?.totalPoints || 0,
        examIsOnline: submission.exam?.isOnline || false,
        examDate: submission.exam?.date.toISOString().split('T')[0] || 'N/A', // Return exam date as YYYY-MM-DD
        examCourseId: submission.exam?.course?.id || 'N/A',
        examCourseTitle: submission.exam?.course?.title || 'N/A',
        examCourseAcademicLevels: courseAcademicLevels || [],
        examCreatedByEducatorId: submission.exam?.createdByEducator?.id || 'N/A',
        examCreatedByEducatorName: submission.exam?.createdByEducator?.user?.name || 'N/A',
        examCreatedByEducatorEmail: submission.exam?.createdByEducator?.user?.email || 'N/A',
        studentId: submission.studentId,
        studentName: submission.student?.user?.name || 'N/A',
        studentEmail: submission.student?.user?.email || 'N/A',
        studentAcademicLevel: submission.student?.academicLevel?.name || null,
        submittedAt: submission.submittedAt,
        score: submission.score,
        feedback: submission.feedback,
        answers: submission.answers, // JSON object
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching exam submissions for admin overview:", error);
    return NextResponse.json({ message: "Failed to fetch exam submissions", error: error.message }, { status: 500 });
  }
}

