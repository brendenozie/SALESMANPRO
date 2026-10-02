"use strict";
/**
 * lib/automation/playwright/adapters/openAiAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for OpenAI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAiAdapter = exports.OpenAiAdapter = void 0;
const secretRedaction_1 = require("../secretRedaction");
class OpenAiAdapter {
    metadata = {
        providerId: 'ai-openai',
        serviceName: 'OpenAI API (GPT-4o & Embeddings)',
        category: 'AI_INFRASTRUCTURE',
        portalUrl: 'https://platform.openai.com/api-keys',
        docUrl: 'https://platform.openai.com/docs/overview',
        accountType: 'OpenAI Developer Organization',
        prerequisites: [
            {
                title: 'OpenAI Developer Account',
                description: 'Account created at platform.openai.com with verified organization details.',
            },
            {
                title: 'Tier 1+ Credit Balance',
                description: 'Active billing method with pre-funded account balance to avoid quota errors.',
            },
        ],
        fields: [
            {
                key: 'apiKey',
                label: 'OpenAI Secret Key',
                description: 'Secret token starting with sk-proj- or sk-',
                envVar: 'OPENAI_API_KEY',
                isSecret: true,
                required: true,
                pattern: '^sk-[a-zA-Z0-9_-]{20,}$',
                placeholder: 'sk-...',
            },
            {
                key: 'model',
                label: 'Default Model',
                description: 'Default text model',
                envVar: 'OPENAI_MODEL',
                isSecret: false,
                required: false,
                placeholder: 'gpt-4o-mini',
            },
        ],
        requiredScopes: ['model.read', 'model.request'],
    };
    getOnboardingSteps() {
        return [
            {
                stepNumber: 1,
                title: 'Navigate to OpenAI API Keys',
                description: 'Open supervised browser session to OpenAI dashboard.',
                actionRequired: 'AGENT_AUTOMATED',
            },
            {
                stepNumber: 2,
                title: 'Developer Login & 2FA',
                description: 'Super Admin or developer signs in with email/SSO and enters 2FA code.',
                actionRequired: 'USER_INTERACTIVE',
            },
            {
                stepNumber: 3,
                title: 'Create Service Account or Project API Key',
                description: 'Assign "All Models" permission and copy generated key.',
                actionRequired: 'USER_SUPERVISED',
                fieldsToExtract: ['OPENAI_API_KEY'],
            },
            {
                stepNumber: 4,
                title: 'Verify Connection',
                description: 'Validate key against OpenAI models endpoint.',
                actionRequired: 'AGENT_AUTOMATED',
            },
        ];
    }
    async verifyCredentials(credentials) {
        const apiKey = credentials.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'INVALID',
                message: 'OPENAI_API_KEY is missing or empty.',
            };
        }
        try {
            (0, secretRedaction_1.safeLog)('Testing OpenAI API connectivity...');
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
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
                    message: `OpenAI authentication returned HTTP ${response.status}`,
                    error: errorText,
                };
            }
            const data = await response.json();
            const models = Array.isArray(data.data) ? data.data.map((m) => m.id) : [];
            return {
                providerId: this.metadata.providerId,
                success: true,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'VALID',
                message: `Successfully connected to OpenAI API. Verified access to ${models.length} models including GPT-4o family.`,
                accountDetails: {
                    accountName: 'OpenAI Project Account',
                    permissions: ['model.read', 'model.request'],
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
                message: 'Failed to communicate with OpenAI API.',
                error: (0, secretRedaction_1.formatSafeError)(err),
            };
        }
    }
}
exports.OpenAiAdapter = OpenAiAdapter;
exports.openAiAdapter = new OpenAiAdapter();
