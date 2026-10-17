/**
 * lib/ai/routing/agentTaskRegistry.ts
 *
 * Explicit Agent and Task Registry for SalesmanPro.
 * Maps real repository AI agents, capabilities, action contracts, execution stages,
 * deterministic suitability, and default routing policies.
 */

import { AICapability } from "../types";
import { AgentPolicyConfig, AIAgentExecutionStage } from "./types";

export interface RegisteredAgentDefinition {
  agentKey: string;
  name: string;
  description: string;
  domain: "COMMERCE" | "WHATSAPP" | "MARKETING" | "SCHOOL" | "DOCUMENTS" | "WORKFORCE" | "MEDIA";
  primaryCapability: AICapability;
  supportedStages: AIAgentExecutionStage[];
  deterministicSuitable: boolean;
  consequentialAction: boolean; // Requires human approval if consequential
  defaultMode: AgentPolicyConfig["defaultMode"];
  defaultPrimaryModel: string;
  defaultFallbackModel: string;
  maxAcceptableLatencyMs: number;
  stageConfigs: Record<string, {
    preferredMode: AgentPolicyConfig["defaultMode"];
    deterministicEligible: boolean;
  }>;
}

export const PLATFORM_AGENTS: Record<string, RegisteredAgentDefinition> = {
  // 1. WhatsApp Customer AI Concierge
  WHATSAPP_CONCIERGE: {
    agentKey: "WHATSAPP_CONCIERGE",
    name: "WhatsApp Storefront Concierge",
    description: "Inbound customer messaging, catalog inquiries, and order tracking on WhatsApp.",
    domain: "WHATSAPP",
    primaryCapability: "WHATSAPP",
    supportedStages: ["INTENT_CLASSIFICATION", "CONTENT_GENERATION", "VALIDATION_FORMAT"],
    deterministicSuitable: true,
    consequentialAction: false,
    defaultMode: "BALANCED",
    defaultPrimaryModel: "llama-3.3-70b-versatile",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 2500,
    stageConfigs: {
      INTENT_CLASSIFICATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      CONTENT_GENERATION: { preferredMode: "BALANCED", deterministicEligible: true },
      VALIDATION_FORMAT: { preferredMode: "COST_FIRST", deterministicEligible: true },
    },
  },

  // 2. AI Social Media Manager
  SOCIAL_MEDIA_MANAGER: {
    agentKey: "SOCIAL_MEDIA_MANAGER",
    name: "AI Social Media Content Strategist",
    description: "Multi-platform campaign plans, Instagram/TikTok captions, and posting schedules.",
    domain: "MARKETING",
    primaryCapability: "SOCIAL_MARKETING",
    supportedStages: ["INTENT_CLASSIFICATION", "CONTENT_GENERATION", "VALIDATION_FORMAT"],
    deterministicSuitable: true,
    consequentialAction: true, // Consequential when publishing to live social feeds
    defaultMode: "QUALITY_FIRST",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 4000,
    stageConfigs: {
      INTENT_CLASSIFICATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      CONTENT_GENERATION: { preferredMode: "QUALITY_FIRST", deterministicEligible: true },
      VALIDATION_FORMAT: { preferredMode: "COST_FIRST", deterministicEligible: true },
    },
  },

  // 3. Autonomous Store Manager Agent
  STORE_MANAGER: {
    agentKey: "STORE_MANAGER",
    name: "Store Operations Manager",
    description: "Autonomous store operations, inventory health, order management, and policy enforcement.",
    domain: "WORKFORCE",
    primaryCapability: "TEXT",
    supportedStages: ["INTENT_CLASSIFICATION", "TOOL_SELECTION", "CONTENT_GENERATION"],
    deterministicSuitable: false,
    consequentialAction: true,
    defaultMode: "BALANCED",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    maxAcceptableLatencyMs: 5000,
    stageConfigs: {
      INTENT_CLASSIFICATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      TOOL_SELECTION: { preferredMode: "BALANCED", deterministicEligible: false },
      CONTENT_GENERATION: { preferredMode: "BALANCED", deterministicEligible: true },
    },
  },

  // 4. Sales & Conversion Agent
  SALES_AGENT: {
    agentKey: "SALES_AGENT",
    name: "Autonomous Sales Closer",
    description: "High-converting product recommendations, bundle discounts, and cart recovery.",
    domain: "WORKFORCE",
    primaryCapability: "PRODUCT_CONTENT",
    supportedStages: ["INTENT_CLASSIFICATION", "CONTENT_GENERATION"],
    deterministicSuitable: true,
    consequentialAction: false,
    defaultMode: "BALANCED",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 3000,
    stageConfigs: {
      INTENT_CLASSIFICATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      CONTENT_GENERATION: { preferredMode: "BALANCED", deterministicEligible: true },
    },
  },

  // 5. Customer Support Agent
  CUSTOMER_SUPPORT: {
    agentKey: "CUSTOMER_SUPPORT",
    name: "Customer Support Specialist",
    description: "Customer service, return policies, resolution of disputed transactions, and ticket triage.",
    domain: "WORKFORCE",
    primaryCapability: "WHATSAPP",
    supportedStages: ["INTENT_CLASSIFICATION", "TOOL_SELECTION", "CONTENT_GENERATION"],
    deterministicSuitable: true,
    consequentialAction: true,
    defaultMode: "BALANCED",
    defaultPrimaryModel: "llama-3.3-70b-versatile",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 3000,
    stageConfigs: {
      INTENT_CLASSIFICATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      CONTENT_GENERATION: { preferredMode: "BALANCED", deterministicEligible: true },
    },
  },

  // 6. Commerce Product Copywriter
  COMMERCE_COPYWRITER: {
    agentKey: "COMMERCE_COPYWRITER",
    name: "eCommerce Copywriter & Merchandiser",
    description: "Produces high-converting titles, descriptions, taglines, and bullet points.",
    domain: "COMMERCE",
    primaryCapability: "PRODUCT_CONTENT",
    supportedStages: ["CONTENT_GENERATION", "VALIDATION_FORMAT"],
    deterministicSuitable: true,
    consequentialAction: false,
    defaultMode: "COST_FIRST",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 2500,
    stageConfigs: {
      CONTENT_GENERATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      VALIDATION_FORMAT: { preferredMode: "COST_FIRST", deterministicEligible: true },
    },
  },

  // 7. Product SEO Specialist
  COMMERCE_SEO: {
    agentKey: "COMMERCE_SEO",
    name: "Product SEO & Meta Architect",
    description: "Generates Google click-through SEO titles, meta descriptions, and keyword clusters.",
    domain: "COMMERCE",
    primaryCapability: "PRODUCT_CONTENT",
    supportedStages: ["DATA_SYNTHESIS", "VALIDATION_FORMAT"],
    deterministicSuitable: true,
    consequentialAction: false,
    defaultMode: "COST_FIRST",
    defaultPrimaryModel: "salesmanpro-deterministic-v1",
    defaultFallbackModel: "gemini-2.0-flash",
    maxAcceptableLatencyMs: 2000,
    stageConfigs: {
      DATA_SYNTHESIS: { preferredMode: "COST_FIRST", deterministicEligible: true },
      VALIDATION_FORMAT: { preferredMode: "COST_FIRST", deterministicEligible: true },
    },
  },

  // 8. Commercial Document Synthesizer
  DOCUMENT_SYNTHESIZER: {
    agentKey: "DOCUMENT_SYNTHESIZER",
    name: "Commercial Invoicing & Quotations Synthesizer",
    description: "Extracts line items, taxes, quantities, and totals into structured invoice records.",
    domain: "DOCUMENTS",
    primaryCapability: "ANALYSIS",
    supportedStages: ["DATA_SYNTHESIS", "VALIDATION_FORMAT"],
    deterministicSuitable: true,
    consequentialAction: true, // Generating financial invoices is consequential
    defaultMode: "BALANCED",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 3000,
    stageConfigs: {
      DATA_SYNTHESIS: { preferredMode: "BALANCED", deterministicEligible: true },
      VALIDATION_FORMAT: { preferredMode: "COST_FIRST", deterministicEligible: true },
    },
  },

  // 9. Educator Curriculum Planner
  SCHOOL_LESSON_PLAN: {
    agentKey: "SCHOOL_LESSON_PLAN",
    name: "School Curriculum & Lesson Architect",
    description: "Curriculum-aligned lesson plans, homework, and assessment rubrics.",
    domain: "SCHOOL",
    primaryCapability: "TEXT",
    supportedStages: ["CONTENT_GENERATION"],
    deterministicSuitable: true,
    consequentialAction: false,
    defaultMode: "BALANCED",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "salesmanpro-deterministic-v1",
    maxAcceptableLatencyMs: 4000,
    stageConfigs: {
      CONTENT_GENERATION: { preferredMode: "BALANCED", deterministicEligible: true },
    },
  },

  // 10. Platform Mascot & Background Worker
  MASCOT_TASK_PLANNER: {
    agentKey: "MASCOT_TASK_PLANNER",
    name: "Platform Mascot & Autonomous Assistant",
    description: "Translates merchant voice/text commands into verified platform workflow actions.",
    domain: "WORKFORCE",
    primaryCapability: "ANALYSIS",
    supportedStages: ["INTENT_CLASSIFICATION", "TOOL_SELECTION", "CONTENT_GENERATION"],
    deterministicSuitable: true,
    consequentialAction: true,
    defaultMode: "BALANCED",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    maxAcceptableLatencyMs: 3000,
    stageConfigs: {
      INTENT_CLASSIFICATION: { preferredMode: "COST_FIRST", deterministicEligible: true },
      TOOL_SELECTION: { preferredMode: "BALANCED", deterministicEligible: false },
      CONTENT_GENERATION: { preferredMode: "BALANCED", deterministicEligible: true },
    },
  },
};

