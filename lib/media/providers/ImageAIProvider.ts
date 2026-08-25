import { MediaAIAction, MediaAIConfig } from "@/lib/media/contracts";

import {
  AIExecutionContext,
  AIExecutionResult,
  MediaAIProvider,
} from "../ai/MediaAIActionRouter";

export class ImageAIProvider implements MediaAIProvider {
  supports(action: MediaAIAction) {
    return [
      "GENERATE_IMAGE",
      "EDIT_IMAGE",
      "ENHANCE_IMAGE",
      "REMOVE_BACKGROUND",
      "REPLACE_BACKGROUND",
      "UPSCALE_IMAGE",
      "GENERATE_PRODUCT_IMAGE",
      "GENERATE_THUMBNAIL",
    ].includes(action);
  }

  async execute(
    action: MediaAIAction,
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    switch (action) {
      case "GENERATE_IMAGE":
        return this.generate(config);

      case "EDIT_IMAGE":
        return this.edit(config, context);

      case "ENHANCE_IMAGE":
        return this.enhance(config, context);

      case "REMOVE_BACKGROUND":
        return this.removeBackground(config, context);

      case "REPLACE_BACKGROUND":
        return this.replaceBackground(config, context);

      case "UPSCALE_IMAGE":
        return this.upscale(config, context);

      case "GENERATE_PRODUCT_IMAGE":
        return this.generateProductImage(config, context);

      case "GENERATE_THUMBNAIL":
        return this.thumbnail(config, context);

      default:
        throw new Error(`Unsupported image action: ${action}`);
    }
  }

  private async generate(config: MediaAIConfig): Promise<AIExecutionResult> {
    throw new Error("Connect image generation provider");
  }

  private async edit(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect image editing provider");
  }

  private async enhance(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect image enhancement provider");
  }

  private async removeBackground(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect background removal provider");
  }

  private async replaceBackground(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect background replacement provider");
  }

  private async upscale(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect upscaling provider");
  }

  private async generateProductImage(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect product-image provider");
  }

  private async thumbnail(
    config: MediaAIConfig,
    context: AIExecutionContext,
  ): Promise<AIExecutionResult> {
    throw new Error("Connect thumbnail provider");
  }
}
