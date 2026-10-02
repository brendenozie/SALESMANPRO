"use strict";
/**
 * lib/automation/playwright/adapters/index.ts
 *
 * Central Adapter Registry for SalesmanPro Provider Onboarding & Health Checks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.smtpAdapter = exports.s3Adapter = exports.stripeAdapter = exports.paystackAdapter = exports.mpesaAdapter = exports.metaWhatsappAdapter = exports.googleGeminiAdapter = exports.openAiAdapter = exports.groqAdapter = exports.adapterRegistry = exports.AdapterRegistry = void 0;
const groqAdapter_1 = require("./groqAdapter");
Object.defineProperty(exports, "groqAdapter", { enumerable: true, get: function () { return groqAdapter_1.groqAdapter; } });
const openAiAdapter_1 = require("./openAiAdapter");
Object.defineProperty(exports, "openAiAdapter", { enumerable: true, get: function () { return openAiAdapter_1.openAiAdapter; } });
const googleGeminiAdapter_1 = require("./googleGeminiAdapter");
Object.defineProperty(exports, "googleGeminiAdapter", { enumerable: true, get: function () { return googleGeminiAdapter_1.googleGeminiAdapter; } });
const metaWhatsappAdapter_1 = require("./metaWhatsappAdapter");
Object.defineProperty(exports, "metaWhatsappAdapter", { enumerable: true, get: function () { return metaWhatsappAdapter_1.metaWhatsappAdapter; } });
const mpesaAdapter_1 = require("./mpesaAdapter");
Object.defineProperty(exports, "mpesaAdapter", { enumerable: true, get: function () { return mpesaAdapter_1.mpesaAdapter; } });
const paystackAdapter_1 = require("./paystackAdapter");
Object.defineProperty(exports, "paystackAdapter", { enumerable: true, get: function () { return paystackAdapter_1.paystackAdapter; } });
const stripeAdapter_1 = require("./stripeAdapter");
Object.defineProperty(exports, "stripeAdapter", { enumerable: true, get: function () { return stripeAdapter_1.stripeAdapter; } });
const s3Adapter_1 = require("./s3Adapter");
Object.defineProperty(exports, "s3Adapter", { enumerable: true, get: function () { return s3Adapter_1.s3Adapter; } });
const smtpAdapter_1 = require("./smtpAdapter");
Object.defineProperty(exports, "smtpAdapter", { enumerable: true, get: function () { return smtpAdapter_1.smtpAdapter; } });
class AdapterRegistry {
    static instance;
    adapters = new Map();
    constructor() {
        this.register(groqAdapter_1.groqAdapter);
        this.register(openAiAdapter_1.openAiAdapter);
        this.register(googleGeminiAdapter_1.googleGeminiAdapter);
        this.register(metaWhatsappAdapter_1.metaWhatsappAdapter);
        this.register(mpesaAdapter_1.mpesaAdapter);
        this.register(paystackAdapter_1.paystackAdapter);
        this.register(stripeAdapter_1.stripeAdapter);
        this.register(s3Adapter_1.s3Adapter);
        this.register(smtpAdapter_1.smtpAdapter);
    }
    static getInstance() {
        if (!AdapterRegistry.instance) {
            AdapterRegistry.instance = new AdapterRegistry();
        }
        return AdapterRegistry.instance;
    }
    register(adapter) {
        this.adapters.set(adapter.metadata.providerId, adapter);
    }
    getAdapter(providerId) {
        return this.adapters.get(providerId);
    }
    getAllAdapters() {
        return Array.from(this.adapters.values());
    }
    /**
     * Run verification check across all registered adapters or a specific subset.
     */
    async verifyAll(credentialsOverrides = {}) {
        const results = [];
        for (const adapter of this.adapters.values()) {
            try {
                const res = await adapter.verifyCredentials(credentialsOverrides);
                results.push(res);
            }
            catch (err) {
                results.push({
                    providerId: adapter.metadata.providerId,
                    success: false,
                    testedAt: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                    credentialStatus: 'INVALID',
                    message: `Unexpected error during verification: ${err.message}`,
                });
            }
        }
        return results;
    }
}
exports.AdapterRegistry = AdapterRegistry;
exports.adapterRegistry = AdapterRegistry.getInstance();
