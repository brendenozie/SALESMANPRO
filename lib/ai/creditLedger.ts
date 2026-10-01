/**
 * lib/ai/creditLedger.ts
 *
 * Immutable, Transaction-Safe AI Credit Ledger for SalesmanPro Tenants.
 * Guarantees atomicity, idempotency, refund safety, and audit trails.
 */

import prisma from "@/server/db/prismadb";
import {
  AICapability,
  AICreditTransactionType,
  AICreditTransactionStatus,
  AIPlatformError,
  AIPackageDTO,
} from "./types";
import {
  WELCOME_AI_CREDITS,
  MAX_WELCOME_GRANTS_PER_USER,
  WELCOME_CREDIT_REASON,
  WELCOME_CREDIT_DESCRIPTION,
} from "./aiConfig";
import { Prisma } from "@prisma/client";

const TRANSACTION_OPTIONS = { maxWait: 20000, timeout: 60000 };

export const DEFAULT_AI_PACKAGES: Array<{
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
  badge?: string;
  isPopular: boolean;
  features: string[];
}> = [
  {
    name: "Starter AI",
    credits: 1000,
    price: 10,
    currency: "USD",
    description: "Ideal for new stores launching initial products, SEO, and WhatsApp automation.",
    isPopular: false,
    features: [
      "1,000 AI Credits",
      "~500 Product Descriptions",
      "~50 AI Image Generations",
      "WhatsApp Concierge Auto-reply",
      "Valid for all models",
    ],
  },
  {
    name: "Growth AI",
    credits: 5000,
    price: 45,
    currency: "USD",
    description: "Best for scaling stores running active marketing campaigns and high-volume WhatsApp chats.",
    badge: "Most Popular",
    isPopular: true,
    features: [
      "5,000 AI Credits (10% Bonus)",
      "~2,500 Product Descriptions",
      "~250 AI Product Studio Photos",
      "~100 Short AI Video Clips",
      "Full CRM & WhatsApp Concierge",
      "Priority Queue Processing",
    ],
  },
  {
    name: "Professional AI",
    credits: 15000,
    price: 120,
    currency: "USD",
    description: "Designed for high-traffic retailers, multi-product catalogs, and continuous AI image/video creation.",
    badge: "Best Value",
    isPopular: false,
    features: [
      "15,000 AI Credits (20% Bonus)",
      "~7,500 Product Descriptions",
      "~750 HD AI Product Photos",
      "~350 Promotional Videos",
      "Unlimited WhatsApp Customer AI",
      "Advanced Multimodal Vision",
      "Dedicated Queue Priority",
    ],
  },
  {
    name: "Enterprise AI",
    credits: 50000,
    price: 350,
    currency: "USD",
    description: "Full-scale commerce automation for large enterprises, multi-location stores, and automated agents.",
    badge: "Enterprise",
    isPopular: false,
    features: [
      "50,000 AI Credits (40% Bonus)",
      "Unlimited Web & WhatsApp Agents",
      "Batch Image & Video Rendering",
      "Highest Model Token Limits",
      "Custom System Prompts & Knowledge Base",
      "24/7 SLA & Dedicated Support",
    ],
  },
];

