// ==========================================================
// FILE: /app/api/admin/deliveries/route.ts
// NEXT.JS APP ROUTER API
// FULLY FUNCTIONAL ENTERPRISE DELIVERY API
// Prisma + MongoDB
// ==========================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

// ==========================================================
// HELPERS
// ==========================================================

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function createTrackingNumber() {
  return `VH-${Date.now().toString().slice(-8)}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}

function parseNumber(v: any, fallback = 0) {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

// ==========================================================
// GET /api/admin/deliveries
// Query:
// ?companyId=xxx
// ?status=PENDING
// ?search=VH-
// ==========================================================

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);

    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (!companyId) {
      return json(
        { success: false, message: "companyId required" },
        400
      );
    }

    const where: any = {
      companyId,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          trackingNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          riderName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          deliveryAddress: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
          },
        },
        CustomerOrders: {
          select: {
            id: true,
            name: true,
            totalFinalPrice: true,
          },
        },
        stops: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    const mapped = deliveries.map((item) => ({
      ...item,
      orderIds: item.CustomerOrders.map((x) => x.id),
      orderCount: item.CustomerOrders.length,
    }));

    return json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    console.error("GET DELIVERIES ERROR:", error);
    return json(
      { success: false, message: "Failed to fetch deliveries" },
      500
    );
  }
}

// ==========================================================
// POST /api/admin/deliveries
// CREATE DELIVERY
// ==========================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();

    const {
      companyId,
      orderIds = [],
      riderId,
      pickupAddress,
      deliveryAddress,
      packageDescription,
      packageValue,
      deliveryFee,
      weightKg,
      scheduledFor,
      trackingNumber,
    } = body;

    if (!companyId) {
      return json(
        { success: false, message: "companyId required" },
        400
      );
    }

    if (!orderIds.length) {
      return json(
        { success: false, message: "Select at least one order" },
        400
      );
    }

    // fetch rider
    let riderName: string | null = null;

    if (riderId) {
      const rider = await prisma.user.findUnique({
        where: { id: riderId },
        select: { name: true },
      });

      riderName = rider?.name || null;
    }

    // create delivery
    const delivery = await prisma.delivery.create({
      data: {
        companyId,
        trackingNumber:
          trackingNumber || createTrackingNumber(),

        status: riderId ? "INPROGRESS" : "PENDING",

        riderId: riderId || null,
        riderName,

        pickupAddress,
        deliveryAddress,

        packageDescription,
        packageValue: parseNumber(packageValue),
        deliveryFee: parseNumber(deliveryFee),
        weightKg: parseNumber(weightKg),

        scheduledFor: scheduledFor
          ? new Date(scheduledFor)
          : null,

        totalAmount: parseNumber(deliveryFee),

        CustomerOrders: {
          connect: orderIds.map((id: string) => ({
            id,
          })),
        },
      },
      include: {
        CustomerOrders: true,
      },
    });

    // update orders
    await prisma.customerOrder.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        deliveryId: delivery.id,
        trackingNumber: delivery.trackingNumber,
        deliveryStatus: "Assigned",
        delivery: true,
      },
    });

    // create stops
    let seq = 1;

    for (const orderId of orderIds) {
      const order = await prisma.customerOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) continue;

      const shipping: any = order.shippingAddress || {};

      await prisma.deliveryStop.create({
        data: {
          deliveryId: delivery.id,
          orderId,
          sequence: seq++,

          customerName: order.name,
          phone: order.phone,

          address:
            shipping.display_name ||
            order.name ||
            "Destination",

          lat: shipping.lat
            ? Number(shipping.lat)
            : null,

          lng: shipping.lng
            ? Number(shipping.lng)
            : null,
        },
      });
    }

    return json({
      success: true,
      message: "Delivery created successfully",
      data: delivery,
    });
  } catch (error) {
    console.error("POST DELIVERY ERROR:", error);

    return json(
      { success: false, message: "Failed to create delivery" },
      500
    );
  }
}
// import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/deliveries/route.ts

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { DeliveryStatus, Prisma } from "@prisma/client";

// export const GET = withApiHandler(async (request, context) => {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId") || context.user?.companyId;

//   if (!companyId)
//     return formatResponse(false, null, "Company ID is required.", 400);

//   const searchTerm = searchParams.get("searchTerm") || "";
//   const status = searchParams.get("status") || "All";

//   // 1. UNIQUE CACHE KEY (Includes filters)
//   const cacheKey = `admin:deliveries:${companyId}:st_${status}:q_${searchTerm}`;

//   try {
//     const cached = await cacheGet(cacheKey);
//     if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
//   } catch (e) {}

//   const where: Prisma.DeliveryWhereInput = { companyId };
//   if (status !== "All") where.status = status as DeliveryStatus;

//   if (searchTerm) {
//     where.OR = [
//       { trackingNumber: { contains: searchTerm, mode: "insensitive" } },
//       { customerName: { contains: searchTerm, mode: "insensitive" } },
//       { riderName: { contains: searchTerm, mode: "insensitive" } },
//     ];
//   }

//   const deliveries = await prisma.delivery.findMany({
//     where,
//     include: {
//       rider: { select: { id: true, name: true } },
//       CustomerOrders: {
//         include: { items: { include: { marketplaceListing: true } } },
//       },
//     },
//     orderBy: { createdAt: "desc" }, // Usually better for "Recent" view
//   });

//   const formatted = deliveries.map((d) => ({
//     ...d,
//     riderName: d.rider?.name || d.riderName || "Unassigned",
//   }));

//   await cacheSet(cacheKey, formatted, 60);
//   return formatResponse(true, formatted, "Deliveries fetched", 200);
// });

// export const POST = withApiHandler(async (request, context) => {
//   const body = await request.json();
//   const {
//     companyId,
//     trackingNumber,
//     riderId,
//     status,
//     pickupAddress,
//     deliveryAddress,
//     packageDescription,
//     weightKg,
//     deliveryFee,
//     scheduledFor,
//     // orderIds is assumed to be an array of OrderItem IDs from the frontend modal
//     orderIds = [],
//     riderName,
//     ...rest
//   } = body;

//   if (!companyId || !trackingNumber) {
//     return formatResponse(false, null, "Missing required fields.", 400);
//   }

//   let finalPickup = pickupAddress;
//   let finalDrop = deliveryAddress;
//   let finalDesc = packageDescription;
//   let finalFee = deliveryFee;
//   let finalWeight = Number(weightKg) || 0;
//   let customerOrderIds: string[] = [];
//   let packageValue = rest.packageValue;
//   let customerName = rest.customerName;

//   // --- 1. Process linked OrderItem IDs to derive CustomerOrders IDs and auto-populate data ---
//   if (orderIds.length > 0) {
//     // 1a. Find the parent CustomerOrders ID for each OrderItem ID
//     const orderItems = await prisma.orderItem.findMany({
//       where: { id: { in: orderIds } },
//       select: {
//         orderId: true,
//         quantity: true,
//         price: true,
//         marketplaceListingId: true,
//       },
//     });

//     // Get unique CustomerOrders IDs to link to the Delivery record
//     customerOrderIds = Array.from(
//       new Set(orderItems.map((item) => item.orderId)),
//     );

//     // 1b. Auto-populate fields from the first linked OrderItem (for pickup details)
//     const primaryOrderItem = await prisma.orderItem.findUnique({
//       where: { id: orderIds[0] },
//       include: {
//         marketplaceListing: {
//           select: { name: true, locationName: true, contactName: true },
//         },
//       },
//     });

//     if (primaryOrderItem && primaryOrderItem.marketplaceListing) {
//       // *** Pickup Address: Use marketplace listing location (seller) ***
//       finalPickup =
//         pickupAddress || primaryOrderItem.marketplaceListing.locationName || "";
//       // If customerName is not set, use the pickup contact name (seller name) as a fallback hint
//       customerName =
//         customerName || primaryOrderItem.marketplaceListing.contactName;
//     }

//     // 1c. Aggregate item data
//     // const totalItemValue = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     // const totalItemWeight = orderItems.length > 0 ? orderItems.reduce((acc, item) => acc + (item.quantity * 1.5), 0) : 0; // Heuristic: 1.5kg per item quantity

//     // packageValue = packageValue || totalItemValue;
//     // finalWeight = finalWeight > 0 ? finalWeight : totalItemWeight;

//     const totalItemValue = orderItems.reduce(
//       (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 0),
//       0,
//     );
//     const totalItemWeight =
//       orderItems.length > 0
//         ? orderItems.reduce((acc, item) => acc + (item.quantity ?? 1) * 1.5, 0)
//         : 0;

//     packageValue = packageValue ?? totalItemValue;
//     finalWeight = finalWeight > 0 ? finalWeight : totalItemWeight;
//   }

//   // --- 2. Auto-populate from the primary CustomerOrders (for delivery details) ---
//   if (customerOrderIds.length > 0) {
//     const primaryCustomerOrder = await prisma.customerOrder.findUnique({
//       where: { id: customerOrderIds[0] },
//       include: {
//         items: { include: { marketplaceListing: { select: { name: true } } } },
//       },
//     });

//     if (primaryCustomerOrder) {
//       // *** Delivery Address: Use CustomerOrders shippingAddress ***
//       const shippingAddressObject = primaryCustomerOrder.shippingAddress as any;
//       const deliveryAddressFromOrder =
//         shippingAddressObject?.display_name ||
//         shippingAddressObject?.address_line_1 ||
//         null;
//       finalDrop = deliveryAddress || deliveryAddressFromOrder || "";

//       // Auto-populate package description
//       const titles = primaryCustomerOrder.items
//         ?.map((i) => (i.marketplaceListing as any)?.name)
//         .filter(Boolean)
//         .join(", ");
//       finalDesc = packageDescription || titles || "Multiple items";

//       // Auto-populate fee and name if not manually set
//       // finalFee = deliveryFee || primaryCustomerOrder.totalShipping || Math.round((primaryCustomerOrder.totalFinalPrice || 0) * 0.05);

//       finalFee =
//         deliveryFee ||
//         primaryCustomerOrder.totalShipping ||
//         Math.round((primaryCustomerOrder.totalFinalPrice ?? 0) * 0.05); // Use 0 if totalFinalPrice is null
//       customerName = customerName || primaryCustomerOrder.name;
//     }
//   }

//   // Final check for required addresses if not linked
//   if (!finalPickup || !finalDrop) {
//     return formatResponse(
//       false,
//       null,
//       "Pickup Address and Delivery Address are required.",
//       400,
//     );
//   }

//   // --- 3. Create the Delivery record ---
//    try {
//      // 2. USE TRANSACTION FOR DATA INTEGRITY
//      const result = await prisma.$transaction(async (tx) => {
//        // Create Delivery
//        const delivery = await tx.delivery.create({
//          data: {
//            companyId,
//            trackingNumber:
//              rest.trackingNumber ||
//              `VH-${Math.random().toString(36).toUpperCase().substring(2, 8)}`,
//            status: "PENDING",
//            pickupAddress: finalPickup,
//            deliveryAddress: finalDrop,
//            packageDescription: finalDesc,
//            weightKg: finalWeight,
//            deliveryFee: Number(finalFee) || 0,
//            customerName: customerName,
//            // Link Orders
//            CustomerOrders: {
//              connect: customerOrderIds.map((id) => ({ id })),
//            },
//            ...rest, // Capture latlngPickup, etc from schema
//          },
//        });

//        // Update Order Statuses so they disappear from the "Pending Orders" list
//        await tx.customerOrder.updateMany({
//          where: { id: { in: customerOrderIds } },
//          data: {
//            status: "READY_FOR_PICKUP", // or your specific Enum
//            deliveryStatus: "Manifested",
//          },
//        });

//        return delivery;
//      });

//      // 3. CACHE PURGE
//      await cacheDel(`admin:deliveries:${companyId}:*`);

//      return formatResponse(
//        true,
//        result,
//        "Manifest created and orders updated",
//        201,
//      );
//    } catch (error: any) {
//      console.error(error);
//      return formatResponse(false, null, "Failed to create manifest", 500);
//    }

//   // try {
//   //   const newDelivery = await prisma.delivery.create({
//   //     data: {
//   //       companyId,
//   //       trackingNumber,
//   //       riderId: riderId || null,
//   //       riderName: riderName || null,
//   //       status: status as DeliveryStatus,
//   //       pickupAddress: finalPickup,
//   //       deliveryAddress: finalDrop,
//   //       packageDescription: finalDesc,
//   //       weightKg: finalWeight,
//   //       deliveryFee: Number(finalFee) || 0,
//   //       packageValue: Number(packageValue) || 0,
//   //       customerName: customerName,
//   //       scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
//   //       // Link to the parent CustomerOrders records
//   //       CustomerOrders:
//   //         customerOrderIds.length > 0
//   //           ? { connect: customerOrderIds.map((id: string) => ({ id })) }
//   //           : undefined,
//   //       ...rest,
//   //     },
//   //     include: {
//   //       rider: { select: { name: true } },
//   //     },
//   //   });

//   //   const formattedDelivery = {
//   //     ...newDelivery,
//   //     riderName: newDelivery.rider?.name || "Unassigned",
//   //   };

//   //   try {
//   //     await cacheDel(`admin:deliveries:${companyId || "global"}:*`);
//   //   } catch (e) {}
//   //   return formatResponse(
//   //     true,
//   //     formattedDelivery,
//   //     "Delivery created successfully.",
//   //     201,
//   //   );
//   // } catch (error: any) {
//   //   if (error.code === "P2002") {
//   //     return formatResponse(
//   //       false,
//   //       null,
//   //       "A delivery with this tracking number already exists.",
//   //       409,
//   //     );
//   //   }
//   //   console.error("Delivery creation error:", error);
//   //   return formatResponse(false, null, "Failed to create delivery.", 500);
//   // }
// });
