import { cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  status: z.string().optional(),
  planId: z.string().optional().nullable(),
  billingCycle: z.string().optional(),
  renewalDate: z.string().optional().nullable(),
  cancelAtPeriodEnd: z.boolean().optional(),
  gateway: z.string().optional().nullable(),
  gatewaySubscriptionId: z.string().optional().nullable(),
  amountPaid: z.number().optional().nullable(),
});

// Helper to verify subscription access: SUPER_ADMIN or user owning the subscription or matching companyId
async function checkSubscriptionAccess(subscriptionId: string, context: any) {
  const authUser = context?.user;
  const subscription = await prisma.subscriptionCompany.findUnique({
    where: { id: subscriptionId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: true,
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!subscription) {
    return { subscription: null, authorized: false, notFound: true };
  }

  if (authUser?.role === "SUPER_ADMIN") {
    return { subscription, authorized: true, notFound: false };
  }

  // Tenant or user matching
  const hasCompanyMatch = authUser?.companyId && subscription.companyId === authUser.companyId;
  const hasUserMatch = authUser?.id && subscription.userId === authUser.id;

  if (hasCompanyMatch || hasUserMatch) {
    return { subscription, authorized: true, notFound: false };
  }

  return { subscription, authorized: false, notFound: false };
}

// ============================================================================
// GET /api/admin/checkout-store-payments/[id]
// ============================================================================
async function handleGET(_: Request, context: any) {
  try {
    const id = context?.params?.id;
    if (!id) {
      return formatResponse(false, null, "Missing subscription ID", 400);
    }

    const { subscription, authorized, notFound } = await checkSubscriptionAccess(id, context);
    if (notFound) {
      return formatResponse(false, null, "Subscription not found.", 404);
    }
    if (!authorized) {
      return formatResponse(false, null, "Forbidden: you do not have access to this subscription.", 403);
    }

    return formatResponse(true, subscription);
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// ============================================================================
// PUT /api/admin/checkout-store-payments/[id]
// ============================================================================
async function handlePUT(request: Request, context: any) {
  try {
    const id = context?.params?.id;
    if (!id) {
      return formatResponse(false, null, "Missing subscription ID", 400);
    }

    const { subscription, authorized, notFound } = await checkSubscriptionAccess(id, context);
    if (notFound) {
      return formatResponse(false, null, "Subscription not found.", 404);
    }
    if (!authorized) {
      return formatResponse(false, null, "Forbidden: you do not have access to this subscription.", 403);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parseResult = updateSubscriptionSchema.safeParse(body);
    if (!parseResult.success) {
      return formatResponse(
        false,
        null,
        parseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }

    const {
      status,
      planId,
      billingCycle,
      renewalDate,
      cancelAtPeriodEnd,
      gateway,
      gatewaySubscriptionId,
      amountPaid,
    } = parseResult.data;

    const updated = await prisma.subscriptionCompany.update({
      where: { id },
      data: {
        status: status || subscription.status,
        planId: planId !== undefined ? planId : subscription.planId,
        billingCycle: billingCycle || subscription.billingCycle,
        renewalDate: renewalDate ? new Date(renewalDate) : subscription.renewalDate,
        cancelAtPeriodEnd: cancelAtPeriodEnd ?? subscription.cancelAtPeriodEnd,
        gateway: gateway !== undefined ? gateway : subscription.gateway,
        gatewaySubscriptionId:
          gatewaySubscriptionId !== undefined
            ? gatewaySubscriptionId
            : subscription.gatewaySubscriptionId,
        amountPaid: amountPaid !== undefined ? amountPaid : subscription.amountPaid,
      },
    });

    try {
      await cacheDel(`tenant:${subscription.companyId}:payments-companies:*`);
      await cacheDel(`admin:payments-companies:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Subscription updated.");
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// ============================================================================
// DELETE /api/admin/checkout-store-payments/[id]
// Soft cancel subscription
// ============================================================================
async function handleDELETE(_: Request, context: any) {
  try {
    const id = context?.params?.id;
    if (!id) {
      return formatResponse(false, null, "Missing subscription ID", 400);
    }

    const { subscription, authorized, notFound } = await checkSubscriptionAccess(id, context);
    if (notFound) {
      return formatResponse(false, null, "Subscription not found.", 404);
    }
    if (!authorized) {
      return formatResponse(false, null, "Forbidden: you do not have access to this subscription.", 403);
    }

    const cancelled = await prisma.subscriptionCompany.update({
      where: { id },
      data: {
        status: "CANCELLED",
        endedAt: new Date(),
      },
    });

    try {
      await cacheDel(`tenant:${subscription.companyId}:payments-companies:*`);
      await cacheDel(`admin:payments-companies:*`);
    } catch (e) {}

    return formatResponse(true, cancelled, "Subscription cancelled.");
  } catch (error: any) {
    console.error("Error deleting subscription:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

export const GET = withApiHandler(handleGET, { requireAuth: true });
export const PUT = withApiHandler(handlePUT, { requireAuth: true });
export const DELETE = withApiHandler(handleDELETE, { requireAuth: true });
