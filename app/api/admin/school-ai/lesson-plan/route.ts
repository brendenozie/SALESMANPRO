/**
 * POST /api/admin/school-ai/lesson-plan
 *
 * Generates a structured lesson plan draft using AI.
 * OUTPUT IS DRAFT ONLY — teacher must review, edit, and approve.
 * Credits are charged from the company's AI credit balance.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { schoolAIService, LessonPlanInput } from "@/lib/school/schoolAIService";
import { v4 as uuidv4 } from "uuid";
import { enforceAiStudioAccess } from "@/lib/subscriptions/enforce-limits";

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      subject,
      topic,
      gradeLevel,
      duration,
      objectives,
      style,
      curriculum,
      priorKnowledge,
      companyId,
    } = body;

    if (!subject || !topic || !gradeLevel || !duration || !companyId) {
      return formatResponse(
        false,
        null,
        "subject, topic, gradeLevel, duration, and companyId are required",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    const aiCheck = await enforceAiStudioAccess(companyId);
    if (!aiCheck.allowed) {
      return formatResponse(false, { upgradeRequired: aiCheck.upgradeRequired }, aiCheck.message, 403);
    }

    const input: LessonPlanInput = {
      subject,
      topic,
      gradeLevel,
      duration: Number(duration),
      objectives,
      style,
      curriculum,
      priorKnowledge,
    };

    const draft = await schoolAIService.generateLessonPlan(
      input,
      companyId,
      userId,
      `lesson_plan_${uuidv4()}`
    );

    return formatResponse(
      true,
      { draft, isDraft: true },
      "Lesson plan draft generated. Please review and edit before saving.",
      200
    );
  },
  { requireAuth: true }
);
