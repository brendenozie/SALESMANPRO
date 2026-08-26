import {
  MediaAIAction,
  MediaAsset,
  MediaVersion,
} from "@/lib/media/contracts";
import { MediaAIConfig } from "../types";

export interface AIExecutionContext {
  userId: string;

  tenantId?: string;

  media?: MediaAsset;

  inputVersion?: MediaVersion;
}

export interface AIExecutionResult {
  provider: string;

  model?: string;

  output: {
    url: string;

    mimeType?: string;

    width?: number;

    height?: number;

    duration?: number;

    thumbnailUrl?: string;

    metadata?: Record<string, unknown>;
  };
}

export interface MediaAIProvider {
  supports(action: MediaAIAction): boolean;

  execute(
    action: MediaAIAction,
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult>;
}

export class MediaAIActionRouter {
  private providers: MediaAIProvider[] = [];

  register(provider: MediaAIProvider) {
    this.providers.push(provider);
  }

  private resolveProvider(action: MediaAIAction) {
    const provider = this.providers.find((item) => item.supports(action));

    if (!provider) {
      throw new Error(`No AI provider supports action: ${action}`);
    }

    return provider;
  }

  async execute(
    action: MediaAIAction,
    config: MediaAIConfig,
    context: AIExecutionContext,
  ) {
    const provider = this.resolveProvider(action);

    return provider.execute(action, config, context);
  }
}
