/**
 * lib/automation/playwright/adapters/smtpAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for SMTP Mail Relay.
 */

import { ProviderAdapter, OnboardingStep } from './types';
import { ProviderOnboardingMetadata, ProviderValidationResult } from '../types';
import { safeLog, formatSafeError } from '../secretRedaction';
import nodemailer from 'nodemailer';

export class SmtpAdapter implements ProviderAdapter {
  public metadata: ProviderOnboardingMetadata = {
    providerId: 'comm-smtp-gateway',
    serviceName: 'Platform SMTP Email Relay',
    category: 'COMMUNICATIONS',
    portalUrl: 'https://hpanel.hostinger.com/',
    docUrl: 'https://nodemailer.com/smtp/',
    accountType: 'Mail Server / Hosted Mailbox',
    prerequisites: [
      {
        title: 'Active Mailbox & DNS Records',
        description: 'Verified SPF, DKIM, and DMARC DNS records for salesmanpro.site.',
      },
    ],
    fields: [
      {
        key: 'host',
        label: 'SMTP Host',
        description: 'SMTP server hostname',
        envVar: 'SMTP_HOST',
        isSecret: false,
        required: true,
        placeholder: 'smtp.hostinger.com',
      },
      {
        key: 'port',
        label: 'SMTP Port',
        description: 'SMTP port (587 for STARTTLS, 465 for SSL)',
        envVar: 'SMTP_PORT',
        isSecret: false,
        required: true,
        placeholder: '587',
      },
      {
        key: 'user',
        label: 'SMTP Username',
        description: 'Sending mailbox email address',
        envVar: 'SMTP_USER',
        isSecret: false,
        required: true,
        placeholder: 'no-reply@salesmanpro.site',
      },
      {
        key: 'pass',
        label: 'SMTP Password',
        description: 'Mailbox account password or app password',
        envVar: 'SMTP_PASS',
        isSecret: true,
        required: true,
        placeholder: 'your_smtp_password',
      },
    ],
    requiredScopes: ['SMTP AUTH', 'TLS'],
  };

  public getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        stepNumber: 1,
        title: 'Navigate to Hosting Email Management',
        description: 'Open mail configuration panel in Hostinger or mail provider.',
        actionRequired: 'AGENT_AUTOMATED',
      },
      {
        stepNumber: 2,
        title: 'User Login & Mailbox Settings',
        description: 'Authenticate and open mailbox credentials.',
        actionRequired: 'USER_INTERACTIVE',
      },
      {
        stepNumber: 3,
        title: 'Extract Connection Parameters',
        description: 'Safely copy Host, Port, Username, and Password.',
        actionRequired: 'USER_SUPERVISED',
        fieldsToExtract: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
      },
    ];
  }

  public async verifyCredentials(credentials: Record<string, string>): Promise<ProviderValidationResult> {
    const host = credentials.SMTP_HOST || process.env.SMTP_HOST;
    const port = parseInt(credentials.SMTP_PORT || process.env.SMTP_PORT || '587', 10);
    const user = credentials.SMTP_USER || process.env.SMTP_USER;
    const pass = credentials.SMTP_PASS || process.env.SMTP_PASS;
    const secure = (credentials.SMTP_SECURE || process.env.SMTP_SECURE) === 'true';

    if (!host || !user || !pass) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: 'SMTP_HOST, SMTP_USER, or SMTP_PASS is missing.',
      };
    }

    try {
      safeLog('Testing SMTP relay handshake & authentication without sending emails...');
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      // Verify connection configuration (no email is sent)
      await transporter.verify();

      return {
        providerId: this.metadata.providerId,
        success: true,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'VALID',
        message: `SMTP connection established successfully to ${host}:${port} for ${user}. Handshake and AUTH verified.`,
        accountDetails: {
          accountName: `SMTP [${user}]`,
          permissions: ['SMTP AUTH', 'TLS'],
        },
      };
    } catch (err: any) {
      return {
        providerId: this.metadata.providerId,
        success: false,
        testedAt: new Date().toISOString(),
        environment: (process.env.NODE_ENV as any) || 'development',
        credentialStatus: 'INVALID',
        message: `SMTP verification failed: ${err.message}`,
        error: formatSafeError(err),
      };
    }
  }
}

export const smtpAdapter = new SmtpAdapter();
