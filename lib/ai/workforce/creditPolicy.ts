/**
 * lib/ai/workforce/creditPolicy.ts
 *
 * Unified Credit & Budget Economics for the 3-Tier AI Workforce.
 * Connects directly to the existing immutable CreditLedger for Store Agents
 * and manages Super Admin Platform AI Budgets for Growth & Marketplace Agents.
 */

import prisma from "@/server/db/prismadb";
import { creditLedger } from "@/lib/ai/creditLedger";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { WorkforceExecutionContext, AgentWorkforceLevel } from "./types";
import { AIPlatformError } from "@/lib/ai/types";

export class WorkforceCreditPolicy {
  /**
   * Asserts that the agent execution has sufficient credits/budget and reserves credits.
   */
  public static async reserveBudget(
    context: WorkforceExecutionContext,
    estimatedCredits: number,
    operationDescription: string,
  ): Promise<{ reservationId?: string; isPlatformBudget: boolean }> {
    // 1. Check Super Admin global kill-switch
    const isGlobalKilled = await superAdminAIService.getGlobalKillSwitch().catch(() => false);
    if (isGlobalKilled) {
      throw new AIPlatformError(
        "AI_KILLED",
        "AI Workforce operations are temporarily paused platform-wide by Super Admin.",
        503,
      );
    }

    // 2. Level 2 (PLATFORM) and Level 3 (MARKETPLACE) draw from Super Admin Platform Budget
    if (context.level === AgentWorkforceLevel.PLATFORM || context.level === AgentWorkforceLevel.MARKETPLACE) {
      // Platform budget is monitored via PlatformAIServiceConfig and daily caps
      return { isPlatformBudget: true };
    }

    // 3. Level 1 (STORE) requires a valid companyId and uses tenant credits
    if (!context.companyId) {
      throw new AIPlatformError(
        "TENANT_REQUIRED",
        "A valid store tenant (companyId) is required for Store Workforce operations.",
        400,
      );
    }

    // Verify tenant has sufficient credits
    const balance = await creditLedger.getBalance(context.companyId);
    if (balance < estimatedCredits) {
      throw new AIPlatformError(
        "INSUFFICIENT_CREDITS",
        `Insufficient AI credits. Store balance is ${balance.toFixed(1)} credits, but ${estimatedCredits} are required. Please top up in AI Settings.`,
        402,
      );
    }

    const reservation = await creditLedger.reserveCredits({
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
  public static async settleBudget(params: {
    context: WorkforceExecutionContext;
    reservationId?: string;
    actualCredits: number;
    description: string;
  }) {
    if (params.context.level === AgentWorkforceLevel.STORE && params.context.companyId) {
      if (params.reservationId) {
        await creditLedger.finalizeCharge({
          companyId: params.context.companyId,
          reservationId: params.reservationId,
          finalAmount: params.actualCredits,
          description: params.description,
          metadata: {
            agentKey: params.context.agentKey,
            level: params.context.level,
            taskId: params.context.taskId,
          },
        });
      } else if (params.actualCredits > 0) {
        await creditLedger.chargeCredits({
          companyId: params.context.companyId,
          userId: params.context.userId,
          amount: params.actualCredits,
          description: params.description,
          metadata: {
            agentKey: params.context.agentKey,
            level: params.context.level,
            taskId: params.context.taskId,
          },
        });
      }
    }
  }

  /**
   * Refunds reserved credits if a task fails or aborts prematurely.
   */
  public static async releaseBudget(params: {
    context: WorkforceExecutionContext;
    reservationId?: string;
    reason: string;
  }) {
    if (params.reservationId && params.context.companyId) {
      await creditLedger.refundCredits({
        companyId: params.context.companyId,
        reservationId: params.reservationId,
        reason: params.reason,
      });
    }
  }
}
