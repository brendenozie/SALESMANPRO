/**
 * POST /api/admin/school-ai/generate-story
 *
 * Generates a children's story draft for the younger student activity system.
 * Can be saved as an Activity in the early learning system after teacher approval.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { schoolAIService, StoryGenerationInput } from "@/lib/school/schoolAIService";
import { v4 as uuidv4 } from "uuid";

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      title,
      theme,
      ageGroup,
      pageCount,
      moralLesson,
      characters,
      setting,
      language,
      companyId,
    } = body;

    if (!theme || !ageGroup || !pageCount || !companyId) {
      return formatResponse(
        false,
        null,
        "theme, ageGroup, pageCount, and companyId are required",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    const input: StoryGenerationInput = {
      title,
      theme,
      ageGroup,
      pageCount: Math.min(Math.max(Number(pageCount), 4), 12),
      moralLesson,
      characters,
      setting,
      language: language ?? "English",
    };

    const draft = await schoolAIService.generateStory(
      input,
      companyId,
      userId,
      `story_gen_${uuidv4()}`
    );

    return formatResponse(
      true,
      {
        ...draft,
        isDraft: true,
        hint: "Each page includes an illustrationPrompt you can send to the AI Image Generator to create visuals.",
      },
      "Story draft generated",
      200
    );
  },
  { requireAuth: true }
);
