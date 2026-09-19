/**
 * POST /api/admin/school-ai/generate-assignment
 *
 * Generates a draft assignment with questions using AI.
 * OUTPUT IS DRAFT — teacher must review before publishing to students.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { schoolAIService, AssignmentGenerationInput } from "@/lib/school/schoolAIService";
import { v4 as uuidv4 } from "uuid";

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      subject,
      topic,
      gradeLevel,
      questionCount,
      questionTypes,
      difficulty,
      instructions,
      rubric,
      companyId,
    } = body;

    if (!subject || !topic || !gradeLevel || !questionCount || !questionTypes || !companyId) {
      return formatResponse(
        false,
        null,
        "subject, topic, gradeLevel, questionCount, questionTypes, and companyId are required",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    const input: AssignmentGenerationInput = {
      subject,
      topic,
      gradeLevel,
      questionCount: Math.min(Number(questionCount), 30),
      questionTypes,
      difficulty: difficulty ?? "medium",
      instructions,
      rubric: Boolean(rubric),
    };

    const draft = await schoolAIService.generateAssignment(
      input,
      companyId,
      userId,
      `assignment_gen_${uuidv4()}`
    );

    return formatResponse(
      true,
      { draft, isDraft: true },
      "Assignment draft generated. Please review before publishing to students.",
      200
    );
  },
  { requireAuth: true }
);
