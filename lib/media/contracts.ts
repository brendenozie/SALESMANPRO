export type MediaType = "IMAGE" | "VIDEO" | "BOOK";

export type MediaSource = "LOCAL" | "SERVER" | "AI_GENERATED" | "AI_EDITED";

export type MediaStatus =
  | "PENDING"
  | "ANALYZING"
  | "PROCESSING"
  | "UPLOADING"
  | "READY"
  | "FAILED"
  | "DELETED";

export type MediaJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type MediaAIAction =
  | "GENERATE_IMAGE"
  | "EDIT_IMAGE"
  | "ENHANCE_IMAGE"
  | "REMOVE_BACKGROUND"
  | "REPLACE_BACKGROUND"
  | "UPSCALE_IMAGE"
  | "GENERATE_PRODUCT_IMAGE"
  | "GENERATE_THUMBNAIL"
  | "GENERATE_VIDEO"
  | "EDIT_VIDEO"
  | "GENERATE_CAPTIONS"
  | "GENERATE_BOOK_COVER"
  | "EXTRACT_BOOK_METADATA"
  | "GENERATE_METADATA";

export interface MediaDimensions {
  width?: number;
  height?: number;
  duration?: number;
  fps?: number;
}

export interface MediaMetadata {
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
  category?: string;
  language?: string;

  [key: string]: unknown;
}

export interface MediaAIConfig {
  action: MediaAIAction;

  prompt?: string;

  negativePrompt?: string;

  model?: string;

  provider?: string;

  aspectRatio?: string;

  width?: number;

  height?: number;

  duration?: number;

  variationCount?: number;

  preserveSubject?: boolean;

  metadata?: Record<string, unknown>;
}

export interface MediaAsset {
  id: string;

  ownerId: string;

  tenantId?: string | null;

  type: MediaType;

  source: MediaSource;

  status: MediaStatus;

  originalName?: string | null;

  mimeType?: string | null;

  size?: number | null;

  url?: string | null;

  thumbnailUrl?: string | null;

  dimensions?: MediaDimensions;

  metadata?: MediaMetadata;

  currentVersionId?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface MediaVersion {
  id: string;

  mediaId: string;

  parentVersionId?: string | null;

  version: number;

  source: MediaSource;

  operation?: MediaAIAction | null;

  prompt?: string | null;

  provider?: string | null;

  model?: string | null;

  url: string;

  thumbnailUrl?: string | null;

  mimeType?: string | null;

  size?: number | null;

  dimensions?: MediaDimensions;

  metadata?: MediaMetadata;

  createdAt: string;
}

export interface MediaJob {
  id: string;

  mediaId?: string | null;

  inputVersionId?: string | null;

  outputVersionId?: string | null;

  action: MediaAIAction;

  status: MediaJobStatus;

  progress: number;

  provider?: string | null;

  model?: string | null;

  config: MediaAIConfig;

  error?: string | null;

  createdAt: string;

  startedAt?: string | null;

  completedAt?: string | null;
}
