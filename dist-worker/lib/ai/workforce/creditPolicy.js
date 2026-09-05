"use strict";
/**
 * lib/ai/workforce/creditPolicy.ts
 *
 * Unified Credit & Budget Economics for the 3-Tier AI Workforce.
 * Connects directly to the existing immutable CreditLedger for Store Agents
 * and manages Super Admin Platform AI Budgets for Growth & Marketplace Agents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceCreditPolicy = void 0;
const creditLedger_1 = require("@/lib/ai/creditLedger");
const superAdminService_1 = require("@/lib/ai/superAdminService");
const types_1 = require("./types");
const types_2 = require("@/lib/ai/types");
class WorkforceCreditPolicy {
    /**
     * Asserts that the agent execution has sufficient credits/budget and reserves credits.
     */
    static async reserveBudget(context, estimatedCredits, operationDescription) {
        // 1. Check Super Admin global kill-switch
        const isGlobalKilled = await superAdminService_1.superAdminAIService.getGlobalKillSwitch().catch(() => false);
        if (isGlobalKilled) {
            throw new types_2.AIPlatformError("AI_KILLED", "AI Workforce operations are temporarily paused platform-wide by Super Admin.", 503);
        }
        // 2. Level 2 (PLATFORM) and Level 3 (MARKETPLACE) draw from Super Admin Platform Budget
        if (context.level === types_1.AgentWorkforceLevel.PLATFORM || context.level === types_1.AgentWorkforceLevel.MARKETPLACE) {
            // Platform budget is monitored via PlatformAIServiceConfig and daily caps
            return { isPlatformBudget: true };
        }
        // 3. Level 1 (STORE) requires a valid companyId and uses tenant credits
        if (!context.companyId) {
            throw new types_2.AIPlatformError("TENANT_REQUIRED", "A valid store tenant (companyId) is required for Store Workforce operations.", 400);
        }
        // Verify tenant has sufficient credits
        const balance = await creditLedger_1.creditLedger.getBalance(context.companyId);
        if (balance < estimatedCredits) {
            throw new types_2.AIPlatformError("INSUFFICIENT_CREDITS", `Insufficient AI credits. Store balance is ${balance.toFixed(1)} credits, but ${estimatedCredits} are required. Please top up in AI Settings.`, 402);
        }
        const reservation = await creditLedger_1.creditLedger.reserveCredits({
            companyId: context.companyId,
            userId: context.userId,
            amount: estimatedCredits,
            description: operationDescription,
            metadata: {
                agentKey: context.agentKey,
                level: context.level,
                taskId: context.taskId,
            },
        });
        return {
            reservationId: reservation.transactionId,
            isPlatformBudget: false,
        };
    }
    /**
     * Finalizes credit consumption after tool or task completion.
     */
    static async settleBudget(params) {
        if (params.context.level === types_1.AgentWorkforceLevel.STORE && params.context.companyId) {
            if (params.reservationId) {
                await creditLedger_1.creditLedger.finalizeCharge({
                    companyId: params.context.companyId,
                    userId: params.context.userId,
                    reservedAmount: params.actualCredits,
                    actualAmount: params.actualCredits,
                    description: params.description,
                    referenceId: params.reservationId,
                    usageData: {
                        capability: "AGENT",
                        provider: "WORKFORCE",
                        model: params.context.agentKey || "agent",
                    },
                });
            }
            else if (params.actualCredits > 0) {
                await creditLedger_1.creditLedger.chargeCredits({
                    companyId: params.context.companyId,
                    userId: params.context.userId,
                    amount: params.actualCredits,
                    feature: params.context.agentKey || "WORKFORCE",
                    description: params.description,
                });
            }
        }
    }
    /**
     * Refunds reserved credits if a task fails or aborts prematurely.
     */
    static async releaseBudget(params) {
        if (params.reservationId && params.context.companyId) {
            await creditLedger_1.creditLedger.refundCredits({
                companyId: params.context.companyId,
                userId: params.context.userId,
                amount: params.context.estimatedCredits || 1,
                description: params.reason,
                referenceId: params.reservationId,
            });
        }
    }
}
exports.WorkforceCreditPolicy = WorkforceCreditPolicy;
