"use strict";
// lib/subscriptions/enforce-limits.ts
/**
 * ============================================================================
 * SUBSCRIPTION ENTITLEMENT ENFORCEMENT
 * ============================================================================
 * Server-side guards that validate resource creation against the company's
 * active subscription plan limits. Used by API routes to prevent exceeding
 * plan-specific quotas (staff, agents, invoices, etc.) and to gate
 * boolean features (WhatsApp AI, bulk edit, custom domains).
 *
 * Usage:
 *   const check = await enforceStaffLimit(companyId);
 *   if (!check.allowed) return formatResponse(false, null, check.message, 403);
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceServiceLimit = exports.enforceMarketplaceItemLimit = exports.enforceVideoGenerationAccess = exports.enforceMarketplaceAccess = exports.enforceAiStudioAccess = exports.enforceWhatsAppAi = exports.enforceMultiCounterPos = exports.enforceCustomDomain = exports.enforceBulkProductEdit = exports.enforceFeatureGate = exports.enforceInvoiceLimit = exports.enforceSalesAgentLimit = exports.enforceStaffLimit = exports.resolveCompanySubscription = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const subscription_plans_1 = require("./subscription-plans");
/**
 * Resolves the active subscription and plan limits for a given company.
 * Falls back to Basic tier limits if no subscription is found.
 */
