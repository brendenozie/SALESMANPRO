import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { PlanStatus, SubscriptionStatus, BillingCycle } from '@prisma/client'; // Import the new enums
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';


// =================================================================================================
// SUBSCRIPTION-SPECIFIC API ROUTES
// These routes use dynamic paths for specific subscription management.
// =================================================================================================

// PUT /api/subscriptions/[id]
// Handles updating a specific subscription.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = params;
    const {
      planId,
      status,
      billingCycle,
      amount,
      endDate
    } = await request.json();

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

    return NextResponse.json(updatedSubscription, { status: 200 });
  } catch (error) {
    console.error('Error updating subscription:', error);
    // Handle the case where the subscription is not found
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update subscription', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/subscriptions/[id]
// Handles deleting a specific subscription.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = params;

    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({ message: `Subscription with id ${id} deleted successfully.` }, { status: 200 });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete subscription', error: (error as Error).message }, { status: 500 });
  }
}
