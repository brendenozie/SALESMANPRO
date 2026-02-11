import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { ROLES } from "@prisma/client";

/* ----------------------------------
   Types
----------------------------------- */
type HandlerContext = {
  params: { adminSlug: string };
  user?: any;
};

type SaleItem = {
  ticketProductId: string;
  quantity: number;
};

/* ----------------------------------
   POST — POS Sale
----------------------------------- */
async function handlePost(req: Request, context: HandlerContext) {
  const { adminSlug } = context.params;
  const body = await req.json();

  const {
    eventId,
    customerName,
    customerEmail,
    paymentMethod,
    items,
    notes,
  } = body as {
    eventId: string;
    customerName: string;
    customerEmail: string;
    paymentMethod: string;
    items: SaleItem[];
    notes?: string;
  };

  if (!eventId || !customerName || !customerEmail || !paymentMethod || !items?.length) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  /* ----------------------------------
     Fetch company + event in parallel
  ----------------------------------- */
  const [company, event] = await Promise.all([
    prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    }),
    prisma.event.findFirst({
      where: {
        id: eventId,
        company: { slug: adminSlug },
      },
      select: { id: true },
    }),
  ]);

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  if (!event) {
    return NextResponse.json(
      { message: "Event not found or unauthorized" },
      { status: 404 }
    );
  }

  /* ----------------------------------
     Load all ticket products at once
  ----------------------------------- */
  const productIds = items.map(i => i.ticketProductId);

  const products = await prisma.marketplaceListings.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      sellingPrice: true,
      quantity: true,
    },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  let totalPrice = 0;
  const orderItems: {
    marketplaceListingId: string;
    quantity: number;
    price: number;
  }[] = [];

  for (const item of items) {
    const product = productMap.get(item.ticketProductId);

    if (!product) {
      return NextResponse.json(
        { message: `Ticket product not found: ${item.ticketProductId}` },
        { status: 404 }
      );
    }

    if (product.quantity < item.quantity) {
      return NextResponse.json(
        { message: `Insufficient stock for ${product.name}` },
        { status: 400 }
      );
    }

    totalPrice += product.sellingPrice * item.quantity;

    orderItems.push({
      marketplaceListingId: product.id,
      quantity: item.quantity,
      price: product.sellingPrice,
    });
  }

  /* ----------------------------------
     Atomic transaction
  ----------------------------------- */
  const order = await prisma.$transaction(async tx => {
    /* --- User / Consumer upsert --- */
    const user = await tx.user.upsert({
      where: { email: customerEmail },
      update: { name: customerName },
      create: {
        email: customerEmail,
        name: customerName,
        role: ROLES.CONSUMER,
      },
      select: { id: true },
    });

    const consumer = await tx.consumer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        companyId: company.id,
      },
      select: { id: true },
    });

    /* --- Order creation --- */
    const order = await tx.customerOrder.create({
      data: {
        consumerId: consumer.id,
        companyId: company.id,
        name: customerName,
        email: customerEmail,
        totalPrice,
        status: "COMPLETED",
        paymentOption: paymentMethod,
        orderSource: "IN_PERSON",
        notes,
        items: { create: orderItems },
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
      },
    });

    /* --- Payment record --- */
    await tx.payment.create({
      data: {
        userId: consumer.id,
        orderId: order.id,
        amount: totalPrice,
        status: "COMPLETED",
        transactionId: `POS-${crypto.randomUUID()}`,
      },
    });

    /* --- Inventory decrement (batched) --- */
    await Promise.all(
      orderItems.map(item =>
        tx.marketplaceListings.update({
          where: { id: item.marketplaceListingId },
          data: { quantity: { decrement: item.quantity } },
        })
      )
    );

    /* --- Bulk event registrations --- */
    const registrations = orderItems.flatMap(item =>
      Array.from({ length: item.quantity }).map(() => ({
        eventId: event.id,
        userId: consumer.id,
        status: "REGISTERED" as const,
        companyId: company.id,
      }))
    );

    await tx.eventRegistration.createMany({
      data: registrations,
    });

    return order;
  });

  return NextResponse.json(
    {
      message: "Sale processed successfully",
      orderId: order.id,
      totalAmount: order.totalPrice,
      status: order.status,
    },
    { status: 201 }
  );
}

