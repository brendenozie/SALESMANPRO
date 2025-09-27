import prisma from '@/server/db/prismadb';
import { PlanStatus, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// PUT /api/subscriptions/[id] - Update subscription
async function handlePUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    const { planId, status, billingCycle, amount, endDate } = await request.json();

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        planId,
        status,
        billingCycle,
        amount,
        endDate: endDate ? new Date(endDate) : null,
        updatedAt: new Date(),
      },
    });

    return formatResponse(true, updatedSubscription, 'Subscription updated successfully.');
  } catch (error: any) {
    console.error('Error updating subscription:', error);

    if (error.code === 'P2025') {
      return formatResponse(false, null, 'Subscription not found', 404);
    }

    return formatResponse(false, null, error.message, 500);
  }
}

// DELETE /api/subscriptions/[id] - Delete subscription
async function handleDELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    await prisma.subscription.delete({ where: { id } });

    return formatResponse(true, null, `Subscription with id ${id} deleted successfully.`);
  } catch (error: any) {
    console.error('Error deleting subscription:', error);

    if (error.code === 'P2025') {
      return formatResponse(false, null, 'Subscription not found', 404);
    }

    return formatResponse(false, null, error.message, 500);
  }
}

// Export wrapped handlers
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
