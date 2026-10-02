/**
 * lib/ai/mascot/types.ts
 *
 * Core TypeScript contracts and schemas for the SalesmanPro AI Mascot.
 * Role-aware, category-aware, store-isolated operational AI assistant.
 */

export type MascotState =
  | "idle"
  | "listening"
  | "thinking"
  | "processing"
  | "success"
  | "needs_approval"
  | "warning"
  | "error"
  | "speaking"
  | "minimized"
  | "expanded"
  | "unavailable";

export type MascotActionRiskLevel =
  | "SAFE_READ"
  | "SAFE_WRITE"
  | "SENSITIVE_WRITE"
  | "FINANCIAL"
  | "EXTERNAL_COMMUNICATION"
  | "MARKETING"
  | "DESTRUCTIVE";

export type MascotActionType = "READ" | "PREPARE" | "EXECUTE";

export type MascotModule =
  | "products"
  | "inventory"
  | "orders"
  | "pricing"
  | "finance"
  | "marketing"
  | "messaging"
  | "marketplace"
  | "staff"
  | "education"
  | "property"
  | "restaurant"
  | "service"
  | "website"
  | "integrations"
  | "system";

export interface MascotCapability {
  id: string;
  module: MascotModule;
  capability: string;
  name: string;
  description: string;
  actionType: MascotActionType;
  riskLevel: MascotActionRiskLevel;
  roles: string[]; // Allowed user roles (e.g. "ADMIN", "MANAGER", "AGENT", "STAFF", "TEACHER", "SUPER_ADMIN")
  storeCategories: string[]; // Supported store categories, ["*"] for all
  requiredPermissions: string[];
  requiresApproval: boolean;
  creditCost: number;
  sensitive: boolean;
  suggestedPrompts: string[];
  canonicalEndpoint?: string;
}

export interface MascotContext {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  companyId: string;
  companyName: string;
  storeSlug: string;
  storeCategory: string;
  storeVariant?: string;
  currentPath: string;
  enabledModules: string[];
  aiCreditBalance: number;
  mascotEnabled: boolean;
  isSuperAdmin: boolean;
  isPlatformScope: boolean;
}

export interface MascotSettings {
  enabled: boolean;
  character: "alex" | "byte" | "nova";
  size: "compact" | "normal" | "large";
  defaultPosition: "bottom-right" | "bottom-left" | "top-right";
  animationLevel: "subtle" | "dynamic" | "disabled";
  voiceEnabled: boolean;
  voiceType: "professional" | "friendly" | "executive";
  voiceSpeed: number;
  autoSpeak: boolean;
  moduleToggles: Record<MascotModule, boolean>;
  roleRestrictions: Record<string, string[]>; // role -> restricted capability IDs
  approvalOverrides: Record<string, boolean>; // capabilityId -> requiresApproval override
}

export interface MascotMessage {
  id: string;
  sender: "user" | "mascot" | "system";
  text: string;
  timestamp: string;
  state?: MascotState;
  suggestedActions?: string[];
  deepLinks?: Array<{ label: string; href: string }>;
  actionCard?: MascotActionCard;
  creditCost?: number;
}

export interface MascotActionCard {
  id: string;
  capabilityId: string;
  title: string;
  description: string;
  riskLevel: MascotActionRiskLevel;
  requiresApproval: boolean;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "executed" | "failed";
  payload: Record<string, any>;
  previewData?: Record<string, any>;
  beforeState?: any;
  afterState?: any;
  affectedCount?: number;
  approvalId?: string;
  errorMessage?: string;
}

export interface MascotExecutionResult {
  success: boolean;
  summary: string;
  data?: any;
  deepLinks?: Array<{ label: string; href: string }>;
  actionCard?: MascotActionCard;
  requiresApproval?: boolean;
  creditsConsumed?: number;
  error?: string;
}
