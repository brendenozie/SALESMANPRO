import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/route.ts
// app/api/sales-agents/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import bcrypt from "bcryptjs";

// POST: Input or Update a Grade
export const POST = withApiHandler(async (request, context) => {
  const body = await request.json();
  const { 
    studentId, 
    courseId, 
    examId, 
    courseAssignmentId, 
    score, 
    comments, 
    term,
    year,
    companyId, //= context.user?.companyId // Get companyId from authenticated user context
    academicLevelAtTimeOfGradingId
  } = body;
  
  // const companyId = context.user?.companyId;
  const educatorId = context.user?.id; // Assuming the logged-in user is the educator

  if (!studentId || !courseId || score === undefined || !educatorId) {
    return formatResponse(false, null, "Missing required grading fields", 400);
  }

  const grade = await prisma.grade.create({
    data: {
      studentId,
      courseId,
      examId: examId || null,
      courseAssignmentId: courseAssignmentId || null,
      score: parseFloat(score),
      comments,
      recordedById: educatorId,
      companyId,
      term,
      year,
      academicLevelAtTimeOfGradingId,
      // gradeValue could be calculated here (e.g., if score > 90, "A")
      gradeValue: score >= 50 ? "Pass" : "Fail" 
    }
  });

  return formatResponse(true, grade, "Grade recorded successfully", 201);
}, { requireAuth: true });