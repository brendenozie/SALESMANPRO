import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from '@/server/db/prismadb';
import { SubscriptionStatus, BillingCycle } from '@prisma/client';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// ============================================================================
// GET /api/subscriptions/[id]
// ============================================================================
async function handleGET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    
    const cacheKey = buildTenantCacheKey('global', "payments-companies", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const subscription = await prisma.subscriptionCompany.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: true,
        payments: {
          orderBy: { paidAt: "desc" }
        }
      }
    });

  try {
    if (subscription) {
      await cacheSet(cacheKey, subscription, 60);
    }
  } catch (e) {}

    if (!subscription) {
      return formatResponse(false, null, "Subscription not found.", 404);
    }

    return formatResponse(true, subscription);
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// ============================================================================
// PUT /api/subscriptions/[id]
// ============================================================================
async function handlePUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      status,
      planId,
      billingCycle,
      renewalDate,
      cancelAtPeriodEnd,
      gateway,
      gatewaySubscriptionId,
      amountPaid
    } = body;

    const subscription = await prisma.subscriptionCompany.findUnique({
      where: { id }
    });

    if (!subscription) {
      return formatResponse(false, null, "Subscription not found.", 404);
    }

    const updated = await prisma.subscriptionCompany.update({
      where: { id },
      data: {
        status: status || subscription.status,
        planId: planId || subscription.planId,
        billingCycle: billingCycle || subscription.billingCycle,
        renewalDate: renewalDate ? new Date(renewalDate) : subscription.renewalDate,
        cancelAtPeriodEnd: cancelAtPeriodEnd ?? subscription.cancelAtPeriodEnd,
        gateway: gateway || subscription.gateway,
        gatewaySubscriptionId: gatewaySubscriptionId || subscription.gatewaySubscriptionId,
        amountPaid: amountPaid || subscription.amountPaid
      }
    });

    
    try {
      await cacheDel(`tenant:${'global'}:payments-companies:*`);
      await cacheDel(`admin:payments-companies:*`);
    } catch (e) {}
    return formatResponse(true, updated, "Subscription updated.");
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// ============================================================================
// DELETE /api/subscriptions/[id]
// Option A: Hard delete
// Option B: Soft cancel (recommended for SaaS)
// ============================================================================
async function handleDELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const exists = await prisma.subscriptionCompany.findUnique({ where: { id } });

    if (!exists) {
      return formatResponse(false, null, "Subscription not found.", 404);
    }

    // Recommended: Soft delete (cancel subscription)
    const cancelled = await prisma.subscriptionCompany.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        endedAt: new Date()
      }
    });

    
    try {
      await cacheDel(`tenant:${'global'}:payments-companies:*`);
      await cacheDel(`admin:payments-companies:*`);
    } catch (e) {}
    return formatResponse(true, cancelled, "Subscription cancelled.");
  } catch (error: any) {
    console.error("Error deleting subscription:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

export const GET = withApiHandler(handleGET);
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
