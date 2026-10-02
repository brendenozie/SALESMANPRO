"use strict";
/**
 * lib/automation/playwright/adapters/paystackAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for Paystack.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackAdapter = exports.PaystackAdapter = void 0;
const secretRedaction_1 = require("../secretRedaction");
class PaystackAdapter {
    metadata = {
        providerId: 'payment-paystack',
        serviceName: 'Paystack Payment Gateway',
        category: 'PAYMENTS',
        portalUrl: 'https://dashboard.paystack.com/#/settings/developer',
        docUrl: 'https://paystack.com/docs/api/',
        accountType: 'Starter / Registered Business',
        prerequisites: [
            {
                title: 'Paystack Merchant Account',
                description: 'Verified business account at paystack.com.',
            },
        ],
        fields: [
            {
                key: 'publicKey',
                label: 'Public Key',
                description: 'Client-side public key starting with pk_test_ or pk_live_',
                envVar: 'PAYSTACK_PUBLIC_KEY',
                isSecret: false,
                required: true,
                pattern: '^pk_(test|live)_[0-9a-zA-Z]{30,}$',
                placeholder: 'pk_test_...',
            },
            {
                key: 'secretKey',
                label: 'Secret Key',
                description: 'Server-side secret key starting with sk_test_ or sk_live_',
                envVar: 'PAYSTACK_SECRET_KEY',
                isSecret: true,
                required: true,
                pattern: '^sk_(test|live)_[0-9a-zA-Z]{30,}$',
                placeholder: 'sk_test_...',
            },
            {
                key: 'callbackUrl',
                label: 'Webhook Callback URL',
                description: 'Webhook endpoint for transaction status notifications',
                envVar: 'PAYSTACK_CALLBACK_URL',
                isSecret: false,
                required: true,
                placeholder: 'https://salesmanpro.site/api/webhooks/paystack',
            },
        ],
        requiredScopes: ['Transactions', 'Subaccounts'],
        webhookUrls: ['https://salesmanpro.site/api/webhooks/paystack'],
    };
    getOnboardingSteps() {
        return [
            {
                stepNumber: 1,
                title: 'Navigate to Paystack Developer Settings',
                description: 'Open API Keys & Webhooks tab in Paystack Dashboard.',
                actionRequired: 'AGENT_AUTOMATED',
                portalSubpath: '/#/settings/developer',
            },
            {
                stepNumber: 2,
                title: 'Merchant Sign-In & 2FA',
                description: 'Log in with merchant credentials and enter authenticator code.',
                actionRequired: 'USER_INTERACTIVE',
            },
            {
                stepNumber: 3,
                title: 'Extract API Keys',
                description: 'Copy Test or Live Secret Key and Public Key.',
                actionRequired: 'USER_SUPERVISED',
                fieldsToExtract: ['PAYSTACK_PUBLIC_KEY', 'PAYSTACK_SECRET_KEY'],
            },
            {
                stepNumber: 4,
                title: 'Configure Webhook URL',
                description: 'Set Live/Test Webhook URL to https://salesmanpro.site/api/webhooks/paystack.',
                actionRequired: 'USER_SUPERVISED',
            },
        ];
    }
    async verifyCredentials(credentials) {
        const secretKey = credentials.PAYSTACK_SECRET_KEY ||
            credentials.PAYSTACK_SECRET ||
            process.env.PAYSTACK_SECRET_KEY ||
            process.env.PAYSTACK_SECRET;
        if (!secretKey) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'INVALID',
                message: 'PAYSTACK_SECRET_KEY is missing.',
            };
        }
        try {
            (0, secretRedaction_1.safeLog)('Testing Paystack API credentials (non-financial balance query)...');
            const response = await fetch('https://api.paystack.co/balance', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    providerId: this.metadata.providerId,
                    success: false,
                    testedAt: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                    credentialStatus: response.status === 401 ? 'INVALID' : 'PERMISSION_DENIED',
                    message: `Paystack authentication failed with HTTP ${response.status}`,
                    error: errorText,
                };
            }
            const data = await response.json();
            const balances = Array.isArray(data.data)
                ? data.data.map((b) => `${b.currency}: ${(b.balance / 100).toFixed(2)}`).join(', ')
                : 'Active';
            return {
                providerId: this.metadata.providerId,
                success: true,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'VALID',
                message: `Paystack API operational. Available Currency Ledger: [${balances}].`,
                accountDetails: {
                    accountName: 'Paystack Merchant Account',
                    permissions: ['Transactions', 'Balance'],
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
                message: 'Failed to communicate with Paystack API.',
                error: (0, secretRedaction_1.formatSafeError)(err),
            };
        }
    }
}
exports.PaystackAdapter = PaystackAdapter;
exports.paystackAdapter = new PaystackAdapter();
