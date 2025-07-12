// app/api/customer-orders/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed

// GET /api/customer-orders
// Fetches all customer orders, optionally filtered by companyId and delivery status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const deliveryFilter = searchParams.get('delivery'); // "true" or "false"

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = companyId;
    }
    if (deliveryFilter === 'true') {
      whereClause.delivery = true;
    } else if (deliveryFilter === 'false') {
      whereClause.delivery = false;
    }

    const orders = await prisma.customerOrder.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            marketplaceListing: { // This refers to Product in your context
              select: {
                name: true,
                images: true, // Assuming images is Json[]
                finalPrice: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format order items for client-side consumption
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        marketplaceListing: {
          ...item.marketplaceListing,
          images: item.marketplaceListing.images as unknown as { url: string }[], // Cast Json to expected type
        },
      })),
    }));


    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ message: 'Failed to fetch customer orders', error: (error as Error).message }, { status: 500 });
  }
}
