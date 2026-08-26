import { NextRequest, NextResponse } from "next/server";

import { createMediaAIJob } from "@/lib/media/mediaAIService";

import { MediaAIConfig } from "@/lib/media/contracts";
import { MediaAIAction } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    /*
     * Replace this with your existing
     * authentication helper.
     */
    const userId = "authenticated-user";

    const body = await request.json();

    const { mediaId, inputVersionId, action, config, tenantId } = body;

    if (!action || !Object.values(MediaAIAction).includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid media AI action",
        },
        { status: 400 },
      );
    }

    const job = await createMediaAIJob({
      userId,
      tenantId,

      mediaId,
      inputVersionId,

      action: action as MediaAIAction,

      config: config as MediaAIConfig,
    });

    return NextResponse.json({
      success: true,

      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
      },
    });
  } catch (error) {
    console.error("MEDIA_AI_ERROR", error);

    return NextResponse.json(
      {
        error: "Unable to create media AI job",
      },
      { status: 500 },
    );
  }
}
