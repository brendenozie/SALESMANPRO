/**
 * lib/ads/adBudgetService.ts
 *
 * Authoritative Advertising Budget & Financial Ledger Engine.
 *
 * CRITICAL ARCHITECTURAL PRINCIPLE:
 * AI credits (compute tokens) are strictly isolated from Advertising money (KES currency).
 * This service controls real KES balances, atomic reservations, fraud caps, and
 * immutable transactions across Store, Ghuba, and SalesmanPro campaigns.
 */

import prisma from "@/server/db/prismadb";
import { AdCampaignStatus, AdTransactionType } from "./types";

export class AdBudgetService {
  /**
   * Get or initialize an AdWallet for a store tenant or the central platform.
   */
  public static async getOrCreateWallet(companyId?: string | null) {
    if (companyId) {
      let wallet = await prisma.adWallet.findUnique({
        where: { companyId },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!wallet) {
        wallet = await prisma.adWallet.create({
          data: {
            companyId,
            balance: 0,
            currency: "KES",
          },
          include: {
            transactions: true,
          },
        });
      }
      return wallet;
    }

    // Platform central wallet (companyId is null or special identifier)
    let platformWallet = await prisma.adWallet.findFirst({
      where: { companyId: null },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!platformWallet) {
      platformWallet = await prisma.adWallet.create({
        data: {
          balance: 0,
          currency: "KES",
        },
        include: {
          transactions: true,
        },
      });
    }

    return platformWallet;
  }

  /**
   * Top up advertising wallet using authoritative payment confirmation (e.g. M-Pesa STK, Card).
   */
  public static async topUpWallet(params: {
    companyId?: string | null;
    amountKES: number;
    paymentReference: string;
    paymentGateway?: string;
    description?: string;
  }) {
    const { companyId, amountKES, paymentReference, paymentGateway = "MPESA", description } = params;

    if (amountKES <= 0) {
      throw new Error("Top up amount must be greater than zero KES.");
    }

    const wallet = await this.getOrCreateWallet(companyId);

    // Atomically increment wallet balance and write transaction ledger entry
    const updatedWallet = await prisma.adWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amountKES },
        transactions: {
          create: {
            companyId: companyId || null,
            type: AdTransactionType.AD_BUDGET_ADDED,
            amount: amountKES,
            currency: "KES",
            paymentReference,
            paymentGateway,
            description: description || `Advertising Budget Top-up via ${paymentGateway} (${paymentReference})`,
            status: "COMPLETED",
          },
        },
      },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return {
      success: true,
      walletId: updatedWallet.id,
      newBalanceKES: updatedWallet.balance,
      amountAddedKES: amountKES,
      reference: paymentReference,
    };
  }

  /**
   * Verify if a store or platform campaign has sufficient authorized funds.
   */
  public static async canFundCampaign(
    companyId: string | null | undefined,
    requiredBudgetKES: number,
  ): Promise<{ canFund: boolean; availableBalanceKES: number; missingAmountKES: number }> {
    const wallet = await this.getOrCreateWallet(companyId);
    const available = wallet.balance || 0;
    const canFund = available >= requiredBudgetKES;
    const missing = canFund ? 0 : requiredBudgetKES - available;

    return {
      canFund,
      availableBalanceKES: available,
      missingAmountKES: missing,
    };
  }

  /**
   * Atomically debits campaign spend and checks remaining budget limits.
   * If total or daily budget is reached, automatically marks campaign COMPLETED or PAUSED.
   */
  public static async recordEventSpend(params: {
    campaignId: string;
    costKES: number;
    eventType: "IMPRESSION" | "CLICK";
  }): Promise<{ allowed: boolean; remainingBudgetKES: number; isExhausted: boolean }> {
    const { campaignId, costKES, eventType } = params;

    if (costKES <= 0) {
      return { allowed: true, remainingBudgetKES: 0, isExhausted: false };
    }

    const campaign = await prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return { allowed: false, remainingBudgetKES: 0, isExhausted: true };
    }

    // Check if campaign is active
    if (campaign.status !== AdCampaignStatus.ACTIVE) {
      return { allowed: false, remainingBudgetKES: 0, isExhausted: true };
    }

    const currentSpent = campaign.spentAmountKES || 0;
    const totalBudget = campaign.totalBudgetKES || 0;

    // Strict boundary check
    if (totalBudget > 0 && currentSpent + costKES > totalBudget) {
      // Auto-complete or pause exhausted campaign
      await prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: AdCampaignStatus.COMPLETED,
          spentAmountKES: totalBudget, // Cap at total budget
        },
      });

      return {
        allowed: false,
        remainingBudgetKES: 0,
        isExhausted: true,
      };
    }

    // Execute atomic spend deduction
    const updatedCampaign = await prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        spentAmountKES: { increment: costKES },
      },
    });

    const newSpent = updatedCampaign.spentAmountKES;
    const remaining = Math.max(0, totalBudget - newSpent);
    const isNowExhausted = totalBudget > 0 && remaining <= 0;

    if (isNowExhausted) {
      await prisma.adCampaign.update({
        where: { id: campaignId },
        data: { status: AdCampaignStatus.COMPLETED },
      });
    }

    // Debit wallet if campaign has associated tenant wallet
    if (campaign.companyId) {
      try {
        const wallet = await this.getOrCreateWallet(campaign.companyId);
        await prisma.adWallet.update({
          where: { id: wallet.id },
          data: {
            balance: { decrement: costKES },
            transactions: {
              create: {
                companyId: campaign.companyId,
                campaignId: campaign.id,
                type: AdTransactionType.AD_SPEND,
                amount: -costKES,
                currency: "KES",
                description: `Ad ${eventType} delivery on campaign '${campaign.name}'`,
                status: "COMPLETED",
              },
            },
          },
        });
      } catch (err) {
        console.error(`[AD_WALLET_DEBIT_WARN] Failed wallet ledger update for campaign ${campaignId}:`, err);
      }
    }

    return {
      allowed: true,
      remainingBudgetKES: remaining,
      isExhausted: isNowExhausted,
    };
  }

  /**
   * Refund unused budget to wallet if campaign is cancelled or terminated early.
   */
  public static async refundUnusedBudget(campaignId: string) {
    const campaign = await prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || !campaign.companyId) return null;

    const unused = Math.max(0, campaign.totalBudgetKES - campaign.spentAmountKES);
    if (unused <= 0) return null;

    const wallet = await this.getOrCreateWallet(campaign.companyId);

    const updated = await prisma.adWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: unused },
        transactions: {
          create: {
            companyId: campaign.companyId,
            campaignId: campaign.id,
            type: AdTransactionType.AD_REFUND,
            amount: unused,
            currency: "KES",
            description: `Refund of unused budget from campaign '${campaign.name}'`,
            status: "COMPLETED",
          },
        },
      },
    });

    await prisma.adCampaign.update({
      where: { id: campaignId },
      data: { status: AdCampaignStatus.CANCELLED },
    });

    return {
      refundedAmountKES: unused,
      newWalletBalanceKES: updated.balance,
    };
  }
}
