/**
 * lib/ai/types.ts
 *
 * Unified TypeScript contracts and interfaces for SalesmanPro Central AI Platform.
 */

import {
  AICapability,
  AICreditTransactionType,
  AICreditTransactionStatus,
  AIGenerationStatus,
} from "@prisma/client";

export { AICapability, AICreditTransactionType, AICreditTransactionStatus, AIGenerationStatus };

export type AIProviderName = "OPENAI" | "GROQ" | "GEMINI" | "STABILITY" | "DALL_E" | "CUSTOM";

export interface AIModelMetadata {
  id: string;
  provider: AIProviderName;
  capability: AICapability;
  displayName: string;
  description: string;
  enabled: boolean;
  isDefault?: boolean;
  inputCreditCost: number; // per 1,000 tokens or base unit
  outputCreditCost: number; // per 1,000 tokens or base unit
  imageCreditCost?: number; // per image
  videoCreditCost?: number; // per second / unit
  minimumCredits: number;
  maxTokens?: number;
  contextWindow?: number;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
  supportsJsonSchema?: boolean;
}

export interface AIExecutionContext {
  companyId: string;
  userId?: string;
  source?: "WEB" | "WHATSAPP" | "API" | "AGENT" | "WORKER";
  feature?: string;
  capability?: AICapability;
  idempotencyKey?: string;
  ipAddress?: string;
}

export interface AITextGenerationInput {
  prompt: string;
  systemPrompt?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  jsonSchema?: boolean;
  conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  context?: Record<string, unknown>;
}

export interface AITextGenerationOutput {
  text: string;
  json?: Record<string, unknown>;
  model: string;
  provider: AIProviderName;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  creditsConsumed: number;
  executionTimeMs: number;
}

export interface AIImageGenerationInput {
  prompt: string;
  modelId?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  size?: "1024x1024" | "1792x1024" | "1024x1792" | "512x512";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  quantity?: number;
  referenceImageUrl?: string;
  action?: "GENERATE_IMAGE" | "EDIT_IMAGE" | "ENHANCE_IMAGE" | "REMOVE_BACKGROUND" | "REPLACE_BACKGROUND" | "PRODUCT_PHOTO";
  productId?: string;
  marketplaceListingId?: string;
}

export interface AIImageGenerationOutput {
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    mimeType?: string;
    mediaAssetId?: string;
  }>;
  model: string;
  provider: AIProviderName;
  creditsConsumed: number;
  jobId?: string;
  status: AIGenerationStatus;
  executionTimeMs: number;
}

export interface AIVideoGenerationInput {
  prompt: string;
  modelId?: string;
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  sourceImageUrl?: string;
  productId?: string;
  marketplaceListingId?: string;
  albumId?: string;
  title?: string;
  description?: string;
}

export interface AIVideoGenerationOutput {
  jobId: string;
  status: AIGenerationStatus;
  estimatedDurationSeconds?: number;
  creditsReserved: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoId?: string;
  mediaAssetId?: string;
}

export interface AICreditBalanceResponse {
  balance: number;
  usedThisMonth: number;
  totalPurchased: number;
  totalUsed: number;
  packages: AIPackageDTO[];
}

export interface AIPackageDTO {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  description?: string | null;
  badge?: string | null;
  isPopular: boolean;
  features: string[];
}

export interface AIUsageRecordDTO {
  id: string;
  capability: AICapability;
  provider: string;
  model: string;
  creditsCost: number;
  source: string;
  feature?: string | null;
  status: string;
  createdAt: string;
  totalTokens?: number;
}

export interface AICreditTransactionDTO {
  id: string;
  amount: number;
  type: AICreditTransactionType;
  status: AICreditTransactionStatus;
  description: string;
  balanceAfter?: number | null;
  createdAt: string;
}

export type AIErrorCode =
  | "UNAUTHORIZED"
  | "TENANT_NOT_FOUND"
  | "TENANT_REQUIRED"
  | "INSUFFICIENT_CREDITS"
  | "MODEL_NOT_FOUND"
  | "MODEL_DISABLED"
  | "AGENT_NOT_FOUND"
  | "AGENT_DISABLED"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "GENERATION_FAILED"
  | "PROVIDER_ERROR"
  | "AI_TEMPORARILY_UNAVAILABLE"
  | "AI_KILLED"
  | "STORAGE_FAILED"
  | "IDEMPOTENCY_CONFLICT";

export class AIPlatformError extends Error {
  public code: AIErrorCode;
  public statusCode: number;
  public details?: unknown;

  constructor(code: AIErrorCode, message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AIPlatformError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
