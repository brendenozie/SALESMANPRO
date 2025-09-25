import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { PlanStatus, SubscriptionStatus, BillingCycle } from '@prisma/client'; // Import the new enums
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// =================================================================================================
// PLAN-SPECIFIC API ROUTES
// These routes use dynamic paths for specific plan management.
// =================================================================================================

// PUT /api/plans/[id]
// Handles updating a specific plan.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = params;
    const {
      name,
      description,
      priceMonthly,
      priceAnnually,
      features,
      isPopular,
      status
    } = await request.json();

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        name,
        description,
        priceMonthly,
        priceAnnually,
        features,
        isPopular,
        status,
      },
    });

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error('Error updating plan:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update plan', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/plans/[id]
// Handles deleting a specific plan.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = params;

    // Check if there are any active subscriptions for this plan
    const subscriptions = await prisma.subscription.findMany({
      where: {
        planId: id,
        status: "ACTIVE",
      },
    });

    if (subscriptions.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete plan with active subscriptions.' },
        { status: 409 } // Conflict
      );
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ message: `Plan with id ${id} deleted successfully.` }, { status: 200 });
  } catch (error) {
    console.error('Error deleting plan:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete plan', error: (error as Error).message }, { status: 500 });
  }
}
