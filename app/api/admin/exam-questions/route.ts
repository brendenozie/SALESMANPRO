

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from "@/lib/verifyAuth"; // Existing import

// Define valid QuestionTypes (must match your Prisma enum)
const VALID_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "FILL_IN_THE_BLANK", "MATCHING", "NUMERIC"];

// Helper to transform the Prisma question object into the desired API structure
function transformQuestionResponse(question: any) {
  return {
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
  };
}

// =======================================================================
// GET /api/exam-questions
// Fetches all exam questions, optionally filtered by examId.
// =======================================================================
async function getExamQuestions(request: Request) {
  // Authentication is handled by withApiHandler, but we verify here for internal response logic
  


  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');

  const whereClause: any = {};

  if (!examId) {
    return formatResponse(false, null, "Exam ID is required to fetch exam questions.", 400);
  }
  whereClause.examId = examId;

  const examQuestions = await prisma.examQuestion.findMany({
    where: whereClause,
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          courseId: true,
          course: { select: { title: true } },
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  const responseData = examQuestions.map(transformQuestionResponse);
  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// POST /api/exam-questions
// Creates a new ExamQuestion.
// =======================================================================
async function createExamQuestion(request: Request) {
  


  const body = await request.json();
  const {
    examId,
    questionText,
    imageUrl,
    videoUrl,
    questionType,
    options,
    correctAnswer,
    points,
    order,
  } = body;

  // Basic validation
  if (!examId || !questionText || !questionType || points === undefined || order === undefined) {
    return formatResponse(false, null, "Exam ID, Question Text, Question Type, Points, and Order are required to create an exam question.", 400);
  }

  // Validate QuestionType
  if (!VALID_QUESTION_TYPES.includes(questionType)) {
    return formatResponse(false, null, `Invalid question type: ${questionType}. Must be one of ${VALID_QUESTION_TYPES.join(', ')}.`, 400);
  }

  // Validate examId exists
  const existingExam = await prisma.exam.findUnique({
    where: { id: examId },
  });
  if (!existingExam) {
    return formatResponse(false, null, "Provided examId does not exist.", 400);
  }

  // Validate options for MULTIPLE_CHOICE
  if (questionType === 'MULTIPLE_CHOICE' && (!Array.isArray(options) || options.length === 0)) {
    return formatResponse(false, null, "Options array is required for MULTIPLE_CHOICE questions.", 400);
  }

  // Validate and parse points
  const pointsValue = typeof points === 'number' ? points : parseFloat(points);
  if (isNaN(pointsValue) || pointsValue < 0) {
    return formatResponse(false, null, "Points must be a non-negative number.", 400);
  }

  // Validate and parse order
  const orderValue = typeof order === 'number' ? order : parseInt(order, 10);
  if (isNaN(orderValue) || orderValue < 0) {
    return formatResponse(false, null, "Order must be a non-negative number.", 400);
  }

  const newQuestion = await prisma.examQuestion.create({
    data: {
      examId,
      questionText,
      imageUrl,
      videoUrl,
      questionType,
      options: options || [],
      correctAnswer,
      points: pointsValue,
      order: orderValue,
    },
    include: {
      exam: { select: { id: true, title: true, course: { select: { title: true } } } },
    },
  });

  const responseData = transformQuestionResponse(newQuestion);
  return formatResponse(true, { data: responseData }, null, 201);
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getExamQuestions);
export const POST = withApiHandler(createExamQuestion);
