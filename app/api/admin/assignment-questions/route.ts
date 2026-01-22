import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const VALID_QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"]; // Matches your model comments

function transformQuestionResponse(question: any) {
  return {
    id: question.id,
    assignmentId: question.assignmentId,
    assignmentTitle: question.assignment?.title || 'N/A',
    questionText: question.questionText,
    questionType: question.questionType,
    imageUrl: question.imageUrl,
    videoUrl: question.videoUrl,
    hint: question.hint,
    options: question.options,
    correctAnswer: question.correctAnswer,
    points: question.points,
    order: question.order,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
  };
}

async function getAssignmentQuestions(request: Request) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('assignmentId');

  if (!assignmentId) {
    return formatResponse(false, null, "Assignment ID is required.", 400);
  }

  const questions = await prisma.courseAssignmentQuestion.findMany({
    where: { assignmentId },
    include: {
      assignment: { select: { title: true } },
    },
    orderBy: { order: 'asc' },
  });

  const responseData = questions.map(transformQuestionResponse);
  return formatResponse(true, { data: responseData }, null, 200);
}

async function createAssignmentQuestion(request: Request) {
  const body = await request.json();
  const {
    assignmentId,
    questionText,
    questionType,
    imageUrl,
    videoUrl,
    hint,
    options,
    correctAnswer,
    points,
    order,
  } = body;

  // Validation
  if (!assignmentId || !questionText || !questionType || order === undefined) {
    return formatResponse(false, null, "Missing required fields: assignmentId, questionText, questionType, or order.", 400);
  }

  if (!VALID_QUESTION_TYPES.includes(questionType)) {
    return formatResponse(false, null, `Invalid type. Must be: ${VALID_QUESTION_TYPES.join(', ')}`, 400);
  }

  const newQuestion = await prisma.courseAssignmentQuestion.create({
    data: {
      assignmentId,
      questionText,
      questionType,
      imageUrl,
      videoUrl,
      hint,
      options: options || [],
      correctAnswer,
      points: points ? parseFloat(points) : 0,
      order: parseInt(order, 10),
    },
    include: {
      assignment: { select: { title: true } },
    },
  });

  return formatResponse(true, { data: transformQuestionResponse(newQuestion) }, null, 201);
}

export const GET = withApiHandler(getAssignmentQuestions);
export const POST = withApiHandler(createAssignmentQuestion);