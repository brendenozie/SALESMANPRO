/**
 * lib/ai/tokenCreditService.ts
 *
 * WhatsApp & Messaging AI Credit Adapter.
 * Delegates exclusively to the centralized, authoritative CreditLedger.
 * Single source of truth: Company.aiCreditBalance & AICreditTransaction.
 */

import prisma from "@/server/db/prismadb";
import { creditLedger } from "./creditLedger";
import { WhatsAppAIProvider } from "@prisma/client";

export class TokenCreditService {
  /**
   * Checks whether the company has sufficient credit balance to use AI features.
   */
  async hasAvailableCredit(companyId: string): Promise<boolean> {
    const config = await prisma.whatsAppAIConfig.findUnique({
      where: { companyId },
      select: { enabled: true },
    });

    if (!config || !config.enabled) return false;

    const balance = await creditLedger.getBalance(companyId);
    return balance > 0;
  }

  /**
   * Deducts credits atomically and records usage in WhatsAppAIUsage & AIUsage ledger.
   */
  async deductAndRecordUsage(params: {
    companyId: string;
    conversationId?: string;
    provider?: WhatsAppAIProvider;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens: number;
    creditCost?: number;
  }): Promise<void> {
    const {
      companyId,
      conversationId,
      provider = "CUSTOM",
      model = "default-model",
      promptTokens = 0,
      completionTokens = 0,
      totalTokens,
      creditCost,
    } = params;

    if (totalTokens <= 0) return;

    const calculatedCreditCost = creditCost ?? Math.max(1, Math.ceil(totalTokens / 500));

    await prisma.$transaction(async (tx) => {
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
  async topUpCredits(companyId: string, creditAmount: number, description = "WhatsApp AI Credits Top-Up"): Promise<number> {
    const result = await creditLedger.topUpCredits({
      companyId,
      amount: creditAmount,
      type: "PURCHASE",
      description,
    });

    return result.newBalance;
  }
}

export const tokenCreditService = new TokenCreditService();
