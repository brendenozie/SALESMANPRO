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
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// const VALID_QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];

// // OPTIMIZATION: Use a constant selection object for reusability and speed.
// // Flattening the assignment title directly in the DB.
// const QUESTION_SELECT = {
//   id: true,
//   assignmentId: true,
//   questionText: true,
//   questionType: true,
//   imageUrl: true,
//   videoUrl: true,
//   hint: true,
//   options: true,
//   correctAnswer: true,
//   points: true,
//   order: true,
//   createdAt: true,
//   assignment: { select: { title: true } }
// };

// // Sync mapper to finalize the flat structure
// const flatten = (q: any) => ({
//   ...q,
//   assignmentTitle: q.assignment?.title || 'N/A',
//   assignment: undefined // Remove the nested object
// });

// async function getAssignmentQuestions(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const assignmentId = searchParams.get('assignmentId');

//   if (!assignmentId) return formatResponse(false, null, "Assignment ID required", 400);

//   // OPTIMIZATION: Selective fetch + Order by index
//   const questions = await prisma.courseAssignmentQuestion.findMany({
//     where: { assignmentId },
//     select: QUESTION_SELECT,
//     orderBy: { order: 'asc' },
//   });

//   const responseData = questions.map(flatten);
//   const cacheKey = `assignmentQuestions:${assignmentId}`;
  
//   const cached = await cacheGet(cacheKey);
//   if (cached) {
//     return formatResponse(true, cached, null, 200);
//   }

//   await cacheSet(cacheKey, responseData, 300); // Cache for 5 minutes

//   const response = formatResponse(true, responseData, null, 200);

//   // OPTIMIZATION: Edge Caching
//   // This tells the CDN and browser: "Use the cache for 60s, then refresh in background"
  
//   response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
//   return response;
// }

// async function createAssignmentQuestion(request: Request) {
  // const body = await request.json();
  // const { assignmentId, questionText, questionType, order, points, options } = body;

//   // OPTIMIZATION: Guard clauses (Fast failure)
//   if (!assignmentId || !questionText || !questionType || order === undefined) {
//     return formatResponse(false, null, "Required fields missing", 400);
//   }

//   if (!VALID_QUESTION_TYPES.includes(questionType)) {
//     return formatResponse(false, null, "Invalid question type", 400);
//   }

//   try {
//     const newQuestion = await prisma.courseAssignmentQuestion.create({
      // data: {
      //   ...body,
      //   options: options || [],
      //   points: points ? parseFloat(points) : 0,
      //   order: parseInt(order, 10),
      // },
//       select: QUESTION_SELECT
//     });

//     const cacheKey = `assignmentQuestions:${assignmentId}`;
//     await cacheDel(cacheKey); // Invalidate cache for this assignment
//     return formatResponse(true, flatten(newQuestion), null, 201);
//   } catch (error: any) {
//     // If assignmentId doesn't exist, Prisma throws P2003 (Foreign key)
//     if (error.code === 'P2003') return formatResponse(false, null, "Invalid Assignment ID", 400);
//     throw error;
//   }
// }

// export const GET = withApiHandler(getAssignmentQuestions);
// export const POST = withApiHandler(createAssignmentQuestion);
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// const VALID_QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"]; // Matches your model comments

// function transformQuestionResponse(question: any) {
//   return {
//     id: question.id,
//     assignmentId: question.assignmentId,
//     assignmentTitle: question.assignment?.title || 'N/A',
//     questionText: question.questionText,
//     questionType: question.questionType,
//     imageUrl: question.imageUrl,
//     videoUrl: question.videoUrl,
//     hint: question.hint,
//     options: question.options,
//     correctAnswer: question.correctAnswer,
//     points: question.points,
//     order: question.order,
//     createdAt: question.createdAt,
//     updatedAt: question.updatedAt,
//   };
// }

// async function getAssignmentQuestions(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const assignmentId = searchParams.get('assignmentId');

//   if (!assignmentId) {
//     return formatResponse(false, null, "Assignment ID is required.", 400);
//   }

//   const questions = await prisma.courseAssignmentQuestion.findMany({
//     where: { assignmentId },
//     include: {
//       assignment: { select: { title: true } },
//     },
//     orderBy: { order: 'asc' },
//   });

//   const responseData = questions.map(transformQuestionResponse);
//   return formatResponse(true, { data: responseData }, null, 200);
// }

// async function createAssignmentQuestion(request: Request) {
//   const body = await request.json();
//   const {
//     assignmentId,
//     questionText,
//     questionType,
//     imageUrl,
//     videoUrl,
//     hint,
//     options,
//     correctAnswer,
//     points,
//     order,
//   } = body;

//   // Validation
//   if (!assignmentId || !questionText || !questionType || order === undefined) {
//     return formatResponse(false, null, "Missing required fields: assignmentId, questionText, questionType, or order.", 400);
//   }

//   if (!VALID_QUESTION_TYPES.includes(questionType)) {
//     return formatResponse(false, null, `Invalid type. Must be: ${VALID_QUESTION_TYPES.join(', ')}`, 400);
//   }

//   const newQuestion = await prisma.courseAssignmentQuestion.create({
//     data: {
//       assignmentId,
//       questionText,
//       questionType,
//       imageUrl,
//       videoUrl,
//       hint,
//       options: options || [],
//       correctAnswer,
//       points: points ? parseFloat(points) : 0,
//       order: parseInt(order, 10),
//     },
//     include: {
//       assignment: { select: { title: true } },
//     },
//   });

//   return formatResponse(true, { data: transformQuestionResponse(newQuestion) }, null, 201);
// }

// export const GET = withApiHandler(getAssignmentQuestions);
// export const POST = withApiHandler(createAssignmentQuestion);