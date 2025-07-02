import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/exam-submissions
// Fetches exam submissions, filtered by examId OR studentId, and companyId.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId');
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch exam submissions." }, { status: 400 });
    }
    whereClause.exam = { companyId: companyId }; // Filter by companyId via the exam relation

    if (examId) {
      whereClause.examId = examId;
    } else if (studentId) {
      whereClause.studentId = studentId;
    } else {
      return NextResponse.json({ message: "Either Exam ID or Student ID is required to fetch exam submissions." }, { status: 400 });
    }

    const submissions = await prisma.examSubmission.findMany({
      where: whereClause,
      include: {
        exam: { // Include exam details
          select: {
            id: true,
            title: true,
            type: true, // ExamType
            totalPoints: true,
            isOnline: true,
            course: { select: { title: true } }, // Include course title from exam
          },
        },
        student: { // Include student details
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
            academicLevel: { // Include academic level if needed for student profile
                select: { id: true, name: true }
            }
          },
        },
      },
      orderBy: {
        submittedAt: 'desc', // Order by most recent submission
      },
    });

    // Transform the data to include flattened relations
    const response = submissions.map((submission) => ({
      id: submission.id,
      examId: submission.examId,
      examTitle: submission.exam?.title || 'N/A',
      examType: submission.exam?.type || 'N/A',
      examTotalPoints: submission.exam?.totalPoints || 0,
      examIsOnline: submission.exam?.isOnline || false,
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
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching exam submissions:", error);
    return NextResponse.json({ message: "Failed to fetch exam submissions", error: error.message }, { status: 500 });
  }
}

