import { MediaAIAction } from "@prisma/client";
import { MediaAIProvider } from "./provider";
import { ProviderNotAvailableError } from "./errors";
import { AIExecutionContext, MediaAIConfig, AIExecutionResult } from "./types";

export class MediaAIActionRouter {
  private providers: MediaAIProvider[] = [];

  register(provider: MediaAIProvider) {
    this.providers.push(provider);
  }

  getProviderForAction(action: MediaAIAction): MediaAIProvider {
    // Basic routing: grab the first provider that supports this action
    // In production, you can add cost/speed/availability logic here
    const provider = this.providers.find((p) => p.supports(action));
    if (!provider) {
      throw new ProviderNotAvailableError(action);
    }
    return provider;
  }

  async execute(
    action: MediaAIAction,
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    const provider = this.getProviderForAction(action);
    return provider.execute(action, config, context);
  }
}

export const aiRouter = new MediaAIActionRouter();
