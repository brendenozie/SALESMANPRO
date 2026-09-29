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

import prisma from "@/server/db/prismadb";
import {
  AUTHORITATIVE_PLANS,
  getAuthoritativePlanByName,
  type PlanLimits,
  type AuthoritativePlan,
} from "./subscription-plans";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnforcementResult {
  allowed: boolean;
  message: string;
  currentCount?: number;
  limit?: number;
  planName?: string;
  upgradeRequired?: string; // The tier name needed to unlock
}

// ---------------------------------------------------------------------------
// Core: Resolve Active Subscription → Plan Limits
// ---------------------------------------------------------------------------

interface ResolvedSubscription {
  planName: string;
  limits: PlanLimits;
  isActive: boolean;
  isTrial: boolean;
  plan: AuthoritativePlan;
}

/**
 * Resolves the active subscription and plan limits for a given company.
 * Falls back to Basic tier limits if no subscription is found.
 */
export async function resolveCompanySubscription(
  companyId: string
): Promise<ResolvedSubscription> {
  const now = new Date();

  const subscription = await prisma.subscriptionCompany.findFirst({
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
    const basicPlan = AUTHORITATIVE_PLANS[0];
    return {
      planName: basicPlan.name,
      limits: basicPlan.limits,
      isActive: false,
      isTrial: false,
      plan: basicPlan,
    };
  }

  const isActive = Boolean(
    subscription.status === "ACTIVE" ||
      subscription.status === "TRIALING" ||
      (subscription.renewalDate && new Date(subscription.renewalDate) > now) ||
      (subscription.trialEndsAt && new Date(subscription.trialEndsAt) > now)
  );

  const isTrial = Boolean(
    subscription.status === "TRIALING" ||
      subscription.billingCycle === "TRIAL" ||
      (subscription.meta as any)?.isTrial
  );

  const authPlan =
    getAuthoritativePlanByName(subscription.plan.name) || AUTHORITATIVE_PLANS[0];

  return {
    planName: authPlan.name,
    limits: authPlan.limits,
    isActive,
    isTrial,
    plan: authPlan,
  };
}

// ---------------------------------------------------------------------------
// Helper: Find the minimum tier that unlocks a limit
// ---------------------------------------------------------------------------

function findMinimumTierForLimit(
  checkFn: (limits: PlanLimits) => boolean
): string {
  for (const plan of AUTHORITATIVE_PLANS) {
    if (checkFn(plan.limits)) return plan.name;
  }
  return AUTHORITATIVE_PLANS[AUTHORITATIVE_PLANS.length - 1].name;
}

// ---------------------------------------------------------------------------
// Enforcement: Staff User Limit
// ---------------------------------------------------------------------------

export async function enforceStaffLimit(
  companyId: string
): Promise<EnforcementResult> {
  const sub = await resolveCompanySubscription(companyId);
  const limit = sub.limits.staffUsers;

  // -1 = unlimited
  if (limit === -1) {
    return { allowed: true, message: "Unlimited staff permitted.", planName: sub.planName };
  }

  const currentCount = await prisma.staffProfile.count({ where: { companyId } });

  if (currentCount >= limit) {
    const upgradeRequired = findMinimumTierForLimit(
      (l) => l.staffUsers === -1 || l.staffUsers > limit
    );
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

// ---------------------------------------------------------------------------
// Enforcement: Sales Agent Limit
// ---------------------------------------------------------------------------

export async function enforceSalesAgentLimit(
  companyId: string
): Promise<EnforcementResult> {
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

  const currentCount = await prisma.salesAgent.count({ where: { companyId } });

  if (currentCount >= limit) {
    const upgradeRequired = findMinimumTierForLimit(
      (l) => l.salesAgents === -1 || l.salesAgents > limit
    );
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

// ---------------------------------------------------------------------------
// Enforcement: Invoice & Receipt Limit (Monthly Cap)
// ---------------------------------------------------------------------------

export async function enforceInvoiceLimit(
  companyId: string
): Promise<EnforcementResult> {
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

  const currentCount = await prisma.invoice.count({
    where: {
      companyId,
      issueDate: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  if (currentCount >= limit) {
    const upgradeRequired = findMinimumTierForLimit(
      (l) => l.invoicesReceipts === -1 || l.invoicesReceipts > limit
    );
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

// ---------------------------------------------------------------------------
// Enforcement: Boolean Feature Gates
// ---------------------------------------------------------------------------

export async function enforceFeatureGate(
  companyId: string,
  feature: keyof Pick<PlanLimits, "bulkProductEdit" | "customDomain" | "multiCounterPos" | "whatsAppAi" | "sslCertificate">
): Promise<EnforcementResult> {
  const featureLabels: Record<string, string> = {
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

// ---------------------------------------------------------------------------
// Convenience Wrappers for Common Boolean Gates
// ---------------------------------------------------------------------------

export const enforceBulkProductEdit = (companyId: string) =>
  enforceFeatureGate(companyId, "bulkProductEdit");

export const enforceCustomDomain = (companyId: string) =>
  enforceFeatureGate(companyId, "customDomain");

export const enforceMultiCounterPos = (companyId: string) =>
  enforceFeatureGate(companyId, "multiCounterPos");

export const enforceWhatsAppAi = (companyId: string) =>
  enforceFeatureGate(companyId, "whatsAppAi");

// ---------------------------------------------------------------------------
// Enforcement: AI Studio Access (requires monthlyAiCredits > 0 on plan)
// ---------------------------------------------------------------------------

/**
 * Blocks credit-consuming AI features on plans with 0 monthly AI credits (Basic).
 * Note: This checks PLAN entitlement, not the live credit balance.
 * The credit ledger's reserveCredits() handles balance insufficiency at consumption time.
 */
export async function enforceAiStudioAccess(
  companyId: string
): Promise<EnforcementResult> {
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

// ---------------------------------------------------------------------------
// Enforcement: Marketplace Product Listings Access
// ---------------------------------------------------------------------------

/**
 * Gates marketplace listing creation/linking to plans that include the feature.
 * Marketplace (my-market-place & marketplace) is available from Ghuba Starter+.
 * Write operations (POST/PATCH/DELETE) should call this guard.
 */
export async function enforceMarketplaceAccess(
  companyId: string
): Promise<EnforcementResult> {
  const sub = await resolveCompanySubscription(companyId);

  // Marketplace listing management is available from Ghuba Starter (tierWeight ≥ 2).
  // Ghuba Basic (tierWeight 1) is storefront-only with no marketplace publish capability.
  const STARTER_WEIGHT = 2;
  if (sub.plan.tierWeight < STARTER_WEIGHT) {
    const upgradeRequired =
      AUTHORITATIVE_PLANS.find((p) => p.tierWeight >= STARTER_WEIGHT)?.name ??
      "Ghuba Starter";
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

// ---------------------------------------------------------------------------
// Enforcement: AI Video Generation Access
// ---------------------------------------------------------------------------

/**
 * Gates AI video generation (promotional product reels, animations).
 * Video generation requires Ghuba Pro+ (tierWeight ≥ 3, 500+ credits/month).
 */
export async function enforceVideoGenerationAccess(
  companyId: string
): Promise<EnforcementResult> {
  const sub = await resolveCompanySubscription(companyId);

  const PRO_WEIGHT = 3;
  if (sub.plan.tierWeight < PRO_WEIGHT) {
    const upgradeRequired =
      AUTHORITATIVE_PLANS.find((p) => p.tierWeight >= PRO_WEIGHT)?.name ??
      "Ghuba Pro";
    return {
      allowed: false,
      message: `AI Video Generation requires ${upgradeRequired}. Your ${sub.planName} plan does not include video generation capabilities. Upgrade to ${upgradeRequired} (includes 500 AI credits/month).`,
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

// ---------------------------------------------------------------------------
// Enforcement: Marketplace Item (Listing) Limit
// ---------------------------------------------------------------------------

/**
 * Numeric cap on marketplace listings per company.
 * 0 = feature not available (Basic), positive number = cap, -1 = unlimited.
 * Pass `batchSize` when creating multiple listings at once (e.g. bulk-create).
 */
export async function enforceMarketplaceItemLimit(
  companyId: string,
  batchSize: number = 1
): Promise<EnforcementResult> {
  const sub = await resolveCompanySubscription(companyId);
  const limit = sub.limits.marketplaceListings;

  // 0 = feature not available on this plan
  if (limit === 0) {
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

  // -1 = unlimited
  if (limit === -1) {
    return { allowed: true, message: "Unlimited marketplace listings permitted.", planName: sub.planName };
  }

  const currentCount = await prisma.marketplaceListings.count({ where: { companyId } });

  if (currentCount + batchSize > limit) {
    const upgradeRequired = findMinimumTierForLimit(
      (l) => l.marketplaceListings === -1 || l.marketplaceListings > limit
    );
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

// ---------------------------------------------------------------------------
// Enforcement: Service Limit
// ---------------------------------------------------------------------------

/**
 * Numeric cap on services per company.
 * Positive number = cap, -1 = unlimited.
 */
export async function enforceServiceLimit(
  companyId: string
): Promise<EnforcementResult> {
  const sub = await resolveCompanySubscription(companyId);
  const limit = sub.limits.services;

  // -1 = unlimited
  if (limit === -1) {
    return { allowed: true, message: "Unlimited services permitted.", planName: sub.planName };
  }

  const currentCount = await prisma.service.count({ where: { companyId } });

  if (currentCount >= limit) {
    const upgradeRequired = findMinimumTierForLimit(
      (l) => l.services === -1 || l.services > limit
    );
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

