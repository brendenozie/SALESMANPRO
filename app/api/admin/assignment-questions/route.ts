import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// --- CONFIG & SCHEMAS ---

const QuestionTypeEnum = z.enum(["multiple_choice", "short_answer", "essay"]);

const CreateQuestionSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  questionText: z.string().min(1, "Question text is required"),
  questionType: QuestionTypeEnum,
  order: z.coerce.number().int(),
  points: z.coerce.number().default(0),
  options: z.array(z.any()).optional().default([]),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  hint: z.string().optional(),
  correctAnswer: z.string().optional(),
});

const QUESTION_SELECT = {
  id: true,
  assignmentId: true,
  questionText: true,
  questionType: true,
  imageUrl: true,
  videoUrl: true,
  hint: true,
  options: true,
  correctAnswer: true,
  points: true,
  order: true,
  createdAt: true,
  assignment: { select: { title: true } }
} as const;

// Cache key helper to prevent typos
const getCacheKey = (id: string) => `assignmentQuestions:${id}`;

const flatten = (q: any) => ({
  ...q,
  assignmentTitle: q.assignment?.title || 'N/A',
  assignment: undefined 
});

// --- API HANDLERS ---

/**
 * GET: Fetches questions for a specific assignment.
 * Strategy: Cache-First -> Database -> Cache-Fill
 */
async function getAssignmentQuestions(request: Request) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('assignmentId');

  if (!assignmentId) {
    return formatResponse(false, null, "Assignment ID required", 400);
  }

  const cacheKey = getCacheKey(assignmentId);

  // 1. OPTIMIZATION: Check Cache BEFORE Database
  const cachedData = await cacheGet(cacheKey);
  if (cachedData) {
    const response = formatResponse(true, cachedData, null, 200);
    response.headers.set('X-Cache', 'HIT');
    return response;
  }

  // 2. Database Fetch (Cache Miss)
  const questions = await prisma.courseAssignmentQuestion.findMany({
    where: { assignmentId },
    select: QUESTION_SELECT,
    orderBy: { order: 'asc' },
  });

  const responseData = questions.map(flatten);

  // 3. Update Cache & Set Edge Headers
  await cacheSet(cacheKey, responseData, 300); // 5 min TTL

  const response = formatResponse(true, responseData, null, 200);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  response.headers.set('X-Cache', 'MISS');
  
  return response;
}

/**
 * POST: Creates a new question and invalidates the cache.
 */
async function createAssignmentQuestion(request: Request) {
  try {
    const body = await request.json();
    const { assignmentId, questionText, questionType, order, points, options } = body;
    
    // 1. OPTIMIZATION: Robust Validation via Zod
    // const validation = CreateQuestionSchema.safeParse(body);
    // if (!validation.success) {
    //   return formatResponse(false, null, validation.error.errors[0].message, 400);
    // }

    // const data = validation.data;

    // 2. Atomic Database Operation
    const newQuestion = await prisma.courseAssignmentQuestion.create({
      data: {
        ...body,
        options: options || [],
        points: points ? parseFloat(points) : 0,
        order: parseInt(order, 10),
      },
      select: QUESTION_SELECT
    });

    // 3. Cache Invalidation
    // We delete the list cache because the order/count of questions has changed
    await cacheDel(getCacheKey(body.assignmentId));

    return formatResponse(true, flatten(newQuestion), null, 201);

  } catch (error: any) {
    // Foreign key constraint failure (Assignment doesn't exist)
    if (error.code === 'P2003') {
      return formatResponse(false, null, "Invalid Assignment ID", 400);
    }
    throw error; // Let withApiHandler handle 500s
  }
}

export const GET = withApiHandler(getAssignmentQuestions);
export const POST = withApiHandler(createAssignmentQuestion);