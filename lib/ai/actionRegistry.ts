/**
 * lib/ai/actionRegistry.ts
 *
 * Centralized AI Action Catalog & Policy Registry for SalesmanPro.
 * Maps every functional business AI activity to a stable action identifier,
 * default capability, credit cost, primary model, fallback model, and deterministic fallback handler.
 */

import { AICapability } from "@prisma/client";

export interface AIActionDefinition {
  actionId: string;
  displayName: string;
  description: string;
  capability: AICapability;
  domain: "COMMERCE" | "WHATSAPP" | "SCHOOL" | "DOCUMENTS" | "MARKETING" | "MEDIA" | "WORKFORCE";
  defaultPrimaryModel: string;
  defaultFallbackModel: string;
  defaultCreditCost: number;
  maxTokens: number;
  temperature: number;
  requiresJsonSchema: boolean;
  supportsDeterministicFallback: boolean;
  isDeterministicPrimaryEligible?: boolean;
}

export const PLATFORM_AI_ACTIONS: Record<string, AIActionDefinition> = {
  // --- 1. COMMERCE & MARKETPLACE ---
  COMMERCE_PRODUCT_DESCRIPTION: {
    actionId: "COMMERCE_PRODUCT_DESCRIPTION",
    displayName: "Product Description & Copywriter",
    description: "Generates high-converting eCommerce titles, bullet points, tags, and marketing copy.",
    capability: AICapability.PRODUCT_CONTENT,
    domain: "COMMERCE",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 2,
    maxTokens: 2048,
    temperature: 0.7,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  COMMERCE_PRODUCT_SEO: {
    actionId: "COMMERCE_PRODUCT_SEO",
    displayName: "Product SEO & Meta Optimizer",
    description: "Generates meta titles, meta descriptions, and search keyword clusters for catalog items.",
    capability: AICapability.PRODUCT_CONTENT,
    domain: "COMMERCE",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 1,
    maxTokens: 1024,
    temperature: 0.4,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  COMMERCE_PRODUCT_ATTRIBUTES: {
    actionId: "COMMERCE_PRODUCT_ATTRIBUTES",
    displayName: "Product Specifications & Attributes",
    description: "Synthesizes structured technical specifications, sizing, and warranty attributes.",
    capability: AICapability.PRODUCT_CONTENT,
    domain: "COMMERCE",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 1,
    maxTokens: 1024,
    temperature: 0.2,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  COMMERCE_MARKETPLACE_COPY: {
    actionId: "COMMERCE_MARKETPLACE_COPY",
    displayName: "Marketplace Listing Enhancer",
    description: "Formats and polishes product listings for Ghuba regional multi-vendor marketplace.",
    capability: AICapability.MARKETPLACE_CONTENT,
    domain: "COMMERCE",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 2,
    maxTokens: 2048,
    temperature: 0.7,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  COMMERCE_STORE_SETUP: {
    actionId: "COMMERCE_STORE_SETUP",
    displayName: "Fast Store Setup Wizard",
    description: "Initializes categories, sample banners, policies, and store structure from merchant description.",
    capability: AICapability.TEXT,
    domain: "COMMERCE",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "gpt-4o-mini",
    defaultCreditCost: 5,
    maxTokens: 3000,
    temperature: 0.5,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },

  // --- 2. WHATSAPP & CUSTOMER MESSAGING ---
  WHATSAPP_CONCIERGE: {
    actionId: "WHATSAPP_CONCIERGE",
    displayName: "WhatsApp Storefront Concierge",
    description: "Processes customer WhatsApp queries, catalog lookups, and order assistance.",
    capability: AICapability.WHATSAPP,
    domain: "WHATSAPP",
    defaultPrimaryModel: "llama-3.3-70b-versatile",
    defaultFallbackModel: "gemini-2.0-flash",
    defaultCreditCost: 1,
    maxTokens: 1000,
    temperature: 0.3,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },

  // --- 3. SCHOOL & EDUCATION ---
  SCHOOL_LESSON_PLAN: {
    actionId: "SCHOOL_LESSON_PLAN",
    displayName: "Educator Lesson Planner",
    description: "Generates curriculum-aligned draft lesson plans with timing, activities, and homework.",
    capability: AICapability.TEXT,
    domain: "SCHOOL",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 2,
    maxTokens: 2500,
    temperature: 0.6,
    requiresJsonSchema: false,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  SCHOOL_ASSIGNMENT_GEN: {
    actionId: "SCHOOL_ASSIGNMENT_GEN",
    displayName: "Educational Assignment & Quiz Creator",
    description: "Creates quizzes, multiple choice questions, and grading rubrics for educators.",
    capability: AICapability.TEXT,
    domain: "SCHOOL",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 2,
    maxTokens: 2500,
    temperature: 0.5,
    requiresJsonSchema: false,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  SCHOOL_GRADING_FEEDBACK: {
    actionId: "SCHOOL_GRADING_FEEDBACK",
    displayName: "Student Grading & Feedback Assistant",
    description: "Drafts constructive formative feedback and score suggestions for teacher review.",
    capability: AICapability.TEXT,
    domain: "SCHOOL",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 1,
    maxTokens: 1000,
    temperature: 0.4,
    requiresJsonSchema: false,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  SCHOOL_REPORT_COMMENT: {
    actionId: "SCHOOL_REPORT_COMMENT",
    displayName: "Report Card Narrative Writer",
    description: "Synthesizes term grades and attendance into positive, professional report remarks.",
    capability: AICapability.TEXT,
    domain: "SCHOOL",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 1,
    maxTokens: 500,
    temperature: 0.5,
    requiresJsonSchema: false,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },

  // --- 4. BUSINESS & DOCUMENT INTELLIGENCE ---
  DOCUMENT_POPULATE: {
    actionId: "DOCUMENT_POPULATE",
    displayName: "Commercial Document Synthesizer",
    description: "Parses user instructions or rough text into structured invoice/quotation line items.",
    capability: AICapability.ANALYSIS,
    domain: "DOCUMENTS",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 1,
    maxTokens: 2048,
    temperature: 0.2,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  MASCOT_DOCUMENT_EXTRACT: {
    actionId: "MASCOT_DOCUMENT_EXTRACT",
    displayName: "Receipt & Bill OCR Data Extractor",
    description: "Extracts vendor, line items, totals, and taxes from uploaded receipts and PDFs.",
    capability: AICapability.ANALYSIS,
    domain: "DOCUMENTS",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "deterministic-extractor",
    defaultCreditCost: 2,
    maxTokens: 2048,
    temperature: 0.1,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },

  // --- 5. MARKETING & SOCIAL MEDIA ---
  MARKETING_EMAIL: {
    actionId: "MARKETING_EMAIL",
    displayName: "Direct-Response Marketing Email",
    description: "Generates high-converting promotional and transactional email campaigns with subject lines.",
    capability: AICapability.SOCIAL_MARKETING,
    domain: "MARKETING",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 2,
    maxTokens: 1500,
    temperature: 0.7,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },
  MARKETING_SOCIAL_POST: {
    actionId: "MARKETING_SOCIAL_POST",
    displayName: "Multi-Platform Social Post Creator",
    description: "Generates tailored social media posts for Instagram, Facebook, TikTok, and YouTube.",
    capability: AICapability.SOCIAL_MARKETING,
    domain: "MARKETING",
    defaultPrimaryModel: "gemini-2.0-flash",
    defaultFallbackModel: "llama-3.3-70b-versatile",
    defaultCreditCost: 1,
    maxTokens: 1000,
    temperature: 0.8,
    requiresJsonSchema: true,
    supportsDeterministicFallback: true,
    isDeterministicPrimaryEligible: true,
  },

  // --- 6. MEDIA STUDIO ---
  MEDIA_PRODUCT_IMAGE: {
    actionId: "MEDIA_PRODUCT_IMAGE",
    displayName: "Product Studio Image Creator",
    description: "Generates studio product photography and marketing hero banners.",
    capability: AICapability.IMAGE,
    domain: "MEDIA",
    defaultPrimaryModel: "dall-e-3",
    defaultFallbackModel: "dall-e-2",
    defaultCreditCost: 20,
    maxTokens: 0,
    temperature: 0.7,
    requiresJsonSchema: false,
    supportsDeterministicFallback: false,
  },
  MEDIA_PRODUCT_VIDEO: {
    actionId: "MEDIA_PRODUCT_VIDEO",
    displayName: "Short Product Video Reel",
    description: "Creates animated promotional reels and video ads for products.",
    capability: AICapability.VIDEO,
    domain: "MEDIA",
    defaultPrimaryModel: "salesman-video-v1",
    defaultFallbackModel: "salesman-video-v1",
    defaultCreditCost: 50,
    maxTokens: 0,
    temperature: 0.7,
    requiresJsonSchema: false,
    supportsDeterministicFallback: false,
  },
};

export class ActionRegistry {
  public static getAction(actionId: string): AIActionDefinition | undefined {
    if (PLATFORM_AI_ACTIONS[actionId]) return PLATFORM_AI_ACTIONS[actionId];

    // Alias map for short and domain-prefixed action IDs
    const aliases: Record<string, string> = {
      PRODUCT_DESCRIPTION: "COMMERCE_PRODUCT_DESCRIPTION",
      PRODUCT_SEO: "COMMERCE_PRODUCT_SEO",
      PRODUCT_ATTRIBUTES: "COMMERCE_PRODUCT_ATTRIBUTES",
      COMMERCE_CATALOG_SYNC: "COMMERCE_MARKETPLACE_COPY",
      WHATSAPP_INQUIRY: "WHATSAPP_CONCIERGE",
      WHATSAPP_INTENT_CLASSIFY: "WHATSAPP_CONCIERGE",
      WHATSAPP_ORDER_ASSIST: "WHATSAPP_CONCIERGE",
      SCHOOL_ASSIGNMENT: "SCHOOL_ASSIGNMENT_GEN",
      SCHOOL_QUIZ: "SCHOOL_ASSIGNMENT_GEN",
      DOCUMENT_POPULATE: "DOCUMENTS_INVOICE_SYNTHESIS",
      DOCUMENT_EXTRACT: "DOCUMENTS_RECEIPT_OCR",
      MARKETING_EMAIL: "MARKETING_EMAIL_CAMPAIGN",
      MARKETING_CAMPAIGN: "MARKETING_CAMPAIGN_STRATEGY",
      SOCIAL_POST_GEN: "MARKETING_SOCIAL_POST",
      PRODUCT_IMAGE: "MEDIA_PRODUCT_IMAGE",
      MEDIA_BANNER_GEN: "MEDIA_PRODUCT_IMAGE",
      WORKFORCE_TASK: "COMMERCE_STORE_SETUP",
      GENERAL_TEXT: "COMMERCE_PRODUCT_DESCRIPTION",
    };

    const targetKey = aliases[actionId];
    return targetKey ? PLATFORM_AI_ACTIONS[targetKey] : undefined;
  }

  public static listAllActions(): AIActionDefinition[] {
    return Object.values(PLATFORM_AI_ACTIONS);
  }

  public static getAllActions(): AIActionDefinition[] {
    return Object.values(PLATFORM_AI_ACTIONS);
  }

  public static listActionsByDomain(domain: string): AIActionDefinition[] {
    return Object.values(PLATFORM_AI_ACTIONS).filter((a) => a.domain === domain);
  }
}

export const actionRegistry = ActionRegistry;

