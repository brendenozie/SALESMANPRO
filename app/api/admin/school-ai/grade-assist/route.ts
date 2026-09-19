/**
 * POST /api/admin/school-ai/grade-assist
 *
 * AI grading assistance — suggests a grade and feedback for a student submission.
 *
 * CRITICAL INVARIANT:
 * This endpoint NEVER writes a grade to the database.
 * It returns suggestedScore and feedback as a DRAFT.
 * The teacher must:
 *   1. Review the suggestion
 *   2. Edit if needed
 *   3. Explicitly save via POST /api/admin/grades
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { schoolAIService, GradingFeedbackInput } from "@/lib/school/schoolAIService";
import { v4 as uuidv4 } from "uuid";

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      submissionText,
      questionText,
      maxPoints,
      rubric,
      subject,
      gradeLevel,
      companyId,
    } = body;

    if (!submissionText || !questionText || !maxPoints || !subject || !companyId) {
      return formatResponse(
        false,
        null,
        "submissionText, questionText, maxPoints, subject, and companyId are required",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    const input: GradingFeedbackInput = {
      submissionText,
      questionText,
      maxPoints: Number(maxPoints),
      rubric,
      subject,
      gradeLevel: gradeLevel ?? "General",
    };

    const draft = await schoolAIService.generateGradingFeedback(
      input,
      companyId,
      userId,
      `grade_assist_${uuidv4()}`
    );

    return formatResponse(
      true,
      {
        ...draft,
        isDraft: true,
        warning: "This is an AI suggestion only. Teacher must review and approve before saving the grade.",
      },
      "Grading suggestion generated",
      200
    );
  },
  { requireAuth: true }
);
