import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { z } from 'zod';

// --- Validation schema for creating an order
const createOrderSchema = z.object({
  companyId: z.string(),
  customerId: z.string(),
  delivery: z.boolean().default(false),
  items: z.array(
    z.object({
      marketplaceListingId: z.string(),
      quantity: z.number().positive(),
      price: z.number().nonnegative(),
    })
  ),
});

// --- GET /api/customer-orders
// Fetches paginated customer orders, optionally filtered by companyId and delivery status
export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  // --- Filters
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

  // --- Pagination
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(
    100, // hard cap
    Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
  );
  const skip = (page - 1) * limit;

  const [totalCount, orders] = await Promise.all([
    prisma.customerOrder.count({ where: whereClause }),
    prisma.customerOrder.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            marketplaceListing: {
              select: {
                name: true,
                images: true,
                finalPrice: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const formattedOrders = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      marketplaceListing: {
        ...item.marketplaceListing,
        images: (item.marketplaceListing?.images ?? []) as { url: string }[],
      },
    })),
  }));

  const meta = {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };

  return formatResponse(true, { data: formattedOrders, meta });
});

// --- POST /api/customer-orders
// Creates a new customer order
export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const { companyId, customerId, delivery, items } = parsed.data;

  const newOrder = await prisma.customerOrder.create({
    data: {
      companyId,
      consumerId: customerId,
      delivery,
      items: {
        create: items.map((item) => ({
          marketplaceListingId: item.marketplaceListingId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    },
    include: {
      items: {
        include: {
          marketplaceListing: {
            select: {
              name: true,
              images: true,
              finalPrice: true,
            },
          },
        },
      },
      // customer: { select: { id: true, name: true, email: true } },
    },
  });

  return formatResponse(true, newOrder, 'Customer order created successfully', 201);
});
