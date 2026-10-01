"use strict";
/**
 * lib/ai/creditLedger.ts
 *
 * Immutable, Transaction-Safe AI Credit Ledger for SalesmanPro Tenants.
 * Guarantees atomicity, idempotency, refund safety, and audit trails.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantWelcomeCredits = exports.creditLedger = exports.AICreditLedger = exports.DEFAULT_AI_PACKAGES = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
const aiConfig_1 = require("./aiConfig");
const TRANSACTION_OPTIONS = { maxWait: 20000, timeout: 60000 };
exports.DEFAULT_AI_PACKAGES = [
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
class AICreditLedger {
    /**
     * Authoritative check of a tenant company's credit balance.
     */
    async getBalance(companyId) {
        if (!companyId)
            return 0;
        const company = await prismadb_1.default.company.findUnique({
            where: { id: companyId },
            select: { aiCreditBalance: true },
        });
        return company?.aiCreditBalance ?? 0;
    }
    /**
     * Checks if tenant has sufficient balance for an operation.
     */
    async hasSufficientCredits(companyId, requiredCredits) {
        const currentBalance = await this.getBalance(companyId);
        return currentBalance >= requiredCredits;
    }
    /**
     * Atomically reserves credits before executing an AI generation job.
     * Prevents concurrent race conditions or overages.
     */
    async reserveCredits(params) {
        const { companyId, userId, amount, description, idempotencyKey, referenceId } = params;
        const metadata = {
            ...(params.metadata || {}),
            ...(params.capability ? { capability: params.capability } : {}),
        };
        if (amount <= 0) {
            const balance = await this.getBalance(companyId);
            return { transactionId: "zero_cost", reservationId: "zero_cost", balanceAfter: balance };
        }
        // Check idempotency first if key is provided
        if (idempotencyKey) {
            const existingTx = await prismadb_1.default.aICreditTransaction.findUnique({
                where: { idempotencyKey },
            });
            if (existingTx) {
                return {
                    transactionId: existingTx.id,
                    reservationId: existingTx.id,
                    balanceAfter: existingTx.balanceAfter ?? (await this.getBalance(companyId)),
                };
            }
        }
        return prismadb_1.default.$transaction(async (tx) => {
            const company = await tx.company.findUnique({
                where: { id: companyId },
                select: { aiCreditBalance: true },
            });
            if (!company) {
                throw new types_1.AIPlatformError("TENANT_NOT_FOUND", "Company tenant not found", 404);
            }
            if (company.aiCreditBalance < amount) {
                throw new types_1.AIPlatformError("INSUFFICIENT_CREDITS", `Insufficient AI credits. Required: ${amount}, Available: ${company.aiCreditBalance}. Please top up credits to proceed.`, 402, { required: amount, available: company.aiCreditBalance });
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
                    metadata: metadata ?? undefined,
                },
            });
            return {
                transactionId: transaction.id,
                reservationId: transaction.id,
                balanceAfter: updatedCompany.aiCreditBalance,
            };
        }, TRANSACTION_OPTIONS);
    }
    /**
     * Direct atomic charge for fixed-cost AI operations (e.g., store setup wizard, 1-click apply).
     */
    async chargeCredits(params) {
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
    async finalizeCharge(params) {
        const { companyId, userId, reservedAmount, actualAmount, description, idempotencyKey, usageData } = params;
        const referenceId = params.referenceId || params.reservationId;
        if (idempotencyKey) {
            const existingUsage = await prismadb_1.default.aIUsage.findFirst({
                where: { companyId, idempotencyKey },
            });
            if (existingUsage) {
                const balance = await this.getBalance(companyId);
                return { transactionId: existingUsage.id, balanceAfter: balance };
            }
        }
        const diff = reservedAmount - actualAmount;
        return prismadb_1.default.$transaction(async (tx) => {
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
            }
            else if (diff < 0) {
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
            }
            else {
                const company = await tx.company.findUnique({
                    where: { id: companyId },
                    select: { aiCreditBalance: true },
                });
                currentBalance = company?.aiCreditBalance ?? 0;
            }
            // Record detailed usage metric
            let usageId;
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
    async refundCredits(params) {
        const { companyId, userId, amount, idempotencyKey, metadata } = params;
        const description = params.description || params.reason || "Credit refund";
        const referenceId = params.referenceId || params.reservationId;
        if (amount <= 0) {
            const balance = await this.getBalance(companyId);
            return { transactionId: "zero_refund", balanceAfter: balance };
        }
        if (idempotencyKey) {
            const existingTx = await prismadb_1.default.aICreditTransaction.findUnique({
                where: { idempotencyKey },
            });
            if (existingTx) {
                return {
                    transactionId: existingTx.id,
                    balanceAfter: existingTx.balanceAfter ?? (await this.getBalance(companyId)),
                };
            }
        }
        return prismadb_1.default.$transaction(async (tx) => {
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
                    metadata: metadata ?? undefined,
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
    async topUpCredits(params) {
        const { companyId, userId, amount, type = "PURCHASE", description, referenceId, idempotencyKey, metadata, } = params;
        if (amount <= 0) {
            throw new types_1.AIPlatformError("INVALID_REQUEST", "Top-up credit amount must be positive", 400);
        }
        // Check idempotency to prevent duplicate charges or top-ups
        if (idempotencyKey) {
            const existing = await prismadb_1.default.aICreditTransaction.findUnique({
                where: { idempotencyKey },
            });
            if (existing) {
                const balance = await this.getBalance(companyId);
                return { transactionId: existing.id, newBalance: balance };
            }
        }
        return prismadb_1.default.$transaction(async (tx) => {
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
                    metadata: metadata ?? undefined,
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
    async grantWelcomeCredits(params) {
        const { companyId, userId } = params;
        const creditAmount = params.amount ?? aiConfig_1.WELCOME_AI_CREDITS;
        if (!companyId) {
            return { granted: false, amount: 0, balance: 0, reason: "MISSING_COMPANY_ID" };
        }
        const idempotencyKey = `welcome_credit_${companyId}`;
        // 1. Check idempotency: Has this company already received welcome credits?
        const existingTx = await prismadb_1.default.aICreditTransaction.findUnique({
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
            const userWelcomeGrantsCount = await prismadb_1.default.aICreditTransaction.count({
                where: {
                    userId,
                    type: "PROMOTIONAL",
                    idempotencyKey: { startsWith: "welcome_credit_" },
                },
            });
            if (userWelcomeGrantsCount >= aiConfig_1.MAX_WELCOME_GRANTS_PER_USER) {
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
        return prismadb_1.default.$transaction(async (tx) => {
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
                    description: aiConfig_1.WELCOME_CREDIT_DESCRIPTION,
                    referenceId: companyId,
                    idempotencyKey,
                    balanceAfter: updatedCompany.aiCreditBalance,
                    metadata: {
                        reason: aiConfig_1.WELCOME_CREDIT_REASON,
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
    async getTransactions(params) {
        const { companyId, page = 1, limit = 20, type } = params;
        const skip = (page - 1) * limit;
        const where = {
            companyId,
            ...(type ? { type } : {}),
        };
        const [transactions, total] = await Promise.all([
            prismadb_1.default.aICreditTransaction.findMany({
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
            prismadb_1.default.aICreditTransaction.count({ where }),
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
    async getUsageAnalytics(params) {
        const { companyId, timeframe = "month" } = params;
        let startDate;
        const now = new Date();
        if (timeframe === "day") {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        else if (timeframe === "week") {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        else if (timeframe === "month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const where = {
            companyId,
            ...(startDate ? { createdAt: { gte: startDate } } : {}),
        };
        const [usages, totalRequests, totalCreditsAgg, capabilityGroup] = await Promise.all([
            prismadb_1.default.aIUsage.findMany({
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
            prismadb_1.default.aIUsage.count({ where }),
            prismadb_1.default.aIUsage.aggregate({
                where,
                _sum: { creditsCost: true, totalTokens: true },
            }),
            prismadb_1.default.aIUsage.groupBy({
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
    async getPackages() {
        const dbPackages = await prismadb_1.default.aIPackage.findMany({
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
    async seedDefaultPackages() {
        const count = await prismadb_1.default.aIPackage.count();
        if (count === 0) {
            for (const pkg of exports.DEFAULT_AI_PACKAGES) {
                await prismadb_1.default.aIPackage.create({
                    data: pkg,
                });
            }
        }
        const seeded = await prismadb_1.default.aIPackage.findMany({
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
exports.AICreditLedger = AICreditLedger;
exports.creditLedger = new AICreditLedger();
const grantWelcomeCredits = (params) => exports.creditLedger.grantWelcomeCredits(params);
exports.grantWelcomeCredits = grantWelcomeCredits;
