import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid QuestionTypes (must match your Prisma enum)
const VALID_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "FILL_IN_THE_BLANK", "MATCHING", "NUMERIC"];

// GET /api/exam-questions
// Fetches all exam questions, optionally filtered by examId.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    const whereClause: any = {};

    if (!examId) {
      return NextResponse.json({ message: "Exam ID is required to fetch exam questions." }, { status: 400 });
    }
    whereClause.examId = examId;

    const examQuestions = await prisma.examQuestion.findMany({
      where: whereClause,
      include: {
        exam: { // Include basic exam details
          select: {
            id: true,
            title: true,
            courseId: true,
            course: { select: { title: true } }, // Include course title from exam's course
          },
        },
      },
      orderBy: {
        order: 'asc', // Order questions by their defined order
      },
    });

    // Transform the data to include flattened relations
    const response = examQuestions.map((question) => ({
      id: question.id,
      examId: question.examId,
      examTitle: question.exam?.title || 'N/A',
      examCourseTitle: question.exam?.course?.title || 'N/A',
      questionText: question.questionText,
      imageUrl: question.imageUrl,
      videoUrl: question.videoUrl,
      questionType: question.questionType,
      options: question.options,
      correctAnswer: question.correctAnswer,
      points: question.points,
      order: question.order,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching exam questions:", error);
    return NextResponse.json({ message: "Failed to fetch exam questions", error: error.message }, { status: 500 });
  }
}

// POST /api/exam-questions
// Creates a new ExamQuestion.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      examId,
      questionText,
      imageUrl,
      videoUrl,
      questionType,
      options, // Array of strings
      correctAnswer,
      points,
      order,
    } = body;

    // Basic validation
    if (!examId || !questionText || !questionType || points === undefined || order === undefined) {
      return NextResponse.json({ message: "Exam ID, Question Text, Question Type, Points, and Order are required to create an exam question." }, { status: 400 });
    }

    // Validate QuestionType
    if (!VALID_QUESTION_TYPES.includes(questionType)) {
      return NextResponse.json({ message: `Invalid question type: ${questionType}. Must be one of ${VALID_QUESTION_TYPES.join(', ')}.` }, { status: 400 });
    }

    // Validate examId exists
    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!existingExam) {
      return NextResponse.json({ message: "Provided examId does not exist." }, { status: 400 });
    }

    // Validate options for MULTIPLE_CHOICE
    if (questionType === 'MULTIPLE_CHOICE' && (!Array.isArray(options) || options.length === 0)) {
      return NextResponse.json({ message: "Options array is required for MULTIPLE_CHOICE questions." }, { status: 400 });
    }

    const pointsValue = typeof points === 'number' ? points : parseFloat(points);
    if (isNaN(pointsValue) || pointsValue < 0) {  
      return NextResponse.json({ message: "Points must be a non-negative number." }, { status: 400 });
    }

    const orderValue = typeof order === 'number' ? order : parseInt(order, 10);
    if (isNaN(orderValue) || orderValue < 0) {
      return NextResponse.json({ message: "Order must be a non-negative number." }, { status: 400 });
    }

    const newQuestion = await prisma.examQuestion.create({
      data: {
        examId,
        questionText,
        imageUrl,
        videoUrl,
        questionType,
        options: options || [], // Ensure it's an array, even if empty
        correctAnswer,
        points: pointsValue,
        order: orderValue,
      },
      include: {
        exam: { select: { id: true, title: true, course: { select: { title: true } } } },
      },
    });

    // Transform response
    const responseData = {
      id: newQuestion.id,
      examId: newQuestion.examId,
      examTitle: newQuestion.exam?.title || 'N/A',
      examCourseTitle: newQuestion.exam?.course?.title || 'N/A',
      questionText: newQuestion.questionText,
      imageUrl: newQuestion.imageUrl,
      videoUrl: newQuestion.videoUrl,
      questionType: newQuestion.questionType,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      points: newQuestion.points,
      order: newQuestion.order,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating exam question:", error);
    return NextResponse.json({ message: "Failed to create exam question", error: error.message }, { status: 500 });
  }
}
