/**
 * lib/automation/playwright/types.ts
 *
 * Authoritative TypeScript interfaces and types for the Playwright-assisted
 * credential onboarding, navigation, and validation engine in SalesmanPro.
 */

export type OnboardingStatus =
  | 'INITIALIZED'
  | 'AWAITING_USER_APPROVAL'
  | 'PORTAL_NAVIGATED'
  | 'USER_AUTHENTICATED'
  | 'CREDENTIALS_CAPTURED'
  | 'VALIDATION_IN_PROGRESS'
  | 'VALIDATED'
  | 'FAILED'
  | 'CANCELLED';

export interface ProviderPrerequisite {
  title: string;
  description: string;
  isCompleted?: boolean;
  docUrl?: string;
}

export interface CredentialFieldDefinition {
  key: string;
  label: string;
  description: string;
  envVar: string;
  isSecret: boolean;
  required: boolean;
  pattern?: string;
  placeholder?: string;
}

export interface ProviderOnboardingMetadata {
  providerId: string;
  serviceName: string;
  category: string;
  portalUrl: string;
  docUrl: string;
  accountType: string;
  prerequisites: ProviderPrerequisite[];
  fields: CredentialFieldDefinition[];
  requiredScopes: string[];
  redirectUris?: string[];
  webhookUrls?: string[];
}

export interface ProviderValidationResult {
  providerId: string;
  success: boolean;
  testedAt: string;
  environment: 'development' | 'production';
  credentialStatus: 'VALID' | 'INVALID' | 'EXPIRED' | 'PERMISSION_DENIED';
  message: string;
  accountDetails?: {
    accountName?: string;
    accountId?: string;
    permissions?: string[];
    expiryDate?: string;
  };
  error?: string;
}

export interface SupervisedSessionConfig {
  providerId: string;
  headless?: boolean;
  slowMoMs?: number;
  timeoutMs?: number;
  userDataDir?: string;
  requireExplicitApproval?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: 'SUPER_ADMIN' | 'DEVELOPER' | 'AUTOMATION_AGENT';
  action:
    | 'SESSION_START'
    | 'PORTAL_ACCESS'
    | 'USER_APPROVAL_GRANTED'
    | 'CREDENTIAL_STAGED'
    | 'CREDENTIAL_COMMITTED'
    | 'VERIFICATION_PASSED'
    | 'VERIFICATION_FAILED'
    | 'ROLLBACK_TRIGGERED';
  providerId: string;
  variableNames: string[];
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details?: Record<string, any>;
}
