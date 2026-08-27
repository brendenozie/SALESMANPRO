/**
 * lib/ai/providers/imageProvider.ts
 *
 * Central Image Generation & Processing Provider.
 * Generates visuals, removes/replaces backgrounds, enhances product photos,
 * persists results into S3 / MediaAsset, and links to products / listings.
 */

import prisma from "@/server/db/prismadb";
import { centralOpenAIProvider } from "./openaiProvider";
import {
  AIImageGenerationInput,
  AIImageGenerationOutput,
  AIModelMetadata,
  AIPlatformError,
} from "../types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class CentralImageProvider {
  private s3Client: S3Client | null = null;

  private getS3Client(): S3Client | null {
    if (
      !this.s3Client &&
      process.env.AACCESS_KEY_ID &&
      process.env.ASECRET_ACCESS_KEY &&
      process.env.AS3_BUCKET_NAME
    ) {
      this.s3Client = new S3Client({
        region: process.env.AREGION || "eu-north-1",
        credentials: {
          accessKeyId: process.env.AACCESS_KEY_ID,
          secretAccessKey: process.env.ASECRET_ACCESS_KEY,
        },
      });
    }
    return this.s3Client;
  }

  /**
   * Downloads a temporary URL from the AI provider and persists it in S3 storage.
   */
  private async persistToStorage(
    remoteUrl: string,
    filename: string,
    mimeType = "image/png",
  ): Promise<string> {
    const s3 = this.getS3Client();

    if (!s3 || !process.env.AS3_BUCKET_NAME) {
      // If S3 is not configured, return the direct URL
      return remoteUrl;
    }

    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) return remoteUrl;

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const key = `ai-images/${Date.now()}-${filename}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AS3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL
        ? `https://${process.env.NEXT_PUBLIC_CDN_URL}/${key}`
        : `https://${process.env.AS3_BUCKET_NAME}.s3.${process.env.AREGION || "eu-north-1"}.amazonaws.com/${key}`;

      return cdnUrl;
    } catch (err) {
      console.error("[IMAGE_PERSISTENCE_ERROR]", err);
      return remoteUrl;
    }
  }

  /**
   * Main image execution method.
   */
  public async execute(
    model: AIModelMetadata,
    input: AIImageGenerationInput,
    context: { companyId: string; userId?: string },
  ): Promise<AIImageGenerationOutput> {
    const startTime = Date.now();

    // 1. Build prompt based on action
    let finalPrompt = input.prompt;
    if (input.action === "REMOVE_BACKGROUND") {
      finalPrompt = `Professional product cutout on a pure clean white background, high resolution, isolated subject: ${input.prompt}`;
    } else if (input.action === "REPLACE_BACKGROUND") {
      finalPrompt = `Product placed in an elegant luxury lifestyle commercial setting, soft warm lighting: ${input.prompt}`;
    } else if (input.action === "ENHANCE_IMAGE" || input.action === "PRODUCT_PHOTO") {
      finalPrompt = `Professional studio product photograph, 8k resolution, crisp details, commercial lighting: ${input.prompt}`;
    }

    // 2. Generate with OpenAI / DALL-E 3
    const result = await centralOpenAIProvider.generateImage(model, {
      ...input,
      prompt: finalPrompt,
    });

    // 3. Persist generated images and create MediaAsset records
    const processedImages: Array<{
      url: string;
      width?: number;
      height?: number;
      mimeType?: string;
      mediaAssetId?: string;
    }> = [];

    for (let i = 0; i < result.images.length; i++) {
      const img = result.images[i];
      const filename = `generated_${Date.now()}_${i}.png`;
      const permanentUrl = await this.persistToStorage(img.url, filename, img.mimeType || "image/png");

      // Create first-class MediaAsset & MediaVersion in Prisma
      try {
        const mediaAsset = await prisma.mediaAsset.create({
          data: {
            companyId: context.companyId,
            ownerId: context.userId,
            type: "IMAGE",
            source: "AI_GENERATED",
            status: "READY",
            url: permanentUrl,
            thumbnailUrl: permanentUrl,
            width: img.width || 1024,
            height: img.height || 1024,
            mimeType: img.mimeType || "image/png",
            metadata: {
              prompt: input.prompt,
              action: input.action || "GENERATE_IMAGE",
              model: result.model,
              provider: result.provider,
              productId: input.productId,
              marketplaceListingId: input.marketplaceListingId,
            },
          },
        });

        const mediaVersion = await prisma.mediaVersion.create({
          data: {
            mediaId: mediaAsset.id,
            version: 1,
            source: "AI_GENERATED",
            operation: (input.action as any) || "GENERATE_IMAGE",
            prompt: input.prompt,
            provider: result.provider,
            model: result.model,
            url: permanentUrl,
            thumbnailUrl: permanentUrl,
            width: img.width || 1024,
            height: img.height || 1024,
            mimeType: img.mimeType || "image/png",
          },
        });

        await prisma.mediaAsset.update({
          where: { id: mediaAsset.id },
          data: { currentVersionId: mediaVersion.id },
        });

        // If a Photo record or Album is desired, link it
        processedImages.push({
          url: permanentUrl,
          width: img.width,
          height: img.height,
          mimeType: img.mimeType,
          mediaAssetId: mediaAsset.id,
        });
      } catch (dbErr) {
        console.error("[MEDIA_ASSET_CREATION_WARNING]", dbErr);
        processedImages.push({
          url: permanentUrl,
          width: img.width,
          height: img.height,
          mimeType: img.mimeType,
        });
      }
    }

    return {
      images: processedImages,
      model: result.model,
      provider: result.provider,
      creditsConsumed: result.creditsConsumed,
      status: "COMPLETED",
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const centralImageProvider = new CentralImageProvider();
