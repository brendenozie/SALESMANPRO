/**
 * lib/whatsapp/ai/whatsappAI.ts
 *
 * WhatsApp AI orchestrator — uses the Central AI Platform for inference
 * and the shared credit ledger (reserve → infer → finalize / refund).
 */

import { aiService } from "@/lib/ai/aiService";
import { AIPlatformError } from "@/lib/ai/types";
import { buildSystemPrompt } from "./prompts";
import { assembleAIContext, type AssembledAIContext } from "./context";
import { whatsappRepository } from "../repository";
import { whatsappActionSchema, type WhatsAppAction } from "../types";
import type {
  WhatsAppAccount,
  WhatsAppContact,
  WhatsAppConversation,
  WhatsAppMessage,
} from "../types";
import type { AICompletionResult } from "./aiProvider";
import prisma from "@/server/db/prismadb";

function parseStructuredReply(raw: string, json?: Record<string, unknown>): {
  reply: string;
  action: WhatsAppAction | null;
  intent: string;
  sentiment: string;
  confidence: number;
  requiresHuman: boolean;
} {
  const source = json ?? (() => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  })();

  if (!source) {
    return {
      reply: raw || "How can I help you today?",
      action: null,
      intent: "unknown",
      sentiment: "neutral",
      confidence: 0.5,
      requiresHuman: false,
    };
  }

  let action: WhatsAppAction | null = null;
  if (source.action && typeof source.action === "object") {
    const validated = whatsappActionSchema.safeParse(source.action);
    if (validated.success) {
      action = validated.data;
    }
  }

  return {
    reply:
      typeof source.reply === "string"
        ? source.reply
        : "How can I help you with our store today?",
    action,
    intent: typeof source.intent === "string" ? source.intent : "unknown",
    sentiment: typeof source.sentiment === "string" ? source.sentiment : "neutral",
    confidence: typeof source.confidence === "number" ? source.confidence : 0.9,
    requiresHuman: Boolean(source.requiresHuman || source.escalate),
  };
}

export class WhatsAppAIService {
  async processInboundMessage(params: {
    account: WhatsAppAccount;
    contact: WhatsAppContact;
    conversation: WhatsAppConversation;
    message: WhatsAppMessage;
  }): Promise<AICompletionResult> {
    const { account, contact, conversation, message } = params;

    const aiConfig = await prisma.whatsAppAIConfig.findUnique({
      where: { companyId: account.companyId },
    });

    const currentText =
      message.text?.trim() ||
      (message.type === "IMAGE"
        ? "[Customer sent an image]"
        : message.type === "AUDIO"
          ? "[Customer sent a voice note]"
          : message.type === "DOCUMENT"
            ? "[Customer sent a document]"
            : message.type === "VIDEO"
              ? "[Customer sent a video]"
              : message.type === "LOCATION"
                ? "[Customer shared a location]"
                : "");

    if (!currentText) {
      return {
        reply: "I received your message. How can I help you with our store today?",
        action: null,
        intent: "empty",
        sentiment: "neutral",
        confidence: 1,
        model: "offline",
        provider: "SYSTEM" as any,
      };
    }

    const context: AssembledAIContext = await assembleAIContext({
      account,
      contact,
      conversation,
    });

    const systemPrompt = buildSystemPrompt({
      store: context.storeContext,
      customer: context.customerContext,
      catalogPreview: context.catalogPreview,
    });

    const modelId =
      aiConfig?.model ||
      process.env.GROQ_MODEL ||
      process.env.OPENAI_MODEL ||
      "llama-3.3-70b-versatile";

    try {
      const output = await aiService.generateText(
        {
          prompt: currentText,
          systemPrompt,
          modelId,
          temperature: aiConfig?.temperature ?? 0.3,
          maxTokens: aiConfig?.maxTokens ?? 1000,
          jsonSchema: true,
          conversationHistory: context.conversationHistory,
        },
        {
          companyId: account.companyId,
          source: "WHATSAPP",
          feature: "whatsapp_concierge",
          capability: "WHATSAPP",
          idempotencyKey: `whatsapp:${message.id}`,
        },
      );

      const structured = parseStructuredReply(output.text, output.json);

      await whatsappRepository.recordAIUsage({
        companyId: account.companyId,
        conversationId: conversation.id,
        provider:
          output.provider === "OPENAI"
            ? "OPENAI"
            : output.provider === "GEMINI"
              ? "GOOGLE"
              : "CUSTOM",
        model: output.model,
        inputTokens: output.promptTokens,
        outputTokens: output.completionTokens,
        aiCreditsUsed: output.creditsConsumed,
      }).catch(() => undefined);

      await whatsappRepository.updateConversationState(conversation.id, {
        aiIntent: structured.intent,
        aiSummary: structured.reply.slice(0, 100),
        aiConfidence: structured.confidence,
      });

      return {
        reply: structured.reply,
        action: structured.action,
        intent: structured.intent,
        sentiment: structured.sentiment,
        confidence: structured.confidence,
        inputTokens: output.promptTokens,
        outputTokens: output.completionTokens,
        model: output.model,
        provider:
          output.provider === "OPENAI"
            ? "OPENAI"
            : output.provider === "GEMINI"
              ? "GOOGLE"
              : "CUSTOM",
        requiresHuman: structured.requiresHuman,
      };
    } catch (error) {
      console.error("[WHATSAPP_AI_INFERENCE_ERROR]", error);

      if (error instanceof AIPlatformError && error.code === "INSUFFICIENT_CREDITS") {
        return {
          reply:
            "Hello! Our automated AI assistant is currently resting. A human sales representative will be with you shortly to assist!",
          action: null,
          intent: "credit_exhausted",
          sentiment: "neutral",
          confidence: 1,
          model: "offline",
          provider: "SYSTEM" as any,
          requiresHuman: true,
        };
      }

      await prisma.aIUsage.create({
        data: {
          companyId: account.companyId,
          capability: "WHATSAPP",
          provider: "SYSTEM",
          model: modelId,
          source: "WHATSAPP",
          feature: "whatsapp_concierge",
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "AI inference failed",
        },
      }).catch(() => undefined);

      return {
        reply:
          "I'm currently having trouble completing that request. Would you like me to connect you with our support team?",
        action: null,
        intent: "unknown",
        sentiment: "neutral",
        confidence: 0.5,
        model: modelId,
        provider: "SYSTEM" as any,
      };
    }
  }
}

export const whatsappAI = new WhatsAppAIService();
