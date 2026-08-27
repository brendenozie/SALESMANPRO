/**
 * lib/whatsapp/ai/aiProvider.ts
 *
 * Abstract AI provider interface enabling pluggable LLM backends (Groq, OpenAI, Anthropic, Gemini).
 */

import { WhatsAppAction } from "../types";

export interface AICompletionResult {
  reply: string;
  action?: WhatsAppAction | null;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  inputTokens?: number;
  outputTokens?: number;
  model: string;
  provider: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "CUSTOM";
  requiresHuman?: boolean;
}

export interface AIProviderOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  readonly name: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "CUSTOM";
  readonly defaultModel: string;

  /**
   * Generates a conversational reply and/or structured action from the LLM.
   */
  processConversation(params: {
    systemPrompt: string;
    conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    currentMessage: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AICompletionResult>;

  /**
   * Fast classification of customer intent and sentiment.
   */
  classifyIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    entities?: Record<string, unknown>;
  }>;
}
