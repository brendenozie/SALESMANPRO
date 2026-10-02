/**
 * lib/automation/playwright/adapters/googleGeminiAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for Google Gemini.
 */

import { ProviderAdapter, OnboardingStep } from './types';
import { ProviderOnboardingMetadata, ProviderValidationResult } from '../types';
import { safeLog, formatSafeError } from '../secretRedaction';

export class GoogleGeminiAdapter implements ProviderAdapter {
  public metadata: ProviderOnboardingMetadata = {
    providerId: 'ai-google-gemini',
    serviceName: 'Google Gemini & Multimodal GenAI',
    category: 'AI_INFRASTRUCTURE',
    portalUrl: 'https://aistudio.google.com/app/apikey',
    docUrl: 'https://ai.google.dev/gemini-api/docs',
    accountType: 'Google AI Studio / Cloud Project',
    prerequisites: [
      {
        title: 'Google Cloud Account',
        description: 'GCP account with Generative Language API enabled.',
      },
    ],
    fields: [
      {
        key: 'apiKey',
        label: 'Google Gemini API Key',
        description: 'API key starting with AIza',
        envVar: 'GEMINI_API_KEY',
        isSecret: true,
        required: true,
        pattern: '^AIza[0-9A-Za-z-_]{35}$',
        placeholder: 'AIza...',
      },
    ],
    requiredScopes: ['Generative Language API'],
  };

  public getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        stepNumber: 1,
        title: 'Navigate to Google AI Studio',
        description: 'Open AI Studio API Key Manager.',
        actionRequired: 'AGENT_AUTOMATED',
      },
      {
        stepNumber: 2,
        title: 'Google Account Authentication',
        description: 'Sign in to Google account associated with SalesmanPro Cloud Project.',
        actionRequired: 'USER_INTERACTIVE',
      },
      {
        stepNumber: 3,
        title: 'Create or Retrieve API Key',
        description: 'Select Cloud project and copy API key.',
        actionRequired: 'USER_SUPERVISED',
        fieldsToExtract: ['GEMINI_API_KEY'],
      },
      {
        stepNumber: 4,
        title: 'Verify Gemini API Access',
        description: 'Query model registry with new key.',
        actionRequired: 'AGENT_AUTOMATED',
      },
    ];
  }

  public async verifyCredentials(credentials: Record<string, string>): Promise<ProviderValidationResult> {
    const apiKey =
      credentials.GEMINI_API_KEY ||
      credentials.GOOGLE_GENAI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'GEMINI_API_KEY is missing or empty.',
      };
    }

    try {
      safeLog('Testing Google Gemini API connectivity...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          providerId: this.metadata.providerId,
          success: false,
          testedAt: new Date().toISOString(),
          environment: (process.env.NODE_ENV as any) || 'development',
          credentialStatus: response.status === 400 || response.status === 403 ? 'PERMISSION_DENIED' : 'INVALID',
          message: `Google Gemini API returned HTTP ${response.status}`,
          error: errorText,
        };
      }

      const data = await response.json();
      const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name) : [];

      return {
        providerId: this.metadata.providerId,
        success: true,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'VALID',
        message: `Successfully connected to Google Gemini API. Found ${models.length} generative models.`,
        accountDetails: {
          accountName: 'Google Cloud Generative Language API',
          permissions: ['Generative Language'],
        },
      };
    } catch (err) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'Failed to communicate with Google Gemini API.',
        error: formatSafeError(err),
      };
    }
  }
}

export const googleGeminiAdapter = new GoogleGeminiAdapter();
