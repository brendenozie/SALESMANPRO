"use strict";
/**
 * lib/automation/playwright/adapters/stripeAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for Stripe.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeAdapter = exports.StripeAdapter = void 0;
const secretRedaction_1 = require("../secretRedaction");
class StripeAdapter {
    metadata = {
        providerId: 'payment-stripe',
        serviceName: 'Stripe Global Card Payments',
        category: 'PAYMENTS',
        portalUrl: 'https://dashboard.stripe.com/apikeys',
        docUrl: 'https://stripe.com/docs/api',
        accountType: 'Verified Stripe Business Account',
        prerequisites: [
            {
                title: 'Stripe Merchant Account',
                description: 'Verified organization account with KYC and payouts setup.',
            },
        ],
        fields: [
            {
                key: 'publishableKey',
                label: 'Publishable Key',
                description: 'Client-side key starting with pk_test_ or pk_live_',
                envVar: 'STRIPE_PUBLISHABLE_KEY',
                isSecret: false,
                required: true,
                pattern: '^pk_(test|live)_[0-9a-zA-Z]{24,}$',
                placeholder: 'pk_test_...',
            },
            {
                key: 'secretKey',
                label: 'Secret Key',
                description: 'Server-side key starting with sk_test_ or sk_live_',
                envVar: 'STRIPE_SECRET_KEY',
                isSecret: true,
                required: true,
                pattern: '^sk_(test|live)_[0-9a-zA-Z]{24,}$',
                placeholder: 'sk_test_...',
            },
            {
                key: 'signingSecret',
                label: 'Webhook Signing Secret',
                description: 'Signature secret starting with whsec_',
                envVar: 'STRIPE_SIGNING_SECRET',
                isSecret: true,
                required: true,
                pattern: '^whsec_[0-9a-zA-Z]{32,}$',
                placeholder: 'whsec_...',
            },
        ],
        requiredScopes: ['Charges', 'PaymentIntents', 'Webhooks'],
        webhookUrls: ['https://salesmanpro.site/api/webhooks/stripe'],
    };
    getOnboardingSteps() {
        return [
            {
                stepNumber: 1,
                title: 'Navigate to Stripe API Keys',
                description: 'Open Stripe Dashboard Developers -> API keys.',
                actionRequired: 'AGENT_AUTOMATED',
            },
            {
                stepNumber: 2,
                title: 'Developer Login & 2FA',
                description: 'Sign in to Stripe account and complete MFA.',
                actionRequired: 'USER_INTERACTIVE',
            },
            {
                stepNumber: 3,
                title: 'Extract Secret & Publishable Keys',
                description: 'Reveal and copy Publishable key and Secret key.',
                actionRequired: 'USER_SUPERVISED',
                fieldsToExtract: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY'],
            },
            {
                stepNumber: 4,
                title: 'Configure Webhook Endpoint',
                description: 'Add endpoint https://salesmanpro.site/api/webhooks/stripe and copy Signing Secret.',
                actionRequired: 'USER_SUPERVISED',
                portalSubpath: '/workbench/webhooks',
                fieldsToExtract: ['STRIPE_SIGNING_SECRET'],
            },
        ];
    }
    async verifyCredentials(credentials) {
        const secretKey = credentials.STRIPE_SECRET_KEY ||
            credentials.STRIPE_SECRET ||
            process.env.STRIPE_SECRET_KEY ||
            process.env.STRIPE_SECRET;
        if (!secretKey) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'INVALID',
                message: 'STRIPE_SECRET_KEY is missing.',
            };
        }
        try {
            (0, secretRedaction_1.safeLog)('Testing Stripe API connectivity (non-financial balance check)...');
            const response = await fetch('https://api.stripe.com/v1/balance', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (!response.ok) {
                const errorJson = await response.json().catch(() => ({}));
                const errMsg = errorJson?.error?.message || `HTTP ${response.status}`;
                return {
                    providerId: this.metadata.providerId,
                    success: false,
                    testedAt: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                    credentialStatus: response.status === 401 ? 'INVALID' : 'PERMISSION_DENIED',
                    message: `Stripe balance request failed: ${errMsg}`,
                    error: JSON.stringify(errorJson),
                };
            }
            const data = await response.json();
            const livemode = !!data.livemode;
            return {
                providerId: this.metadata.providerId,
                success: true,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'VALID',
                message: `Stripe API operational. Environment: ${livemode ? 'PRODUCTION (LIVE)' : 'SANDBOX (TEST)'}.`,
                accountDetails: {
                    accountName: `Stripe (${livemode ? 'Live' : 'Test'})`,
                    permissions: ['balance.read', 'charges.read'],
                },
            };
        }
        catch (err) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'INVALID',
                message: 'Failed to communicate with Stripe API.',
                error: (0, secretRedaction_1.formatSafeError)(err),
            };
        }
    }
}
exports.StripeAdapter = StripeAdapter;
exports.stripeAdapter = new StripeAdapter();
