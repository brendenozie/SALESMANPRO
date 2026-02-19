import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from "@/lib/verifyAuth"; // Existing import

// Define valid QuestionTypes (must match your Prisma enum)
const VALID_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "FILL_IN_THE_BLANK", "MATCHING", "NUMERIC"];

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

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
// GET /api/exam-questions/[id]
// Fetches a single ExamQuestion by its ID.
// =======================================================================
async function getQuestion(request: Request, { params }: Params) {
  
  const { id } = params;

  const cacheKey = `admin:exam-questions:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const question = await prisma.examQuestion.findUnique({
    where: { id },
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
  });

  try {
    if (question) {
      await cacheSet(cacheKey, question, 60);
    }
  } catch (e) {}

  if (!question) {
    return formatResponse(false, null, "Exam question not found", 404);
  }

  const responseData = transformQuestionResponse(question);
  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// PATCH /api/exam-questions/[id]
// Updates an existing ExamQuestion by ID.
// =======================================================================
async function updateQuestion(request: Request, { params }: Params) {
  
  const { id } = params;
  const body = await request.json();
  const {
    examId, // Typically not changed
    questionText,
    imageUrl,
    videoUrl,
    questionType,
    options,
    correctAnswer,
    points,
    order,
    ...rest
  } = body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request for exam question:", rest);
  }

  const existingQuestion = await prisma.examQuestion.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    return formatResponse(false, null, "Exam question not found", 404);
  }

  const updateData: any = {};

  if (questionText !== undefined) updateData.questionText = questionText;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
  if (points !== undefined) updateData.points = points;
  if (order !== undefined) updateData.order = order;

  // Validate and update questionType
  const finalQuestionType = questionType || existingQuestion.questionType;
  if (questionType !== undefined) {
    if (!VALID_QUESTION_TYPES.includes(questionType)) {
      return formatResponse(false, null, `Invalid question type: ${questionType}. Must be one of ${VALID_QUESTION_TYPES.join(', ')}.`, 400);
    }
    updateData.questionType = questionType;
  }

  // Validate and update options
  if (options !== undefined) {
    if (!Array.isArray(options)) {
      return formatResponse(false, null, "Options must be an array.", 400);
    }
    // Check for options if the question type is MC (or is being set to MC)
    if (finalQuestionType === 'MULTIPLE_CHOICE' && options.length === 0) {
      return formatResponse(false, null, "Options array cannot be empty for MULTIPLE_CHOICE questions.", 400);
    }
    updateData.options = options;
  }

  if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;

  try {
    const updatedQuestion = await prisma.examQuestion.update({
      where: { id },
      data: updateData,
      include: {
        exam: { select: { id: true, title: true, course: { select: { title: true } } } },
      },
    });

    const responseData = transformQuestionResponse(updatedQuestion);
    
    try { await cacheDel(`admin:exam-questions:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: responseData }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2025') { // Record not found
      return formatResponse(false, null, "Exam question not found.", 404);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// =======================================================================
// DELETE /api/exam-questions/[id]
// Deletes an ExamQuestion by ID.
// =======================================================================
async function deleteQuestion(request: Request, { params }: Params) {

  const { id } = params;

  const existingQuestion = await prisma.examQuestion.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    return formatResponse(false, null, "Exam question not found", 404);
  }

  try {
    const deletedQuestion = await prisma.examQuestion.delete({
      where: { id },
    });

    
    try { await cacheDel(`admin:exam-questions:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: "Exam question deleted successfully", deletedId: deletedQuestion.id }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2003') { // Foreign key constraint failed
      return formatResponse(false, null, "Cannot delete question: It is associated with other records (e.g., student submissions).", 409);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getQuestion);
export const PATCH = withApiHandler(updateQuestion);
export const DELETE = withApiHandler(deleteQuestion);
