import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";
import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";

const VALID_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "FILL_IN_THE_BLANK", "MATCHING", "NUMERIC"];

// OPTIMIZATION: Use a 'select' object to flatten data directly in the database.
// This eliminates the need for the transformQuestionResponse function entirely.
const QUESTION_SELECT = {
  id: true,
  questionText: true,
  imageUrl: true,
  videoUrl: true,
  questionType: true,
  options: true,
  correctAnswer: true,
  points: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  examId: true,
  exam: {
    select: {
      title: true,
      course: { select: { title: true } }
    }
  }
};

// Helper to handle the final flat structure after DB fetch
const flatten = (q: any) => ({
  ...q,
  examTitle: q.exam?.title || 'N/A',
  examCourseTitle: q.exam?.course?.title || 'N/A',
  exam: undefined // Remove the nested object
});

export const GET = withApiHandler(async (request, context) => {
  const { id } = context.params;

  const cacheKey = `examQuestion:${id}`;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    return formatResponse(true, cached, null, 200);
  }

  const question = await prisma.examQuestion.findUnique({
    where: { id },
    select: QUESTION_SELECT
  });

  if (!question) return formatResponse(false, null, "Question not found", 404);

  const responseData = flatten(question);
  await cacheSet(cacheKey, responseData, 120); // Cache for 2min
  return formatResponse(true, responseData, null, 200);
  
});

export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();
  const { questionType, options, ...updateData } = body;

  // OPTIMIZATION: Fast Validation
  if (questionType && !VALID_QUESTION_TYPES.includes(questionType)) {
    return formatResponse(false, null, `Invalid type: ${questionType}`, 400);
  }

  if (questionType === 'MULTIPLE_CHOICE' && (!options || options.length === 0)) {
    return formatResponse(false, null, "Multiple choice requires options", 400);
  }

  try {
    // OPTIMIZATION: Atomic Update (Removes the 'findUnique' pre-check)
    const updated = await prisma.examQuestion.update({
      where: { id },
      data: {
        ...updateData,
        ...(questionType && { questionType }),
        ...(options && { options })
      },
      select: QUESTION_SELECT
    });

    const cacheKey = `examQuestion:${id}`;
    await cacheSet(cacheKey, flatten(updated), 120); // Update cache with new data
    
    try {
      await cacheDel(`tenant:${id}:assignment-questions:*`);
      await cacheDel(`admin:assignment-questions:*`);
    } catch (e) {}
    return formatResponse(true, flatten(updated), null, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Question not found", 404);
    }
    throw error;
  }
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;

  try {
    // OPTIMIZATION: Atomic Delete
    await prisma.examQuestion.delete({ where: { id } });
    const cacheKey = `examQuestion:${id}`;
    await cacheDel(cacheKey); // Remove from cache
    return formatResponse(true, { message: "Deleted successfully", deletedId: id }, null, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return formatResponse(false, null, "Not found", 404);
      if (error.code === 'P2003') return formatResponse(false, null, "Cannot delete: association exists", 409);
    }
    throw error;
  }
});