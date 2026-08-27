/**
 * lib/ai/agents/agentRunner.ts
 *
 * Safe Multi-Tenant AI Agent Runner for SalesmanPro.
 * Coordinates system instructions, conversation context, tool resolution, and response generation.
 */

import { aiService } from "../aiService";
import { DOMAIN_AGENT_TOOLS } from "./domainTools";
import { AIExecutionContext, AIPlatformError } from "../types";

export interface AgentRunInput {
  prompt: string;
  agentRole?: "SALES_ASSISTANT" | "SUPPORT_REP" | "MARKETING_ADVISOR" | "BUSINESS_ANALYST";
  conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  modelId?: string;
}

export class AgentRunner {
  public async run(input: AgentRunInput, context: AIExecutionContext) {
    const rolePrompts: Record<string, string> = {
      SALES_ASSISTANT:
        "You are an expert, proactive SalesmanPro sales agent. Help customers find products, compare options, understand pricing, and place orders enthusiastically.",
      SUPPORT_REP:
        "You are a helpful, empathetic SalesmanPro customer support specialist. Assist customers with order status, shipping questions, and policies accurately.",
      MARKETING_ADVISOR:
        "You are an eCommerce growth strategist. Provide actionable advice on merchandising, promotions, social media campaigns, and inventory restock.",
      BUSINESS_ANALYST:
        "You are a data-driven retail analyst. Summarize sales performance, highlight top categories, and identify customer trends.",
    };

    const systemPrompt = `${rolePrompts[input.agentRole || "SALES_ASSISTANT"]}
You have access to safe store tools for product search, order lookup, and store information.
Always respond professionally, concisely, and with accurate data.`;

    // 1. Initial reasoning / prompt pass
    const response = await aiService.generateText(
      {
        prompt: input.prompt,
        systemPrompt,
        conversationHistory: input.conversationHistory,
        modelId: input.modelId,
      },
      {
        ...context,
        feature: `agent_${input.agentRole?.toLowerCase() || "sales"}`,
      },
    );

    return {
      reply: response.text,
      model: response.model,
      creditsConsumed: response.creditsConsumed,
    };
  }
}

export const agentRunner = new AgentRunner();
