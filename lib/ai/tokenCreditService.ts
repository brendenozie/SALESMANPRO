import prisma from "@/server/db/prismadb";
import { WhatsAppAIProvider } from "@prisma/client";

export class TokenCreditService {
  /**
   * Checks whether the company has sufficient token balance to use AI features.
   */
  async hasAvailableCredit(companyId: string): Promise<boolean> {
    const config = await prisma.whatsAppAIConfig.findUnique({
      where: { companyId },
      select: {
        enabled: true,
        aiTokenBalance: true,
        tokenLimitEnforced: true,
      },
    });

    if (!config || !config.enabled) return false;
    if (!config.tokenLimitEnforced) return true;

    return config.aiTokenBalance > 0;
  }

  /**
   * Deducts tokens atomically and records usage in WhatsAppAIUsage.
   */
  async deductAndRecordUsage(params: {
    companyId: string;
    conversationId?: string;
    provider?: WhatsAppAIProvider;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens: number;
  }): Promise<void> {
    const {
      companyId,
      conversationId,
      provider = "CUSTOM",
      model = "groq-default",
      promptTokens = 0,
      completionTokens = 0,
      totalTokens,
    } = params;

    if (totalTokens <= 0) return;

    await prisma.$transaction([
      // Deduct balance
      prisma.whatsAppAIConfig.update({
        where: { companyId },
        data: {
          aiTokenBalance: {
            decrement: totalTokens,
          },
        },
      }),
      // Log usage metrics
      prisma.whatsAppAIUsage.create({
        data: {
          companyId,
          conversationId,
          provider,
          model,
          inputTokens: promptTokens,
          outputTokens: completionTokens,
          totalTokens,
        },
      }),
    ]);
  }

  /**
   * Top-up AI token balance upon payment confirmation.
   */
  async topUpCredits(companyId: string, tokenAmount: number): Promise<number> {
    const updated = await prisma.whatsAppAIConfig.upsert({
      where: { companyId },
      update: {
        aiTokenBalance: { increment: tokenAmount },
        enabled: true,
      },
      create: {
        companyId,
        aiTokenBalance: tokenAmount,
        enabled: true,
      },
      select: { aiTokenBalance: true },
    });

    return updated.aiTokenBalance;
  }
}

export const tokenCreditService = new TokenCreditService();
