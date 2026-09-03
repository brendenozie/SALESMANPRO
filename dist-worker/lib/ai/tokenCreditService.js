"use strict";
/**
 * lib/ai/tokenCreditService.ts
 *
 * WhatsApp & Messaging AI Credit Adapter.
 * Delegates exclusively to the centralized, authoritative CreditLedger.
 * Single source of truth: Company.aiCreditBalance & AICreditTransaction.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenCreditService = exports.TokenCreditService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const creditLedger_1 = require("./creditLedger");
class TokenCreditService {
    /**
     * Checks whether the company has sufficient credit balance to use AI features.
     */
    async hasAvailableCredit(companyId) {
        const config = await prismadb_1.default.whatsAppAIConfig.findUnique({
            where: { companyId },
            select: { enabled: true },
        });
        if (!config || !config.enabled)
            return false;
        const balance = await creditLedger_1.creditLedger.getBalance(companyId);
        return balance > 0;
    }
    /**
     * Deducts credits atomically and records usage in WhatsAppAIUsage & AIUsage ledger.
     */
    async deductAndRecordUsage(params) {
        const { companyId, conversationId, provider = "CUSTOM", model = "default-model", promptTokens = 0, completionTokens = 0, totalTokens, creditCost, } = params;
        if (totalTokens <= 0)
            return;
        const calculatedCreditCost = creditCost ?? Math.max(1, Math.ceil(totalTokens / 500));
        await prismadb_1.default.$transaction(async (tx) => {
            // Deduct from Company AI credit balance
            await tx.company.update({
                where: { id: companyId },
                data: {
                    aiCreditBalance: {
                        decrement: calculatedCreditCost,
                    },
                },
            });
            // Log to unified AICreditTransaction ledger
            await tx.aICreditTransaction.create({
                data: {
                    companyId,
                    amount: -calculatedCreditCost,
                    type: "USAGE",
                    status: "COMPLETED",
                    description: `WhatsApp AI Conversation (${model})`,
                    referenceId: conversationId,
                },
            });
            // Log usage metrics to WhatsAppAIUsage
            await tx.whatsAppAIUsage.create({
                data: {
                    companyId,
                    conversationId,
                    provider,
                    model,
                    inputTokens: promptTokens,
                    outputTokens: completionTokens,
                    totalTokens,
                },
            });
            // Also record in central AIUsage for platform telemetry
            await tx.aIUsage.create({
                data: {
                    companyId,
                    capability: "WHATSAPP",
                    provider: String(provider),
                    model,
                    promptTokens,
                    completionTokens,
                    totalTokens,
                    inputUnits: promptTokens,
                    outputUnits: completionTokens,
                    creditsCost: calculatedCreditCost,
                    source: "WHATSAPP",
                    feature: "whatsapp_message",
                    status: "SUCCESS",
                },
            });
        });
    }
    /**
     * Top-up AI credit balance upon payment confirmation.
     */
    async topUpCredits(companyId, creditAmount, description = "WhatsApp AI Credits Top-Up") {
        const result = await creditLedger_1.creditLedger.topUpCredits({
            companyId,
            amount: creditAmount,
            type: "PURCHASE",
            description,
        });
        return result.newBalance;
    }
}
exports.TokenCreditService = TokenCreditService;
exports.tokenCreditService = new TokenCreditService();
