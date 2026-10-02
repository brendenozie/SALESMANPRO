"use strict";
/**
 * lib/automation/playwright/adapters/groqAdapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for Groq.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqAdapter = exports.GroqAdapter = void 0;
const secretRedaction_1 = require("../secretRedaction");
class GroqAdapter {
    metadata = {
        providerId: 'ai-groq',
        serviceName: 'Groq Cloud Inference Engine',
        category: 'AI_INFRASTRUCTURE',
        portalUrl: 'https://console.groq.com/keys',
        docUrl: 'https://console.groq.com/docs/quickstart',
        accountType: 'Developer Account',
        prerequisites: [
            {
                title: 'Groq Console Account',
                description: 'Sign up at https://console.groq.com with verified work or developer email.',
                docUrl: 'https://console.groq.com',
            },
            {
                title: 'Active API Key with llama-3.3-70b-versatile access',
                description: 'Create an API Key under the API Keys tab in Groq Console.',
                docUrl: 'https://console.groq.com/keys',
            },
        ],
        fields: [
            {
                key: 'apiKey',
                label: 'Groq API Key',
                description: 'Secret token starting with gsk_',
                envVar: 'GROQ_API_KEY',
                isSecret: true,
                required: true,
                pattern: '^gsk_[a-zA-Z0-9]{30,}$',
                placeholder: 'gsk_...',
            },
            {
                key: 'model',
                label: 'Default Groq Model',
                description: 'Target inference model for WhatsApp and background workforce',
                envVar: 'GROQ_MODEL',
                isSecret: false,
                required: false,
                placeholder: 'llama-3.3-70b-versatile',
            },
        ],
        requiredScopes: ['Inference API Access'],
    };
    getOnboardingSteps() {
        return [
            {
                stepNumber: 1,
                title: 'Navigate to Groq Console',
                description: 'Launch supervised browser and navigate to Groq API Keys settings.',
                actionRequired: 'AGENT_AUTOMATED',
                portalSubpath: '/keys',
            },
            {
                stepNumber: 2,
                title: 'User Authentication & MFA',
                description: 'User enters credentials, passes SSO or two-factor authentication in browser.',
                actionRequired: 'USER_INTERACTIVE',
            },
            {
                stepNumber: 3,
                title: 'Generate or Copy API Key',
                description: 'Click "Create API Key", name it "SalesmanPro Production", and copy value safely.',
                actionRequired: 'USER_SUPERVISED',
                fieldsToExtract: ['GROQ_API_KEY'],
            },
            {
                stepNumber: 4,
                title: 'Verify & Stage Credential',
                description: 'Validate key against Groq models endpoint without logging secret.',
                actionRequired: 'AGENT_AUTOMATED',
            },
        ];
    }
    async verifyCredentials(credentials) {
        const apiKey = credentials.GROQ_API_KEY || process.env.GROQ_API_KEY;
        const model = credentials.GROQ_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        if (!apiKey) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'INVALID',
                message: 'GROQ_API_KEY is missing or empty.',
            };
        }
        try {
            (0, secretRedaction_1.safeLog)('Testing Groq Cloud API connectivity...');
            const response = await fetch('https://api.groq.com/openai/v1/models', {
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
                    message: `Groq authentication failed with HTTP ${response.status}`,
                    error: errorText,
                };
            }
            const data = await response.json();
            const availableModels = Array.isArray(data.data) ? data.data.map((m) => m.id) : [];
            const hasTargetModel = availableModels.includes(model);
            return {
                providerId: this.metadata.providerId,
                success: true,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'VALID',
                message: `Successfully connected to Groq Cloud API. Found ${availableModels.length} models. Target model '${model}' is ${hasTargetModel ? 'AVAILABLE' : 'NOT FOUND'}.`,
                accountDetails: {
                    accountName: 'Groq Cloud Organization',
                    permissions: ['Inference'],
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
                message: 'Failed to communicate with Groq API endpoint.',
                error: (0, secretRedaction_1.formatSafeError)(err),
            };
        }
    }
}
exports.GroqAdapter = GroqAdapter;
exports.groqAdapter = new GroqAdapter();
