"use strict";
/**
 * lib/ai/aiConfig.ts
 *
 * Central configuration for SalesmanPro AI Credits, Pricing, and Onboarding Allowance.
 * Single source of truth for credit economics, welcome trial allowances, and abuse prevention.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WELCOME_CREDIT_DESCRIPTION = exports.WELCOME_CREDIT_REASON = exports.MAX_WELCOME_GRANTS_PER_USER = exports.WELCOME_AI_CREDITS = void 0;
// Introductory trial credits granted to new store companies exactly once
exports.WELCOME_AI_CREDITS = (() => {
    const envVal = process.env.WELCOME_AI_CREDITS;
    if (envVal) {
        const parsed = parseFloat(envVal);
        if (!isNaN(parsed) && parsed > 0)
            return parsed;
    }
    return 50; // Modest trial allowance (~25 descriptions or 2-3 marketing visuals)
})();
// Abuse prevention: maximum number of welcome credit grants allowable per user account
exports.MAX_WELCOME_GRANTS_PER_USER = (() => {
    const envVal = process.env.MAX_WELCOME_GRANTS_PER_USER;
    if (envVal) {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed) && parsed > 0)
            return parsed;
    }
    return 2; // Allow at most 2 stores per user account to receive welcome credits
})();
exports.WELCOME_CREDIT_REASON = "NEW_STORE_WELCOME";
exports.WELCOME_CREDIT_DESCRIPTION = "New store introductory AI credit allowance";
