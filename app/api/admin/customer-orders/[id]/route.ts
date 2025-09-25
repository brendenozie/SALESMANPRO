// app/api/customer-orders/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// PUT /api/customer-orders/:id
// Updates a specific customer order (e.g., status, delivery details)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;
    const body = await request.json();
    const { status, deliveryStatus, deliveryPersonName, deliveryPersonContact } = body;

    const updatedOrder = await prisma.customerOrder.update({
      where: { id },
      data: {
        status: status || undefined,
        deliveryStatus: deliveryStatus || undefined,
        deliveryPersonName: deliveryPersonName || undefined,
        deliveryPersonContact: deliveryPersonContact || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error(`Error updating customer order with ID ${params.id}:`, error);
    if ((error as any).code === 'P2025') { // Not Found
      return NextResponse.json({ message: 'Customer order not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update customer order', error: (error as Error).message }, { status: 500 });
  }
}
