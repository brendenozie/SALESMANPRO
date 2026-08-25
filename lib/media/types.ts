import { MediaAIAction, MediaAsset, MediaVersion } from "@prisma/client";

export interface AIExecutionContext {
  jobId: string;
  tenantId?: string;
  userId?: string;
  mediaAsset: MediaAsset;
  inputVersion?: MediaVersion;
}

export interface MediaAIConfig {
  prompt?: string;
  preserveSubject?: boolean;
  aspectRatio?: string;
  [key: string]: any;
}

export interface AIExecutionResult {
  url: string; // URL of the generated/edited asset from provider or temp storage
  mimeType: string;
  provider: string;
  model: string;
  metadata?: Record<string, any>;
}
