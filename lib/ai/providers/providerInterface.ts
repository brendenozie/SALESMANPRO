/**
 * lib/ai/providers/providerInterface.ts
 *
 * Abstract provider interface for SalesmanPro Central AI engine.
 */

import {
  AITextGenerationInput,
  AITextGenerationOutput,
  AIImageGenerationInput,
  AIImageGenerationOutput,
  AIVideoGenerationInput,
  AIVideoGenerationOutput,
  AIProviderName,
  AIModelMetadata,
} from "../types";

export interface IAIProvider {
  name: AIProviderName;
  isConfigured(): boolean;

  generateText(
    model: AIModelMetadata,
    input: AITextGenerationInput,
  ): Promise<AITextGenerationOutput>;

  generateImage?(
    model: AIModelMetadata,
    input: AIImageGenerationInput,
  ): Promise<AIImageGenerationOutput>;

  generateVideo?(
    model: AIModelMetadata,
    input: AIVideoGenerationInput,
  ): Promise<AIVideoGenerationOutput>;
}
