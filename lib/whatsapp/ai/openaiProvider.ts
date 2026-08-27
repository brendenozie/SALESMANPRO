/**
 * lib/whatsapp/ai/openaiProvider.ts
 *
 * OpenAI AI Provider implementation.
 */

import OpenAI from "openai";
import type { AIProvider, AICompletionResult } from "./aiProvider";
import { whatsappActionSchema, type WhatsAppAction } from "../types";

export class OpenAIProvider implements AIProvider {
  readonly name = "OPENAI" as const;
  readonly defaultModel: string;
  private client: OpenAI;

  constructor(options: { apiKey?: string; model?: string }) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }
    this.client = new OpenAI({ apiKey });
    this.defaultModel =
      options.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }

  async processConversation(params: {
    systemPrompt: string;
    conversationHistory: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }>;
    currentMessage: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AICompletionResult> {
    const model = this.defaultModel;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: params.systemPrompt },
      ...params.conversationHistory.slice(-10).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: params.currentMessage },
    ];

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 1000,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        reply: "Hello! How can I help you today?",
        action: null,
      };
    }

    let action: WhatsAppAction | null = null;
    if (parsed.action && typeof parsed.action === "object") {
      const validatedAction = whatsappActionSchema.safeParse(parsed.action);
      if (validatedAction.success) {
        action = validatedAction.data;
      }
    }

    return {
      reply:
        parsed.reply ??
        "Hello! How can I assist you with your shopping or order today?",
      action,
      intent: parsed.intent ?? "unknown",
      sentiment: parsed.sentiment ?? "neutral",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      model,
      provider: this.name,
      requiresHuman: parsed.requiresHuman ?? parsed.escalate ?? false,
    };
  }

  async classifyIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    entities?: Record<string, unknown>;
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: "system",
            content:
              'Classify intent. Return JSON: { "intent": string, "confidence": number, "entities": object }',
          },
          { role: "user", content: message },
        ],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(
        response.choices?.[0]?.message?.content ?? "{}",
      );
      return {
        intent: parsed.intent ?? "general",
        confidence: parsed.confidence ?? 0.8,
        entities: parsed.entities ?? {},
      };
    } catch {
      return { intent: "unknown", confidence: 0.5 };
    }
  }
}