/**
 * POST /api/admin/[adminSlug]/pos/sale
 */
export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { ROLES } from "@prisma/client";

// async function handlePost(request: Request, context: { params: { adminSlug: string } }) {
//   const { adminSlug } = context.params;
//   const body = await request.json();
//   const { eventId, customerName, customerEmail, paymentMethod, items, notes } = body;

//   // 1. Structural Validation
//   if (!eventId || !items?.length || !customerEmail) {
//     return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
//   }

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       // 2. Verified Context (Single trip for Company + Event)
//       const event = await tx.event.findFirst({
//         where: { id: eventId, company: { slug: adminSlug } },
//         select: { id: true, companyId: true }
//       });

//       if (!event) throw new Error("Event or Company not found");

//       // 3. Inventory & Pricing Check (Batching lookups)
//       const ticketProductIds = items.map((i: any) => i.ticketProductId);
//       const products = await tx.marketplaceListings.findMany({
//         where: { id: { in: ticketProductIds } },
//         select: { id: true, name: true, sellingPrice: true, quantity: true }
//       });

//       let totalOrderPrice = 0;
//       const orderItemsData = [];
//       const registrationData = [];

//       for (const item of items) {
//         const product = products.find(p => p.id === item.ticketProductId);
//         if (!product) throw new Error(`Product ${item.ticketProductId} not found`);
//         if (product.quantity < item.quantity) throw new Error(`Stock out: ${product.name}`);

//         const itemTotal = Number(product.sellingPrice) * item.quantity;
//         totalOrderPrice += itemTotal;

//         orderItemsData.push({
//           marketplaceListingId: product.id,
//           quantity: item.quantity,
//           price: product.sellingPrice,
//         });

//         // 4. Inventory Protection (Decrement with guard)
//         await tx.marketplaceListings.update({
//           where: { id: product.id },
//           data: { quantity: { decrement: item.quantity } }
//         });

//         // Prepare batch registrations
//         for (let i = 0; i < item.quantity; i++) {
//           registrationData.push({
//             eventId: event.id,
//             companyId: event.companyId,
//             status: "REGISTERED" as const,
//           });
//         }
//       }

//       // 5. User/Consumer Upsert
//       const user = await tx.user.upsert({
//         where: { email: customerEmail },
//         update: { name: customerName },
//         create: { email: customerEmail, name: customerName, role: ROLES.CONSUMER }
//       });

//       const consumer = await tx.consumer.upsert({
//         where: { userId: user.id },
//         update: {},
//         create: { userId: user.id, companyId: event.companyId }
//       });

//       // 6. Finalize Order, Payment, and Registrations in Batch
//       const newOrder = await tx.customerOrder.create({
//         data: {
//           consumerId: consumer.id,
//           companyId: event.companyId,
//           name: customerName,
//           email: customerEmail,
//           totalPrice: totalOrderPrice,
//           status: "COMPLETED",
//           paymentOption: paymentMethod,
//           orderSource: "IN_PERSON",
//           notes,
//           items: { create: orderItemsData },
//           payments: {
//             create: {
//               userId: user.id,
//               amount: totalOrderPrice,
//               status: "COMPLETED",
//               transactionId: `POS-${Date.now()}`
//             }
//           }
//         }
//       });

//       // Batch insert registrations (much faster than a loop)
//       await tx.eventRegistration.createMany({
//         data: registrationData.map(reg => ({ ...reg, userId: user.id }))
//       });

//       return newOrder;
//     });

//     return NextResponse.json({
//       message: "Sale processed successfully",
//       orderId: result.id,
//       totalAmount: result.totalPrice
//     }, { status: 201 });

//   } catch (error: any) {
//     return NextResponse.json({ message: error.message || "Transaction failed" }, { status: 400 });
//   }
// }

// export const POST = withApiHandler(handlePost);
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { ROLES } from "@prisma/client";

// // --- Type Definitions for the Handler ---

// type RouteParams = {
//   adminSlug: string;
// };

// type HandlerContext = {
//   params: RouteParams;
//   user?: any; // Replace with your actual User type if defined
// };

// // --- Core Logic for POST request ---
// // This function contains only the business logic, with the wrapper handling
// // authentication and the top-level try/catch.
// async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { adminSlug } = context.params;
//   const body = await request.json();

