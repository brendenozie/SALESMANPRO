/**
 * lib/automation/playwright/adapters/mpesaAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for Safaricom Daraja M-Pesa.
 */

import { ProviderAdapter, OnboardingStep } from './types';
import { ProviderOnboardingMetadata, ProviderValidationResult } from '../types';
import { safeLog, formatSafeError } from '../secretRedaction';

export class MpesaAdapter implements ProviderAdapter {
  public metadata: ProviderOnboardingMetadata = {
    providerId: 'payment-mpesa',
    serviceName: 'Safaricom Daraja 2.0 M-Pesa',
    category: 'PAYMENTS',
    portalUrl: 'https://developer.safaricom.co.ke/',
    docUrl: 'https://developer.safaricom.co.ke/docs',
    accountType: 'Daraja Developer Account (Sandbox) / Safaricom Business Portal (Live)',
    prerequisites: [
      {
        title: 'Daraja Portal Account',
        description: 'Developer account registered at developer.safaricom.co.ke.',
      },
      {
        title: 'Lipa na M-Pesa Shortcode & Passkey',
        description: 'For sandbox, test credentials shortcode 174379. For production, official Paybill/Till certificate.',
      },
    ],
    fields: [
      {
        key: 'consumerKey',
        label: 'Consumer Key',
        description: 'Daraja App Consumer Key',
        envVar: 'MPESA_CONSUMER_KEY',
        isSecret: true,
        required: true,
        placeholder: 'your_consumer_key',
      },
      {
        key: 'consumerSecret',
        label: 'Consumer Secret',
        description: 'Daraja App Consumer Secret',
        envVar: 'MPESA_CONSUMER_SECRET',
        isSecret: true,
        required: true,
        placeholder: 'your_consumer_secret',
      },
      {
        key: 'shortcode',
        label: 'Business Shortcode',
        description: 'Paybill or Buy Goods Till number',
        envVar: 'MPESA_SHORTCODE',
        isSecret: false,
        required: true,
        placeholder: '174379',
      },
      {
        key: 'passkey',
        label: 'Online Passkey',
        description: 'Used to generate STK push password',
        envVar: 'MPESA_PASSKEY',
        isSecret: true,
        required: true,
        placeholder: 'bfb279f9aa...',
      },
      {
        key: 'callbackUrl',
        label: 'STK Callback URL',
        description: 'Webhook callback endpoint for payment notifications',
        envVar: 'MPESA_CALLBACK_URL',
        isSecret: false,
        required: true,
        placeholder: 'https://salesmanpro.site/api/mpesa/callback',
      },
    ],
    requiredScopes: ['Lipa na M-Pesa Online (STK Push)'],
    webhookUrls: [
      'https://salesmanpro.site/api/mpesa/callback',
      'https://salesmanpro.site/api/webhooks/mpesa',
    ],
  };

  public getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        stepNumber: 1,
        title: 'Navigate to Safaricom Daraja Portal',
        description: 'Open developer.safaricom.co.ke in supervised browser.',
        actionRequired: 'AGENT_AUTOMATED',
      },
      {
        stepNumber: 2,
        title: 'Developer Login & 2FA',
        description: 'Log in with Safaricom Developer credentials.',
        actionRequired: 'USER_INTERACTIVE',
      },
      {
        stepNumber: 3,
        title: 'Open My Applications',
        description: 'Select existing app or click "Add a new app" with Lipa na M-Pesa Sandbox enabled.',
        actionRequired: 'USER_SUPERVISED',
        portalSubpath: '/user/me/apps',
      },
      {
        stepNumber: 4,
        title: 'Extract Consumer Key & Consumer Secret',
        description: 'Safely copy application keys into local vault.',
        actionRequired: 'USER_SUPERVISED',
        fieldsToExtract: ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET'],
      },
      {
        stepNumber: 5,
        title: 'Verify OAuth Bearer Generation',
        description: 'Execute token generation request against Safaricom OAuth endpoint.',
        actionRequired: 'AGENT_AUTOMATED',
      },
    ];
  }

  public async verifyCredentials(credentials: Record<string, string>): Promise<ProviderValidationResult> {
    const consumerKey = credentials.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = credentials.MPESA_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET;
    const baseUrl =
      credentials.MPESA_BASE_URL ||
      process.env.MPESA_BASE_URL ||
      (process.env.MPESA_ENVIRONMENT === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke');

    if (!consumerKey || !consumerSecret) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is missing.',
      };
    }

    try {
      safeLog('Testing Safaricom Daraja OAuth authentication (non-financial)...');
      const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const tokenUrl = `${baseUrl.replace(/\/$/, '')}/oauth/v1/generate?grant_type=client_credentials`;

      const response = await fetch(tokenUrl, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          providerId: this.metadata.providerId,
          success: false,
          testedAt: new Date().toISOString(),
          environment: (process.env.NODE_ENV as any) || 'development',
          credentialStatus: response.status === 401 ? 'INVALID' : 'PERMISSION_DENIED',
          message: `Daraja OAuth rejected with HTTP ${response.status}`,
          error: errorText,
        };
      }

      const data = await response.json();
      if (!data.access_token) {
        return {
          providerId: this.metadata.providerId,
          success: false,
          testedAt: new Date().toISOString(),
          environment: (process.env.NODE_ENV as any) || 'development',
          credentialStatus: 'INVALID',
          message: 'Daraja OAuth responded without access_token.',
        };
      }

      return {
        providerId: this.metadata.providerId,
        success: true,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'VALID',
        message: `Safaricom Daraja OAuth verified successfully. Token expires in ${data.expires_in || 3599}s. Target Gateway: ${baseUrl}.`,
        accountDetails: {
          accountName: 'Safaricom Daraja API Account',
          permissions: ['Lipa na M-Pesa Online'],
        },
      };
    } catch (err) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'Failed to communicate with Safaricom Daraja endpoint.',
        error: formatSafeError(err),
      };
    }
  }
}

export const mpesaAdapter = new MpesaAdapter();
