import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { z } from 'zod';





const createOrderSchema = z.object({
  companyId: z.string().min(1),
  customerId: z.string().min(1),
  delivery: z.boolean().default(false),
  items: z.array(
    z.object({
      marketplaceListingId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});





export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  const companyId = searchParams.get('companyId');
  const deliveryFilter = searchParams.get('delivery');

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10));
  const skip = (page - 1) * limit;

  const where: any = {
    ...(companyId && { companyId }),
    ...(deliveryFilter === 'true' && { delivery: true }),
    ...(deliveryFilter === 'false' && { delivery: false }),
  };

  
    const cacheKey = `admin:customer-orders:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [totalCount, orders] = await Promise.all([
    prisma.customerOrder.count({ where }),
    prisma.customerOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        companyId: true,
        consumerId: true,
        delivery: true,
        totalPrice: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
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
    }),
  ]);

  try {
    if (totalCount) {
      await cacheSet(cacheKey, totalCount, 60);
    }
  } catch (e) {}

  const formatted = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt?.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      marketplaceListing: {
        ...item.marketplaceListing,
        images: (item.marketplaceListing?.images ?? []) as { url: string }[],
      },
    })),
  }));

  return formatResponse(true, {
    data: formatted,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});





export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const { companyId, customerId, delivery, items } = parsed.data;

  // Fetch authoritative prices from DB
  const listingIds = items.map((i) => i.marketplaceListingId);

  const listings = await prisma.marketplaceListings.findMany({
    where: { id: { in: listingIds }, companyId },
    select: { id: true, finalPrice: true },
  });

  if (listings.length !== listingIds.length) {
    return formatResponse(false, null, "Invalid listing(s) provided", 400);
  }

  const listingMap = new Map(
    listings.map((l) => [l.id, l.finalPrice])
  );

  let totalPrice = 0;

  const orderItemsData = items.map((item) => {
    const price = listingMap.get(item.marketplaceListingId) ?? 0;
    totalPrice += price * item.quantity;

    return {
      marketplaceListingId: item.marketplaceListingId,
      quantity: item.quantity,
      price,
    };
  });

  const newOrder = await prisma.$transaction(async (tx) => {
    return tx.customerOrder.create({
      data: {
        companyId,
        consumerId: customerId,
        delivery,
        totalPrice,
        items: { create: orderItemsData },
      },
      select: {
        id: true,
        companyId: true,
        consumerId: true,
        delivery: true,
        totalPrice: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
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
    });
  });

  return formatResponse(
    true,
    {
      ...newOrder,
      createdAt: newOrder.createdAt?.toISOString(),
    },
    'Customer order created successfully',
    201
  );
});

,
//     ...(delivery !== null && { delivery: delivery === 'true' }),
//   };

//   const [totalCount, orders] = await Promise.all([
//     prisma.customerOrder.count({ where }),
//     prisma.customerOrder.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         totalPrice: true,
//         delivery: true,
//         status: true,
//         createdAt: true,
//         items: { select: ORDER_ITEM_SELECT },
//       },
//     }),
//   ]);

//   return formatResponse(true, {
//     data: orders,
//     meta: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
//   });
// });

// 
// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const parsed = z.object({
//     companyId: z.string(),
//     customerId: z.string(),
//     delivery: z.boolean().default(false),
//     items: z.array(z.object({
//       marketplaceListingId: z.string(),
//       quantity: z.number().positive(),
//     })),
//   }).safeParse(body);

//   if (!parsed.success) return formatResponse(false, null, parsed.error.errors, 400);
//   const { companyId, customerId, delivery, items } = parsed.data;

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       let calculatedTotal = 0;
//       const orderItemsData = [];

//       for (const item of items) {
//         // 1. Fetch listing and lock row for stock update
//         const listing = await tx.marketplaceListing.update({
//           where: { id: item.marketplaceListingId },
//           data: { stock: { decrement: item.quantity } }, // Atomic decrement
//         });

//         // 2. Validate stock (Prisma throws if stock < 0 if you have a DB constraint)
//         if (listing.stock < 0) throw new Error(`Insufficient stock for ${listing.name}`);

//         calculatedTotal += listing.finalPrice * item.quantity;
//         orderItemsData.push({
//           marketplaceListingId: item.marketplaceListingId,
//           quantity: item.quantity,
//           price: listing.finalPrice,
//         });
//       }

//       // 3. Create the order
//       return await tx.customerOrder.create({
//         data: {
//           companyId,
//           consumerId: customerId,
//           delivery,
//           totalPrice: calculatedTotal,
//           items: { create: orderItemsData },
//         },
//         select: { id: true, totalPrice: true, createdAt: true },
//       });
//     });

//     return formatResponse(true, result, 'Order created and stock updated', 201);
//   } catch (error: any) {
//     return formatResponse(false, null, error.message || 'Failed to process order', 400);
//   }
// });

//   ),
// });

// // --- GET /api/customer-orders
// // Fetches paginated customer orders, optionally filtered by companyId and delivery status
// export const GET = withApiHandler(async (request) => {
//   const { searchParams } = new URL(request.url);

//   // --- Filters
//   const companyId = searchParams.get('companyId');
//   const deliveryFilter = searchParams.get('delivery'); // "true" or "false"

//   const whereClause: any = {};
//   if (companyId) {
//     whereClause.companyId = companyId;
//   }
//   if (deliveryFilter === 'true') {
//     whereClause.delivery = true;
//   } else if (deliveryFilter === 'false') {
//     whereClause.delivery = false;
//   }

//   // --- Pagination
//   const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
//   const limit = Math.min(
//     100, // hard cap
//     Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
//   );
//   const skip = (page - 1) * limit;

//   const [totalCount, orders] = await Promise.all([
//     prisma.customerOrder.count({ where: whereClause }),
//     prisma.customerOrder.findMany({
//       where: whereClause,
//       include: {
//         items: {
//           include: {
//             marketplaceListing: {
//               select: {
//                 name: true,
//                 images: true,
//                 finalPrice: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//       skip,
//       take: limit,
//     }),
//   ]);

//   const formattedOrders = orders.map((order) => ({
//     ...order,
//     items: order.items.map((item) => ({
//       ...item,
//       marketplaceListing: {
//         ...item.marketplaceListing,
//         images: (item.marketplaceListing?.images ?? []) as { url: string }[],
//       },
//     })),
//   }));

//   const meta = {
//     page,
//     limit,
//     totalCount,
//     totalPages: Math.ceil(totalCount / limit),
//   };

//   return formatResponse(true, { data: formattedOrders, meta });
// });

// // --- POST /api/customer-orders
// // Creates a new customer order
// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const parsed = createOrderSchema.safeParse(body);
//   if (!parsed.success) {
//     return formatResponse(false, null, parsed.error.errors, 400);
//   }

//   const { companyId, customerId, delivery, items } = parsed.data;

//   const newOrder = await prisma.customerOrder.create({
//     data: {
//       companyId,
//       consumerId: customerId,
//       delivery,
//       items: {
//         create: items.map((item) => ({
//           marketplaceListingId: item.marketplaceListingId,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//       },
//       totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
//     },
//     include: {
//       items: {
//         include: {
//           marketplaceListing: {
//             select: {
//               name: true,
//               images: true,
//               finalPrice: true,
//             },
//           },
//         },
//       },
//       // customer: { select: { id: true, name: true, email: true } },
//     },
//   });

//   return formatResponse(true, newOrder, 'Customer order created successfully', 201);
// });