export class AICreditLedger {
  /**
   * Authoritative check of a tenant company's credit balance.
   */
  public async getBalance(companyId: string): Promise<number> {
    if (!companyId) return 0;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { aiCreditBalance: true },
    });

    return company?.aiCreditBalance ?? 0;
  }

  /**
   * Checks if tenant has sufficient balance for an operation.
   */
  public async hasSufficientCredits(companyId: string, requiredCredits: number): Promise<boolean> {
    const currentBalance = await this.getBalance(companyId);
    return currentBalance >= requiredCredits;
  }

  /**
   * Atomically reserves credits before executing an AI generation job.
   * Prevents concurrent race conditions or overages.
   */
  public async reserveCredits(params: {
    companyId: string;
    userId?: string;
    amount: number;
    description: string;
    idempotencyKey?: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ transactionId: string; balanceAfter: number }> {
    const { companyId, userId, amount, description, idempotencyKey, referenceId, metadata } = params;

    if (amount <= 0) {
      const balance = await this.getBalance(companyId);
      return { transactionId: "zero_cost", balanceAfter: balance };
    }

    // Check idempotency first if key is provided
    if (idempotencyKey) {
      const existingTx = await prisma.aICreditTransaction.findUnique({
        where: { idempotencyKey },
      });

      if (existingTx) {
        return {
          transactionId: existingTx.id,
          balanceAfter: existingTx.balanceAfter ?? (await this.getBalance(companyId)),
        };
      }
    }

    return prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: { aiCreditBalance: true },
      });

      if (!company) {
        throw new AIPlatformError("TENANT_NOT_FOUND", "Company tenant not found", 404);
      }

      if (company.aiCreditBalance < amount) {
        throw new AIPlatformError(
          "INSUFFICIENT_CREDITS",
          `Insufficient AI credits. Required: ${amount}, Available: ${company.aiCreditBalance}. Please top up credits to proceed.`,
          402,
          { required: amount, available: company.aiCreditBalance },
        );
      }

      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: {
          aiCreditBalance: {
            decrement: amount,
          },
        },
        select: { aiCreditBalance: true },
      });

      const transaction = await tx.aICreditTransaction.create({
        data: {
          companyId,
          userId,
          amount: -amount,
          type: "RESERVATION",
          status: "COMPLETED",
          description,
          idempotencyKey,
          referenceId,
          balanceAfter: updatedCompany.aiCreditBalance,
          metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
        },
      });

      return {
        transactionId: transaction.id,
        balanceAfter: updatedCompany.aiCreditBalance,
      };
    }, TRANSACTION_OPTIONS);
  }

  /**
   * Direct atomic charge for fixed-cost AI operations (e.g., store setup wizard, 1-click apply).
   */
  public async chargeCredits(params: {
    companyId: string;
    userId?: string;
    amount: number;
    feature: string;
    description: string;
    idempotencyKey?: string;
  }): Promise<{ transactionId: string; balanceAfter: number }> {
    await this.reserveCredits({
      companyId: params.companyId,
      userId: params.userId,
      amount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey ? `res_${params.idempotencyKey}` : undefined,
    });

    return this.finalizeCharge({
      companyId: params.companyId,
      userId: params.userId,
      reservedAmount: params.amount,
      actualAmount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      usageData: {
        capability: "PRODUCT_CONTENT",
        provider: "PLATFORM",
        model: "fixed_feature",
        feature: params.feature,
      },
    });
  }

  /**
   * Finalizes an AI credit charge.
   * If actual consumption is lower than reserved, refunds the difference.
   * If actual consumption is higher, deducts additional amount.
   */
  public async finalizeCharge(params: {
    companyId: string;
    userId?: string;
    reservedAmount: number;
    actualAmount: number;
    description: string;
    idempotencyKey?: string;
    referenceId?: string;
    usageData?: {
      capability: AICapability;
      provider: string;
      model: string;
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
      inputUnits?: number;
      outputUnits?: number;
      source?: string;
      feature?: string;
      executionTimeMs?: number;
      errorMessage?: string;
    };
  }): Promise<{ transactionId: string; balanceAfter: number }> {
    const { companyId, userId, reservedAmount, actualAmount, description, idempotencyKey, referenceId, usageData } =
      params;

    if (idempotencyKey) {
      const existingUsage = await prisma.aIUsage.findFirst({
        where: { companyId, idempotencyKey },
      });
      if (existingUsage) {
        const balance = await this.getBalance(companyId);
        return { transactionId: existingUsage.id, balanceAfter: balance };
      }
    }

    const diff = reservedAmount - actualAmount;

    return prisma.$transaction(async (tx) => {
      let currentBalance = 0;

      if (diff > 0) {
        // Actual cost was LESS than reserved -> refund the excess credits
        const updated = await tx.company.update({
          where: { id: companyId },
          data: {
            aiCreditBalance: { increment: diff },
          },
          select: { aiCreditBalance: true },
        });
        currentBalance = updated.aiCreditBalance;

        await tx.aICreditTransaction.create({
          data: {
            companyId,
            userId,
            amount: diff,
            type: "RELEASE",
            status: "COMPLETED",
            description: `Adjustment: ${description} (Reserved ${reservedAmount}, Actual ${actualAmount})`,
            referenceId,
            balanceAfter: currentBalance,
          },
        });
      } else if (diff < 0) {
        // Actual cost was MORE than reserved -> deduct additional
        const additional = Math.abs(diff);
        const updated = await tx.company.update({
          where: { id: companyId },
          data: {
            aiCreditBalance: { decrement: additional },
          },
          select: { aiCreditBalance: true },
        });
        currentBalance = updated.aiCreditBalance;

        await tx.aICreditTransaction.create({
          data: {
            companyId,
            userId,
            amount: -additional,
            type: "USAGE",
            status: "COMPLETED",
            description: `Over-estimate adjustment: ${description}`,
            referenceId,
            balanceAfter: currentBalance,
          },
        });
      } else {
        const company = await tx.company.findUnique({
          where: { id: companyId },
          select: { aiCreditBalance: true },
        });
        currentBalance = company?.aiCreditBalance ?? 0;
      }

      // Record detailed usage metric
      let usageId: string | undefined;
      if (usageData) {
        const usageRecord = await tx.aIUsage.create({
          data: {
            companyId,
            userId,
            capability: usageData.capability,
            provider: usageData.provider,
            model: usageData.model,
            promptTokens: usageData.promptTokens ?? 0,
            completionTokens: usageData.completionTokens ?? 0,
            totalTokens: usageData.totalTokens ?? 0,
            inputUnits: usageData.inputUnits ?? 0,
            outputUnits: usageData.outputUnits ?? 0,
            creditsCost: actualAmount,
            source: usageData.source ?? "WEB",
            feature: usageData.feature,
            status: usageData.errorMessage ? "FAILED" : "SUCCESS",
            errorMessage: usageData.errorMessage,
            executionTimeMs: usageData.executionTimeMs,
            idempotencyKey,
          },
        });
        usageId = usageRecord.id;
      }

      return {
        transactionId: usageId || referenceId || `tx_${Date.now()}`,
        balanceAfter: currentBalance,
      };
    }, TRANSACTION_OPTIONS);
  }

  /**
   * Refunds reserved credits when generation fails or is cancelled.
   */
  public async refundCredits(params: {
    companyId: string;
    userId?: string;
    amount: number;
    description?: string;
    reason?: string;
    reservationId?: string;
    idempotencyKey?: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ transactionId: string; balanceAfter: number }> {
    const { companyId, userId, amount, idempotencyKey, metadata } = params;
    const description = params.description || params.reason || "Credit refund";
    const referenceId = params.referenceId || params.reservationId;

    if (amount <= 0) {
      const balance = await this.getBalance(companyId);
      return { transactionId: "zero_refund", balanceAfter: balance };
    }

    if (idempotencyKey) {
      const existingTx = await prisma.aICreditTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) {
        return {
          transactionId: existingTx.id,
          balanceAfter: existingTx.balanceAfter ?? (await this.getBalance(companyId)),
        };
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id: companyId },
        data: {
          aiCreditBalance: { increment: amount },
        },
        select: { aiCreditBalance: true },
      });

      const transaction = await tx.aICreditTransaction.create({
        data: {
          companyId,
          userId,
          amount,
          type: "REFUND",
          status: "COMPLETED",
          description,
          idempotencyKey,
          referenceId,
          balanceAfter: updated.aiCreditBalance,
          metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
        },
      });

      return {
        transactionId: transaction.id,
        balanceAfter: updated.aiCreditBalance,
      };
    }, TRANSACTION_OPTIONS);
  }

  /**
   * Top up tenant credits upon payment confirmation or promotional grant.
   */
  public async topUpCredits(params: {
    companyId: string;
    userId?: string;
    amount: number;
    type?: AICreditTransactionType;
    description: string;
    referenceId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ transactionId: string; newBalance: number }> {
    const {
      companyId,
      userId,
      amount,
      type = "PURCHASE",
      description,
      referenceId,
      idempotencyKey,
      metadata,
    } = params;

    if (amount <= 0) {
      throw new AIPlatformError("INVALID_REQUEST", "Top-up credit amount must be positive", 400);
    }

    // Check idempotency to prevent duplicate charges or top-ups
    if (idempotencyKey) {
      const existing = await prisma.aICreditTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        const balance = await this.getBalance(companyId);
        return { transactionId: existing.id, newBalance: balance };
      }
    }

    return prisma.$transaction(async (tx) => {
      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: {
          aiCreditBalance: { increment: amount },
        },
        select: { aiCreditBalance: true },
      });

      // Also ensure WhatsApp AI config has enabled status
      await tx.whatsAppAIConfig.upsert({
        where: { companyId },
        update: { enabled: true },
        create: { companyId, enabled: true },
      });

      const transaction = await tx.aICreditTransaction.create({
        data: {
          companyId,
          userId,
          amount,
          type,
          status: "COMPLETED",
          description,
          referenceId,
          idempotencyKey,
          balanceAfter: updatedCompany.aiCreditBalance,
          metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
        },
      });

      return {
        transactionId: transaction.id,
        newBalance: updatedCompany.aiCreditBalance,
      };
    }, TRANSACTION_OPTIONS);
  }

  /**
   * Grants introductory trial credits to a newly created store company.
   * Guarantees exact-once idempotency, anti-abuse checks, and audit logging.
   */
  public async grantWelcomeCredits(params: {
    companyId: string;
    userId?: string;
    amount?: number;
  }): Promise<{ granted: boolean; amount: number; balance: number; transactionId?: string; reason?: string }> {
    const { companyId, userId } = params;
    const creditAmount = params.amount ?? WELCOME_AI_CREDITS;

    if (!companyId) {
      return { granted: false, amount: 0, balance: 0, reason: "MISSING_COMPANY_ID" };
    }

    const idempotencyKey = `welcome_credit_${companyId}`;

    // 1. Check idempotency: Has this company already received welcome credits?
    const existingTx = await prisma.aICreditTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTx) {
      const balance = await this.getBalance(companyId);
      return {
        granted: false,
        amount: existingTx.amount,
        balance,
        transactionId: existingTx.id,
        reason: "ALREADY_GRANTED",
      };
    }

    // 2. Abuse prevention check: Has this user already claimed max welcome grants?
    if (userId) {
      const userWelcomeGrantsCount = await prisma.aICreditTransaction.count({
        where: {
          userId,
          type: "PROMOTIONAL",
          idempotencyKey: { startsWith: "welcome_credit_" },
        },
      });

      if (userWelcomeGrantsCount >= MAX_WELCOME_GRANTS_PER_USER) {
        const balance = await this.getBalance(companyId);
        return {
          granted: false,
          amount: 0,
          balance,
          reason: "USER_WELCOME_LIMIT_REACHED",
        };
      }
    }

    // 3. Atomically grant credits and record in immutable ledger
    return prisma.$transaction(async (tx) => {
      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: {
          aiCreditBalance: { increment: creditAmount },
        },
        select: { aiCreditBalance: true },
      });

      // Ensure WhatsApp AI is enabled so new store can test WhatsApp AI Studio
      await tx.whatsAppAIConfig.upsert({
        where: { companyId },
        update: { enabled: true },
        create: { companyId, enabled: true },
      });

      const transaction = await tx.aICreditTransaction.create({
        data: {
          companyId,
          userId,
          amount: creditAmount,
          type: "PROMOTIONAL",
          status: "COMPLETED",
          description: WELCOME_CREDIT_DESCRIPTION,
          referenceId: companyId,
          idempotencyKey,
          balanceAfter: updatedCompany.aiCreditBalance,
          metadata: {
            reason: WELCOME_CREDIT_REASON,
            grantedAt: new Date().toISOString(),
          },
        },
      });

      return {
        granted: true,
        amount: creditAmount,
        balance: updatedCompany.aiCreditBalance,
        transactionId: transaction.id,
      };
    }, TRANSACTION_OPTIONS);
  }

  /**
   * Retrieves paginated transaction history for tenant credit accounting.
   */
  public async getTransactions(params: {
    companyId: string;
    page?: number;
    limit?: number;
    type?: AICreditTransactionType;
  }) {
    const { companyId, page = 1, limit = 20, type } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AICreditTransactionWhereInput = {
      companyId,
      ...(type ? { type } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.aICreditTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          balanceAfter: true,
          referenceId: true,
          createdAt: true,
        },
      }),
      prisma.aICreditTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves tenant AI usage metrics and analytics summaries.
   */
  public async getUsageAnalytics(params: {
    companyId: string;
    timeframe?: "day" | "week" | "month" | "all";
  }) {
    const { companyId, timeframe = "month" } = params;

    let startDate: Date | undefined;
    const now = new Date();

    if (timeframe === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const where: Prisma.AIUsageWhereInput = {
      companyId,
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    };

    const [usages, totalRequests, totalCreditsAgg, capabilityGroup] = await Promise.all([
      prisma.aIUsage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          capability: true,
          provider: true,
          model: true,
          creditsCost: true,
          source: true,
          feature: true,
          status: true,
          createdAt: true,
          totalTokens: true,
          executionTimeMs: true,
        },
      }),
      prisma.aIUsage.count({ where }),
      prisma.aIUsage.aggregate({
        where,
        _sum: { creditsCost: true, totalTokens: true },
      }),
      prisma.aIUsage.groupBy({
        by: ["capability"],
        where,
        _count: { id: true },
        _sum: { creditsCost: true },
      }),
    ]);

    const totalCreditsUsed = totalCreditsAgg._sum.creditsCost ?? 0;
    const totalTokensUsed = totalCreditsAgg._sum.totalTokens ?? 0;

    return {
      timeframe,
      totalRequests,
      totalCreditsUsed,
      totalTokensUsed,
      byCapability: capabilityGroup.map((g) => ({
        capability: g.capability,
        requests: g._count.id,
        credits: g._sum.creditsCost ?? 0,
      })),
      recentUsages: usages,
    };
  }

  /**
   * Retrieves configured AI Credit Purchase Packages.
   */
  public async getPackages(): Promise<AIPackageDTO[]> {
    const dbPackages = await prisma.aIPackage.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    if (dbPackages.length > 0) {
      return dbPackages.map((p) => ({
        id: p.id,
        name: p.name,
        credits: p.credits,
        price: p.price,
        currency: p.currency,
        description: p.description,
        badge: p.badge,
        isPopular: p.isPopular,
        features: p.features,
      }));
    }

    // Seed default packages if empty in DB
    return this.seedDefaultPackages();
  }

  /**
   * Initializes default AI credit packages in the database if not present.
   */
  public async seedDefaultPackages(): Promise<AIPackageDTO[]> {
    const count = await prisma.aIPackage.count();
    if (count === 0) {
      for (const pkg of DEFAULT_AI_PACKAGES) {
        await prisma.aIPackage.create({
          data: pkg,
        });
      }
    }

    const seeded = await prisma.aIPackage.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    return seeded.map((p) => ({
      id: p.id,
      name: p.name,
      credits: p.credits,
      price: p.price,
      currency: p.currency,
      description: p.description,
      badge: p.badge,
      isPopular: p.isPopular,
      features: p.features,
    }));
  }
}

export const creditLedger = new AICreditLedger();
export const grantWelcomeCredits = (params: {
  companyId: string;
  userId?: string;
  amount?: number;
}) => creditLedger.grantWelcomeCredits(params);
