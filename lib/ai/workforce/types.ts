/**
 * lib/ai/workforce/types.ts
 *
 * Core TypeScript contracts for the SalesmanPro + Ghuba 3-Tier AI Agent Workforce.
 */

import {
  AgentWorkforceLevel,
  AgentPermissionLevel,
  AgentTaskStatus,
  AgentApprovalStatus,
  AgentMemoryScope,
  ProspectStatus,
} from "@prisma/client";

export type ProspectOutreachChannel = "EMAIL" | "WHATSAPP" | "PHONE" | "SMS";

export {
  AgentWorkforceLevel,
  AgentPermissionLevel,
  AgentTaskStatus,
  AgentApprovalStatus,
  AgentMemoryScope,
  ProspectStatus,
};

// ============================================================================
// AGENT IDENTIFIERS
// ============================================================================

export type StoreAgentKey =
  | "STORE_MANAGER"
  | "SALES_AGENT"
  | "SUPPORT_AGENT"
  | "MARKETING_MANAGER"
  | "SOCIAL_MEDIA_MANAGER"
  | "INVENTORY_MANAGER"
  | "BUSINESS_ANALYST"
  | "RETENTION_AGENT"
  | "LEAD_CRM_AGENT"
  | "STORE_MARKETPLACE_AGENT"
  | "FINANCE_ASSISTANT"
  | "APPOINTMENT_AGENT"
  | "STORE_ONBOARDING_AGENT";

export type PlatformAgentKey =
  | "GROWTH_AGENT"
  | "PROSPECT_RESEARCH_AGENT"
  | "OUTBOUND_AGENT"
  | "PLATFORM_SALES_AGENT"
  | "DEMO_AGENT"
  | "ONBOARDING_SALESMANPRO_AGENT"
  | "SEO_AGENT"
  | "PARTNERSHIP_AGENT"
  | "CHURN_RETENTION_AGENT";

export type GhubaAgentKey =
  | "SUPPLY_ACQUISITION_AGENT"
  | "DEMAND_INTELLIGENCE_AGENT"
  | "SELLER_RECRUITMENT_AGENT"
  | "BUYER_ACQUISITION_AGENT"
  | "LIQUIDITY_AGENT"
  | "PLATFORM_MARKETING_AGENT";

export type AnyAgentKey = StoreAgentKey | PlatformAgentKey | GhubaAgentKey;

// ============================================================================
// AGENT SPECIFICATION & METADATA
// ============================================================================

export interface AgentDefinition {
  key: AnyAgentKey;
  name: string;
  level: AgentWorkforceLevel;
  roleDescription: string;
  defaultPermission: AgentPermissionLevel;
  allowedTools: string[];
  allowedChannels: string[];
  systemPrompt: string;
  defaultDailyCreditLimit: number;
  icon?: string;
  badge?: string;
  exampleQueries?: string[];
}

// ============================================================================
// TOOL DEFINITIONS & EXECUTION CONTEXT
// ============================================================================

export interface WorkforceExecutionContext {
  agentKey?: AnyAgentKey;
  agentId?: string;
  level: AgentWorkforceLevel;
  companyId?: string;       // Required for STORE level; optional for PLATFORM / MARKETPLACE
  companyName?: string;
  userId?: string;
  userRole?: string;
  userEmail?: string;
  isSuperAdmin?: boolean;
  taskId?: string;
  traceId?: string;
  source?: "WEB" | "WHATSAPP" | "API" | "WORKER" | "SUPER_ADMIN" | "AGENT";
  creditBudget?: number;
  channel?: string;
  permissionLevel?: AgentPermissionLevel;
  estimatedCredits?: number;
}

export interface WorkforceToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  requiresApproval?: boolean;
  approvalPayload?: {
    actionType: string;
    title: string;
    description?: string;
    proposedAction: Record<string, unknown>;
  };
  summaryForAgent?: string;
}

export interface WorkforceTool {
  name: string;
  description: string;
  levelScope: AgentWorkforceLevel[];
  permissionRequired: AgentPermissionLevel;
  parameters: Record<string, unknown>; // schema representation
  requiresApproval?: boolean;
  costCredits: number;
  execute: (args: any, context: WorkforceExecutionContext) => Promise<WorkforceToolResult>;
}

// ============================================================================
// TASK & EXECUTION TYPES
// ============================================================================

export interface AgentRunInput {
  agentKey: AnyAgentKey;
  prompt: string;
  channel?: string;
  conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  contextOverrides?: Record<string, unknown>;
  maxSteps?: number;
  modelId?: string;
  priority?: number;
  syncWait?: boolean;
}

export interface AgentRunResult {
  taskId: string;
  agentKey: AnyAgentKey;
  status: AgentTaskStatus;
  reply: string;
  toolCallsExecuted: Array<{
    toolName: string;
    input: unknown;
    output: unknown;
    status: string;
    latencyMs: number;
  }>;
  creditsConsumed: number;
  creditsUsed?: number;
  stepsExecuted?: number;
  latencyMs: number;
  requiresApproval: boolean;
  approvalId?: string;
  escalationId?: string;
}

// ============================================================================
// MEMORY & TELEMETRY CONTRACTS
// ============================================================================

export interface AgentMemoryRecord {
  id: string;
  scope: AgentMemoryScope;
  key: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface WorkforceROIMetrics {
  storeMetrics?: {
    activeAgentsCount: number;
    inquiriesHandled30d: number;
    tasksCompleted30d: number;
    abandonedCartsRecovered: number;
    campaignsGenerated: number;
    stockoutAlertsTriggered: number;
    repeatCustomersInfluenced: number;
    creditsUsed30d: number;
  };
  platformMetrics?: {
    prospectsDiscovered: number;
    qualifiedLeads: number;
    outreachDrafted: number;
    outreachSent: number;
    demosGenerated: number;
    storesOnboarded: number;
    activeStoresInfluenced: number;
    ghubaSellersRecruited: number;
    ghubaGapsIdentified: number;
    ghubaGapsClosed: number;
  };
}
