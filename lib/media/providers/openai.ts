import { MediaAIAction } from "@prisma/client";
import { MediaAIProvider } from "../provider";
import { AIExecutionContext, MediaAIConfig, AIExecutionResult } from "../types";
import OpenAI from "openai"; // npm install openai

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAIImageProvider implements MediaAIProvider {
  name = "OpenAI_DALL_E";

  supports(action: MediaAIAction): boolean {
    return [MediaAIAction.GENERATE_IMAGE, MediaAIAction.EDIT_IMAGE].includes(
      action,
    );
  }

  async execute(
    action: MediaAIAction,
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    if (action === MediaAIAction.GENERATE_IMAGE) {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: config.prompt || "A generic placeholder",
        n: 1,
        size: "1024x1024",
      });

      return {
        url: response.data[0].url as string,
        mimeType: "image/png",
        provider: this.name,
        model: "dall-e-3",
      };
    }

    throw new Error("Action execution not implemented yet for this provider");
  }
}
