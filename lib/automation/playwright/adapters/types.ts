/**
 * lib/automation/playwright/adapters/types.ts
 *
 * Contract and interfaces for provider-specific onboarding adapters.
 */

import { ProviderOnboardingMetadata, ProviderValidationResult } from '../types';

export interface OnboardingStep {
  stepNumber: number;
  title: string;
  description: string;
  actionRequired: 'AGENT_AUTOMATED' | 'USER_SUPERVISED' | 'USER_INTERACTIVE';
  portalSubpath?: string;
  fieldsToExtract?: string[];
}

export interface ProviderAdapter {
  metadata: ProviderOnboardingMetadata;
  getOnboardingSteps(): OnboardingStep[];
  verifyCredentials(credentials: Record<string, string>): Promise<ProviderValidationResult>;
}