//   const { eventId, customerName, customerEmail, paymentMethod, items, notes } = body;

//   if (!eventId || !customerName || !customerEmail || !paymentMethod || !items || items.length === 0) {
//     return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const event = await prisma.event.findUnique({
//     where: { id: eventId, companyId: company.id },
//   });

//   if (!event) {
//     return NextResponse.json({ message: "Event not found or does not belong to this company" }, { status: 404 });
//   }

//   let totalOrderPrice = 0;
//   interface OrderItemData {
//     marketplaceListingId: string;
//     quantity: number;
//     price: number;
//   }
//   const orderItemsData: OrderItemData[] = [];
//   const inventoryUpdates: Promise<any>[] = [];

//   for (const item of items) {
//     const ticketProduct = await prisma.marketplaceListings.findUnique({
//       where: { id: item.ticketProductId },
//       select: { id: true, name: true, sellingPrice: true, quantity: true },
//     });

//     if (!ticketProduct) {
//       return NextResponse.json({ message: `Ticket product ${item.ticketProductId} not found` }, { status: 404 });
//     }
//     if (ticketProduct.quantity < item.quantity) {
//       return NextResponse.json({ message: `Insufficient stock for ${ticketProduct.name}` }, { status: 400 });
//     }

//     totalOrderPrice += ticketProduct.sellingPrice * item.quantity;
//     orderItemsData.push({
//       marketplaceListingId: ticketProduct.id,
//       quantity: item.quantity,
//       price: ticketProduct.sellingPrice,
//     });

//     inventoryUpdates.push(prisma.marketplaceListings.update({
//       where: { id: ticketProduct.id },
//       data: { quantity: { decrement: item.quantity } },
//     }));
//   }

//   // Use a transaction to ensure atomicity
//   const result = await prisma.$transaction(async (tx) => {
//     // Find or create the consumer first
//     // Find the user by email first to get the userId
//     const existingUser = await tx.user.findUnique({
//       where: { email: customerEmail },
//       select: { id: true }
//     });

//     // Find or create the user first
//     let userId: string;
//     if (existingUser) {
//       userId = existingUser.id;
//     } else {
//       const newUser = await tx.user.create({
//         data: {
//           email: customerEmail,
//           name: customerName,
//           role: "CONSUMER" as ROLES,
//         },
//       });
//       userId = newUser.id;
//     }

//     const consumer = await tx.consumer.upsert({
//       where: { userId },
//       update: {},
//       create: {
//         companyId: company.id,
//         userId: userId,
//       },
//       include: { user: true }
//     });

//     const newOrder = await tx.customerOrder.create({
//       data: {
//         consumerId: consumer.id,
//         companyId: company.id,
//         name: customerName,
//         email: customerEmail,
//         totalPrice: totalOrderPrice,
//         status: "COMPLETED",
//         paymentOption: paymentMethod,
//         orderSource: "IN_PERSON",
//         notes: notes,
//         items: {
//           create: orderItemsData,
//         },
//       },
//     });

//     await tx.payment.create({
//       data: {
//         userId: consumer.id,
//         orderId: newOrder.id,
//         amount: totalOrderPrice,
//         status: "COMPLETED",
//         transactionId: `POS-${Date.now()}-${Math.random().toString(36).substring(7)}`,
//       },
//     });

//     await Promise.all(inventoryUpdates);

//     for (const item of items) {
//       for (let i = 0; i < item.quantity; i++) {
//         await tx.eventRegistration.create({
//           data: {
//             eventId: event.id,
//             userId: consumer.id,
//             status: "REGISTERED",
//             companyId: company.id,
//           },
//         });
//       }
//     }

//     return newOrder;
//   });

//   return NextResponse.json(
//     {
//       message: "Sale processed successfully",
//       orderId: result.id,
//       totalAmount: result.totalPrice,
//       status: result.status,
//     },
//     { status: 201 }
//   );
// }

// // --- Exported Route Handler (Wrapped) ---

// /**
//  * POST /api/admin/[adminSlug]/pos/sale
//  * Processes a point-of-sale transaction for an event.
//  */
// export const POST = withApiHandler(handlePost);
