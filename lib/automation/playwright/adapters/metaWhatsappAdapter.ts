/**
 * lib/automation/playwright/adapters/metaWhatsappAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for Meta WhatsApp Cloud API.
 */

import { ProviderAdapter, OnboardingStep } from './types';
import { ProviderOnboardingMetadata, ProviderValidationResult } from '../types';
import { safeLog, formatSafeError } from '../secretRedaction';

export class MetaWhatsappAdapter implements ProviderAdapter {
  public metadata: ProviderOnboardingMetadata = {
    providerId: 'meta-whatsapp',
    serviceName: 'Meta WhatsApp Cloud API',
    category: 'META_WHATSAPP',
    portalUrl: 'https://developers.facebook.com/apps/',
    docUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    accountType: 'Meta Business Manager & WhatsApp Business Account',
    prerequisites: [
      {
        title: 'Meta Business Verification',
        description: 'Verified Business Manager entity with legal documentation.',
        docUrl: 'https://business.facebook.com/settings',
      },
      {
        title: 'Permanent System User Token',
        description: 'Admin System User with whatsapp_business_messaging & whatsapp_business_management permissions.',
      },
      {
        title: 'Live Phone Number',
        description: 'Phone number registered in WhatsApp Manager (not active on mobile WhatsApp).',
      },
    ],
    fields: [
      {
        key: 'accessToken',
        label: 'Permanent Access Token',
        description: 'Permanent System User token starting with EAAB...',
        envVar: 'WHATSAPP_ACCESS_TOKEN',
        isSecret: true,
        required: true,
        pattern: '^EAAB[0-9A-Za-z]+$',
        placeholder: 'EAAB...',
      },
      {
        key: 'phoneNumberId',
        label: 'Phone Number ID',
        description: 'Numeric ID assigned by Meta for the sending phone number',
        envVar: 'WHATSAPP_PHONE_NUMBER_ID',
        isSecret: false,
        required: true,
        pattern: '^[0-9]+$',
        placeholder: '100000000000001',
      },
      {
        key: 'businessAccountId',
        label: 'WhatsApp Business Account ID (WABA ID)',
        description: 'Numeric ID of the WhatsApp Business Account',
        envVar: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        isSecret: false,
        required: true,
        pattern: '^[0-9]+$',
        placeholder: '200000000000002',
      },
      {
        key: 'appSecret',
        label: 'Meta App Secret',
        description: 'App Secret used for HMAC-SHA256 webhook payload signature verification',
        envVar: 'WHATSAPP_APP_SECRET',
        isSecret: true,
        required: true,
        placeholder: 'your_meta_app_secret',
      },
      {
        key: 'verifyToken',
        label: 'Webhook Verification Token',
        description: 'Custom secret string for GET webhook challenge handshake',
        envVar: 'WHATSAPP_VERIFY_TOKEN',
        isSecret: true,
        required: true,
        placeholder: 'your_custom_verify_token',
      },
      {
        key: 'graphVersion',
        label: 'Graph API Version',
        description: 'Target Graph API version (default v21.0)',
        envVar: 'WHATSAPP_GRAPH_VERSION',
        isSecret: false,
        required: false,
        placeholder: 'v21.0',
      },
    ],
    requiredScopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    webhookUrls: ['https://salesmanpro.site/api/webhooks/whatsapp'],
  };

  public getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        stepNumber: 1,
        title: 'Open Meta Developer Portal',
        description: 'Navigate to Meta App Dashboard under supervised browser.',
        actionRequired: 'AGENT_AUTOMATED',
      },
      {
        stepNumber: 2,
        title: 'Meta 2FA & Business Login',
        description: 'Developer or Super Admin logs in with Facebook credentials and passes 2FA.',
        actionRequired: 'USER_INTERACTIVE',
      },
      {
        stepNumber: 3,
        title: 'Navigate to WhatsApp API Setup',
        description: 'Select WhatsApp product in app sidebar and open API Setup.',
        actionRequired: 'AGENT_AUTOMATED',
        portalSubpath: '/products/whatsapp/api-setup',
      },
      {
        stepNumber: 4,
        title: 'Configure Webhook URL & Verify Token',
        description: 'Set callback URL to https://salesmanpro.site/api/webhooks/whatsapp and verify challenge.',
        actionRequired: 'USER_SUPERVISED',
      },
      {
        stepNumber: 5,
        title: 'Extract Phone Number ID & WABA ID',
        description: 'Copy Phone Number ID and WhatsApp Business Account ID safely.',
        actionRequired: 'USER_SUPERVISED',
        fieldsToExtract: ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_BUSINESS_ACCOUNT_ID'],
      },
      {
        stepNumber: 6,
        title: 'Generate System User Token',
        description: 'Navigate to Business Settings -> System Users -> Generate Token (Never Expiring).',
        actionRequired: 'USER_SUPERVISED',
        fieldsToExtract: ['WHATSAPP_ACCESS_TOKEN'],
      },
    ];
  }

  public async verifyCredentials(credentials: Record<string, string>): Promise<ProviderValidationResult> {
    const accessToken = credentials.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = credentials.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const graphVersion = credentials.WHATSAPP_GRAPH_VERSION || process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';

    if (!accessToken || !phoneNumberId) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing.',
      };
    }

    try {
      safeLog('Testing Meta WhatsApp Cloud API credentials...');
      const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errMsg = errorJson?.error?.message || `HTTP ${response.status}`;
        return {
          providerId: this.metadata.providerId,
          success: false,
          testedAt: new Date().toISOString(),
          environment: (process.env.NODE_ENV as any) || 'development',
          credentialStatus: response.status === 401 ? 'INVALID' : 'PERMISSION_DENIED',
          message: `Meta Graph API request rejected: ${errMsg}`,
          error: JSON.stringify(errorJson),
        };
      }

      const data = await response.json();
      return {
        providerId: this.metadata.providerId,
        success: true,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'VALID',
        message: `Meta WhatsApp Cloud API operational. Connected Phone: ${data.display_phone_number || 'N/A'}, Quality: ${data.quality_rating || 'N/A'}, Verified Name: ${data.verified_name || 'N/A'}.`,
        accountDetails: {
          accountName: data.verified_name || 'WhatsApp Business Phone',
          accountId: phoneNumberId,
          permissions: ['whatsapp_business_messaging', 'whatsapp_business_management'],
        },
      };
    } catch (err) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'Failed to connect to Meta Graph API.',
        error: formatSafeError(err),
      };
    }
  }
}

export const metaWhatsappAdapter = new MetaWhatsappAdapter();