export class AgentTaskRegistry {
  public static getAllAgents(): RegisteredAgentDefinition[] {
    return Object.values(PLATFORM_AGENTS);
  }

  public static getAgent(key: string): RegisteredAgentDefinition | undefined {
    if (!key) return undefined;
    const normalized = key.toUpperCase().replace(/-/g, "_");
    return PLATFORM_AGENTS[key] || PLATFORM_AGENTS[normalized];
  }

  public static resolveStageExecution(
    agentKey: string,
    stage: AIAgentExecutionStage,
  ): {
    mode: AgentPolicyConfig["defaultMode"];
    allowDeterministic: boolean;
  } {
    const agent = this.getAgent(agentKey);
    const stageConf = agent?.stageConfigs?.[stage];
    return {
      mode: stageConf?.preferredMode || agent?.defaultMode || "BALANCED",
      allowDeterministic: stageConf?.deterministicEligible ?? agent?.deterministicSuitable ?? true,
    };
  }

  public static findAgentForAction(actionId: string, feature?: string): RegisteredAgentDefinition | undefined {
    const term = (actionId || feature || "").toUpperCase();
    if (term.includes("WHATSAPP")) return PLATFORM_AGENTS.WHATSAPP_CONCIERGE;
    if (term.includes("SOCIAL") || term.includes("CAMPAIGN")) return PLATFORM_AGENTS.SOCIAL_MEDIA_MANAGER;
    if (term.includes("SEO")) return PLATFORM_AGENTS.COMMERCE_SEO;
    if (term.includes("PRODUCT") || term.includes("DESCRIPTION")) return PLATFORM_AGENTS.COMMERCE_COPYWRITER;
    if (term.includes("DOCUMENT") || term.includes("INVOICE")) return PLATFORM_AGENTS.DOCUMENT_SYNTHESIZER;
    if (term.includes("SCHOOL") || term.includes("LESSON")) return PLATFORM_AGENTS.SCHOOL_LESSON_PLAN;
    if (term.includes("MASCOT")) return PLATFORM_AGENTS.MASCOT_TASK_PLANNER;
    return undefined;
  }
}
