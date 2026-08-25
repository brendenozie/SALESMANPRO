import { MediaAIAction } from "@prisma/client";
import { AIExecutionContext, MediaAIConfig, AIExecutionResult } from "./types";

export interface MediaAIProvider {
  name: string;

  supports(action: MediaAIAction): boolean;

  execute(
    action: MediaAIAction,
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult>;
}