async function resolveCompanySubscription(companyId) {
    const now = new Date();
    const subscription = await prismadb_1.default.subscriptionCompany.findFirst({
        where: {
            companyId,
            status: { in: ["ACTIVE", "TRIALING", "AWAITING_CONFIRMATION", "PAST_DUE"] },
        },
        include: {
            plan: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!subscription || !subscription.plan) {
        // No active subscription → enforce Basic-tier limits
        const basicPlan = subscription_plans_1.AUTHORITATIVE_PLANS[0];
        return {
            planName: basicPlan.name,
            limits: basicPlan.limits,
            isActive: false,
            isTrial: false,
            plan: basicPlan,
        };
    }
    const isActive = Boolean(subscription.status === "ACTIVE" ||
        subscription.status === "TRIALING" ||
        (subscription.renewalDate && new Date(subscription.renewalDate) > now) ||
        (subscription.trialEndsAt && new Date(subscription.trialEndsAt) > now));
    const isTrial = Boolean(subscription.status === "TRIALING" ||
        subscription.billingCycle === "TRIAL" ||
        subscription.meta?.isTrial);
    const authPlan = (0, subscription_plans_1.getAuthoritativePlanByName)(subscription.plan.name) || subscription_plans_1.AUTHORITATIVE_PLANS[0];
    return {
        planName: authPlan.name,
        limits: authPlan.limits,
        isActive,
        isTrial,
        plan: authPlan,
    };
}
exports.resolveCompanySubscription = resolveCompanySubscription;
// ---------------------------------------------------------------------------
// Helper: Find the minimum tier that unlocks a limit
// ---------------------------------------------------------------------------
function findMinimumTierForLimit(checkFn) {
    for (const plan of subscription_plans_1.AUTHORITATIVE_PLANS) {
        if (checkFn(plan.limits))
            return plan.name;
    }
    return subscription_plans_1.AUTHORITATIVE_PLANS[subscription_plans_1.AUTHORITATIVE_PLANS.length - 1].name;
}
// ---------------------------------------------------------------------------
// Enforcement: Staff User Limit
// ---------------------------------------------------------------------------
async function enforceStaffLimit(companyId) {
    const sub = await resolveCompanySubscription(companyId);
    const limit = sub.limits.staffUsers;
    // -1 = unlimited
    if (limit === -1) {
        return { allowed: true, message: "Unlimited staff permitted.", planName: sub.planName };
    }
    const currentCount = await prismadb_1.default.staffProfile.count({ where: { companyId } });
    if (currentCount >= limit) {
        const upgradeRequired = findMinimumTierForLimit((l) => l.staffUsers === -1 || l.staffUsers > limit);
        return {
            allowed: false,
            message: `Staff limit reached. Your ${sub.planName} plan allows ${limit} staff member${limit !== 1 ? "s" : ""}. Upgrade to ${upgradeRequired} for more capacity.`,
            currentCount,
            limit,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return { allowed: true, message: "Within staff limit.", currentCount, limit, planName: sub.planName };
}
exports.enforceStaffLimit = enforceStaffLimit;
// ---------------------------------------------------------------------------
// Enforcement: Sales Agent Limit
// ---------------------------------------------------------------------------
async function enforceSalesAgentLimit(companyId) {
    const sub = await resolveCompanySubscription(companyId);
    const limit = sub.limits.salesAgents;
    // 0 = feature not available on this plan
    if (limit === 0) {
        const upgradeRequired = findMinimumTierForLimit((l) => l.salesAgents > 0);
        return {
            allowed: false,
            message: `Sales agents are not available on your ${sub.planName} plan. Upgrade to ${upgradeRequired} to add agents.`,
            currentCount: 0,
            limit: 0,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    // -1 = unlimited
    if (limit === -1) {
        return { allowed: true, message: "Unlimited sales agents permitted.", planName: sub.planName };
    }
    const currentCount = await prismadb_1.default.salesAgent.count({ where: { companyId } });
    if (currentCount >= limit) {
        const upgradeRequired = findMinimumTierForLimit((l) => l.salesAgents === -1 || l.salesAgents > limit);
        return {
            allowed: false,
            message: `Sales agent limit reached. Your ${sub.planName} plan allows ${limit} agent${limit !== 1 ? "s" : ""}. Upgrade to ${upgradeRequired} for more.`,
            currentCount,
            limit,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return { allowed: true, message: "Within sales agent limit.", currentCount, limit, planName: sub.planName };
}
exports.enforceSalesAgentLimit = enforceSalesAgentLimit;
// ---------------------------------------------------------------------------
// Enforcement: Invoice & Receipt Limit (Monthly Cap)
// ---------------------------------------------------------------------------
async function enforceInvoiceLimit(companyId) {
    const sub = await resolveCompanySubscription(companyId);
    const limit = sub.limits.invoicesReceipts;
    // -1 = unlimited
    if (limit === -1) {
        return { allowed: true, message: "Unlimited invoices permitted.", planName: sub.planName };
    }
    // Count invoices created this calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const currentCount = await prismadb_1.default.invoice.count({
        where: {
            companyId,
            issueDate: { gte: startOfMonth, lte: endOfMonth },
        },
    });
    if (currentCount >= limit) {
        const upgradeRequired = findMinimumTierForLimit((l) => l.invoicesReceipts === -1 || l.invoicesReceipts > limit);
        return {
            allowed: false,
            message: `Monthly invoice limit reached (${currentCount}/${limit}). Your ${sub.planName} plan allows ${limit} invoices per month. Upgrade to ${upgradeRequired} for more.`,
            currentCount,
            limit,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return { allowed: true, message: "Within monthly invoice limit.", currentCount, limit, planName: sub.planName };
}
exports.enforceInvoiceLimit = enforceInvoiceLimit;
// ---------------------------------------------------------------------------
// Enforcement: Boolean Feature Gates
// ---------------------------------------------------------------------------
async function enforceFeatureGate(companyId, feature) {
    const featureLabels = {
        bulkProductEdit: "Bulk Product Edit",
        customDomain: "Custom Domain",
        multiCounterPos: "Multi-Counter POS",
        whatsAppAi: "WhatsApp AI",
        sslCertificate: "SSL Certificate",
    };
    const sub = await resolveCompanySubscription(companyId);
    const isEnabled = sub.limits[feature];
    if (!isEnabled) {
        const upgradeRequired = findMinimumTierForLimit((l) => l[feature] === true);
        const label = featureLabels[feature] || feature;
        return {
            allowed: false,
            message: `${label} is not available on your ${sub.planName} plan. Upgrade to ${upgradeRequired} to unlock this feature.`,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return { allowed: true, message: `${featureLabels[feature] || feature} is enabled.`, planName: sub.planName };
}
exports.enforceFeatureGate = enforceFeatureGate;
// ---------------------------------------------------------------------------
// Convenience Wrappers for Common Boolean Gates
// ---------------------------------------------------------------------------
const enforceBulkProductEdit = (companyId) => enforceFeatureGate(companyId, "bulkProductEdit");
exports.enforceBulkProductEdit = enforceBulkProductEdit;
const enforceCustomDomain = (companyId) => enforceFeatureGate(companyId, "customDomain");
exports.enforceCustomDomain = enforceCustomDomain;
const enforceMultiCounterPos = (companyId) => enforceFeatureGate(companyId, "multiCounterPos");
exports.enforceMultiCounterPos = enforceMultiCounterPos;
const enforceWhatsAppAi = (companyId) => enforceFeatureGate(companyId, "whatsAppAi");
exports.enforceWhatsAppAi = enforceWhatsAppAi;
// ---------------------------------------------------------------------------
// Enforcement: AI Studio Access (requires monthlyAiCredits > 0 on plan)
// ---------------------------------------------------------------------------
/**
 * Blocks credit-consuming AI features on plans with 0 monthly AI credits (Basic).
 * Note: This checks PLAN entitlement, not the live credit balance.
 * The credit ledger's reserveCredits() handles balance insufficiency at consumption time.
 */
async function enforceAiStudioAccess(companyId) {
    const sub = await resolveCompanySubscription(companyId);
    const planCredits = sub.limits.monthlyAiCredits;
    // 0 means the plan itself doesn't include AI generation
    if (planCredits === 0) {
        const upgradeRequired = findMinimumTierForLimit((l) => l.monthlyAiCredits > 0);
        return {
            allowed: false,
            message: `AI Studio is not available on your ${sub.planName} plan. Upgrade to ${upgradeRequired} to unlock AI generation features (starts at 100 credits/month).`,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return {
        allowed: true,
        message: `AI Studio access granted (${planCredits === -1 ? "unlimited" : planCredits} plan credits/month).`,
        planName: sub.planName,
        limit: planCredits,
    };
}
exports.enforceAiStudioAccess = enforceAiStudioAccess;
// ---------------------------------------------------------------------------
// Enforcement: Marketplace Product Listings Access
// ---------------------------------------------------------------------------
/**
 * Gates marketplace listing creation/linking to plans that include the feature.
 * Marketplace (my-market-place & marketplace) is available from Ghuba Starter+.
 * Write operations (POST/PATCH/DELETE) should call this guard.
 */
/**
 * Gates marketplace listing creation/linking to plans that include the feature.
 * - Ghuba-initiated stores and marketplace merchants (showOnGhuba) have free marketplace access (up to 10 items).
 * - SalesmanPro-managed stores follow subscription plan entitlements (Starter+).
 * Write operations (POST/PATCH/DELETE) should call this guard.
 */
async function enforceMarketplaceAccess(companyId) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { storeOrigin: true, showOnGhuba: true },
    });
    // Ghuba-initiated stores and marketplace-enabled stores have free access for up to 10 listings
    const isGhubaEligible = company?.storeOrigin === "GHUBA" || company?.showOnGhuba === true;
    if (isGhubaEligible) {
        return {
            allowed: true,
            message: "Marketplace access granted.",
            planName: "Ghuba Marketplace Free Tier",
        };
    }
    const sub = await resolveCompanySubscription(companyId);
    // For regular SalesmanPro stores: marketplace is available on Starter Store (tierWeight >= 1)
    const STARTER_WEIGHT = 1;
    if (sub.plan.tierWeight < STARTER_WEIGHT) {
        const upgradeRequired = subscription_plans_1.AUTHORITATIVE_PLANS.find((p) => p.tierWeight >= STARTER_WEIGHT)?.displayName ??
            "Starter Store";
        return {
            allowed: false,
            message: `Marketplace product listings require ${upgradeRequired}. Your ${sub.planName} plan supports basic product management only. Upgrade to publish and manage marketplace listings.`,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return {
        allowed: true,
        message: "Marketplace access granted.",
        planName: sub.planName,
    };
}
exports.enforceMarketplaceAccess = enforceMarketplaceAccess;
// ---------------------------------------------------------------------------
// Enforcement: AI Video Generation Access
// ---------------------------------------------------------------------------
/**
 * Gates AI video generation (promotional product reels, animations).
 * Video generation requires Ghuba Pro+ (tierWeight ≥ 3, 500+ credits/month).
 */
async function enforceVideoGenerationAccess(companyId) {
    const sub = await resolveCompanySubscription(companyId);
    const PRO_WEIGHT = 2; // Business Pro & above
    if (sub.plan.tierWeight < PRO_WEIGHT) {
        const upgradeRequired = subscription_plans_1.AUTHORITATIVE_PLANS.find((p) => p.tierWeight >= PRO_WEIGHT)?.displayName ??
            "Business Pro";
        return {
            allowed: false,
            message: `AI Video Generation requires ${upgradeRequired}. Your ${sub.planName} plan does not include video generation capabilities. Upgrade to ${upgradeRequired}.`,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return {
        allowed: true,
        message: "AI Video Generation access granted.",
        planName: sub.planName,
    };
}
exports.enforceVideoGenerationAccess = enforceVideoGenerationAccess;
// ---------------------------------------------------------------------------
// Enforcement: Marketplace Item (Listing) Limit
// ---------------------------------------------------------------------------
/**
 * Numeric cap on marketplace listings per company.
 * - Ghuba-initiated stores without paid plan: exactly 10 eligible marketplace listings.
 * - Paid SalesmanPro plans: governed by plan limit (Starter: 25, Pro: 200, Growth: unlimited).
 * - Pass `batchSize` when creating multiple listings at once (e.g. bulk-create).
 */
async function enforceMarketplaceItemLimit(companyId, batchSize = 1) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { storeOrigin: true, showOnGhuba: true },
    });
    const sub = await resolveCompanySubscription(companyId);
    const isGhubaEligible = company?.storeOrigin === "GHUBA" || company?.showOnGhuba === true;
    // 1. If store has an active paid subscription with explicit marketplace listings capacity:
    if (sub.isActive && sub.limits.marketplaceListings !== 0) {
        const limit = sub.limits.marketplaceListings;
        // -1 = unlimited
        if (limit === -1) {
            return { allowed: true, message: "Unlimited marketplace listings permitted.", planName: sub.planName };
        }
        const currentCount = await prismadb_1.default.marketplaceListings.count({
            where: {
                companyId,
                status: "ACTIVE",
                showOnGhuba: true,
                ghubaStatus: { not: "REJECTED" },
                isAvailable: true,
            },
        });
        if (currentCount + batchSize > limit) {
            const upgradeRequired = findMinimumTierForLimit((l) => l.marketplaceListings === -1 || l.marketplaceListings > limit);
            return {
                allowed: false,
                message: `Marketplace listing limit reached (${currentCount}/${limit}). Your ${sub.planName} plan allows ${limit} listing${limit !== 1 ? "s" : ""}${batchSize > 1 ? ` and you are trying to add ${batchSize} more` : ""}. Upgrade to ${upgradeRequired} for more capacity.`,
                currentCount,
                limit,
                planName: sub.planName,
                upgradeRequired,
            };
        }
        return { allowed: true, message: "Within marketplace listing limit.", currentCount, limit, planName: sub.planName };
    }
    // 2. Ghuba-initiated store or free marketplace merchant: exactly 10 listings limit
    if (isGhubaEligible) {
        const GHUBA_FREE_LIMIT = 10;
        const currentCount = await prismadb_1.default.marketplaceListings.count({
            where: {
                companyId,
                status: "ACTIVE",
                showOnGhuba: true,
                ghubaStatus: { not: "REJECTED" },
                isAvailable: true,
            },
        });
        if (currentCount + batchSize > GHUBA_FREE_LIMIT) {
            return {
                allowed: false,
                message: `Marketplace listing limit reached (${currentCount}/${GHUBA_FREE_LIMIT}). You have reached your 10 marketplace listings limit. Upgrade to SalesmanPro Starter to add more items, launch your personal business website, and operate full POS.`,
                currentCount,
                limit: GHUBA_FREE_LIMIT,
                planName: "Ghuba Marketplace Free Tier",
                upgradeRequired: "Ghuba Starter",
            };
        }
        return {
            allowed: true,
            message: "Within marketplace listing limit.",
            currentCount,
            limit: GHUBA_FREE_LIMIT,
            planName: "Ghuba Marketplace Free Tier",
        };
    }
    // 3. Unsubscribed regular SalesmanPro tenant: feature not available
    const upgradeRequired = findMinimumTierForLimit((l) => l.marketplaceListings > 0);
    return {
        allowed: false,
        message: `Marketplace listings are not available on your ${sub.planName} plan. Upgrade to ${upgradeRequired} to publish listings.`,
        currentCount: 0,
        limit: 0,
        planName: sub.planName,
        upgradeRequired,
    };
}
exports.enforceMarketplaceItemLimit = enforceMarketplaceItemLimit;
// ---------------------------------------------------------------------------
// Enforcement: Service Limit
// ---------------------------------------------------------------------------
/**
 * Numeric cap on services per company.
 * Positive number = cap, -1 = unlimited.
 */
async function enforceServiceLimit(companyId) {
    const sub = await resolveCompanySubscription(companyId);
    const limit = sub.limits.services;
    // -1 = unlimited
    if (limit === -1) {
        return { allowed: true, message: "Unlimited services permitted.", planName: sub.planName };
    }
    const currentCount = await prismadb_1.default.service.count({ where: { companyId } });
    if (currentCount >= limit) {
        const upgradeRequired = findMinimumTierForLimit((l) => l.services === -1 || l.services > limit);
        return {
            allowed: false,
            message: `Service limit reached (${currentCount}/${limit}). Your ${sub.planName} plan allows ${limit} service${limit !== 1 ? "s" : ""}. Upgrade to ${upgradeRequired} for more capacity.`,
            currentCount,
            limit,
            planName: sub.planName,
            upgradeRequired,
        };
    }
    return { allowed: true, message: "Within service limit.", currentCount, limit, planName: sub.planName };
}
exports.enforceServiceLimit = enforceServiceLimit;
