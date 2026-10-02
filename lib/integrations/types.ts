/**
 * lib/integrations/types.ts
 *
 * Core TypeScript definitions for SalesmanPro Unified Integration Onboarding Engine.
 * Enforces strict provider lifecycle states, tenant isolation, and least-privilege permissions.
 */

export type IntegrationStatus =
  | "NOT_CONNECTED"
  | "SETUP_REQUIRED"
  | "AUTHORIZATION_PENDING"
  | "AWAITING_USER_INPUT"
  | "AWAITING_APPROVAL"
  | "CONNECTED"
  | "VERIFICATION_PENDING"
  | "ACTIVE"
  | "PARTIALLY_CONNECTED"
  | "ACTION_REQUIRED"
  | "EXPIRED"
  | "REVOKED"
  | "DISCONNECTED"
  | "FAILED";

export type IntegrationCategory =
  | "SOCIAL_MEDIA"
  | "MESSAGING"
  | "PAYMENTS"
  | "EMAIL_SMS"
  | "STORAGE_CDN"
  | "ANALYTICS"
  | "PRODUCTIVITY";

export type ManagementLevel =
  | "PLATFORM_MANAGED" // Super Admin controls global API app/secret (e.g., Meta App, Google Client ID)
  | "COMPANY_MANAGED"  // Company Owner connects tenant business account (e.g., Facebook Page, M-Pesa Till)
  | "STORE_MANAGED"    // Individual store location settings
  | "USER_MANAGED";    // Personal user profile integration

export interface IntegrationScope {
  scope: string;
  description: string;
  required: boolean;
  purpose: string;
}

export interface IntegrationHealthCheckResult {
  healthy: boolean;
  checkedAt: string;
  statusCode?: number;
  latencyMs?: number;
  message: string;
  reauthorizationRequired?: boolean;
}

export interface IntegrationDefinition {
  id: string; // e.g., 'facebook', 'instagram', 'whatsapp', 'google', 'mpesa', 'stripe', 'email_smtp'
  name: string;
  category: IntegrationCategory;
  managementLevel: ManagementLevel;
  icon: string;
  description: string;
  whatItEnables: string[];
  prerequisites: string[];
  requiredPermissions: string[]; // Roles or fine-grained permissions required to connect
  scopes: IntegrationScope[];
  oauthSupported: boolean;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  documentationUrl?: string;
  isPlatformConfigured?: boolean; // True if Super Admin configured the platform OAuth app
}

export interface ConnectedAccountSummary {
  id: string;
  provider: string;
  name: string;
  accountIdentifier: string; // Page ID, Phone Number, Email, Account ID
  username?: string | null;
  profileImageUrl?: string | null;
  status: IntegrationStatus;
  companyId: string;
  storeSlug?: string;
  connectedAt: string;
  lastVerifiedAt?: string | null;
  expiresAt?: string | null;
  grantedScopes: string[];
  health: IntegrationHealthCheckResult;
  metadata?: Record<string, any>;
}

export interface MascotOnboardingStep {
  stepNumber: number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "ACTION_REQUIRED";
  actionType?: "OAUTH_POPUP" | "FORM_INPUT" | "APPROVAL" | "VERIFICATION" | "TEST_DISPATCH";
  actionUrl?: string;
  formFields?: Array<{
    name: string;
    label: string;
    type: "text" | "select" | "password" | "checkbox";
    options?: Array<{ label: string; value: string }>;
    required: boolean;
    description?: string;
    placeholder?: string;
  }>;
  resultSummary?: string;
}

export interface MascotOnboardingGuide {
  providerId: string;
  providerName: string;
  status: IntegrationStatus;
  summary: string;
  whatItEnables: string[];
  prerequisites: Array<{ name: string; satisfied: boolean; instructions?: string }>;
  steps: MascotOnboardingStep[];
  currentStepIndex: number;
  connectUrl?: string;
  canConnect: boolean;
  blockReason?: string;
}
