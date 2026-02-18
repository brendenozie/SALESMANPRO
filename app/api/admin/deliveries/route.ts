import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/deliveries/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { DeliveryStatus, Prisma } from "@prisma/client";


export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const searchTerm = searchParams.get("searchTerm") || "";
  const status = searchParams.get("status");

  const where: Prisma.DeliveryWhereInput = {
    companyId,
  };

  if (status && status !== "All") {
    where.status = status as DeliveryStatus;
  }

  if (searchTerm) {
    where.OR = [
      { trackingNumber: { contains: searchTerm, mode: 'insensitive' } },
      { pickupAddress: { contains: searchTerm, mode: 'insensitive' } },
      { deliveryAddress: { contains: searchTerm, mode: 'insensitive' } },
      { packageDescription: { contains: searchTerm, mode: 'insensitive' } },
      { rider: { name: { contains: searchTerm, mode: 'insensitive' } } },
      // Allow searching by linked customer name
      { CustomerOrder: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } }
    ];
  }

  
    const cacheKey = `admin:deliveries:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const deliveries = await prisma.delivery.findMany({
    where,
    include: {
      rider: {
        select: { id: true, name: true },
      },
      // *** NEW: Include the linked CustomerOrders and nested item data for the frontend table ***
      CustomerOrder: { 
        select: {
          id: true,
          name: true,
          totalFinalPrice: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              marketplaceListing: {
                select: {
                  name: true,
                  locationName: true,
                  contactName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      scheduledFor: 'desc',
    },
  });

  try {
    if (deliveries) {
      await cacheSet(cacheKey, deliveries, 60);
    }
  } catch (e) {}

  const formattedDeliveries = deliveries.map((d) => ({
    ...d,
    riderName: d.rider?.name || 'Unassigned',
  }));

  return formatResponse(true, formattedDeliveries, "Deliveries fetched successfully.", 200);
});



export const POST = withApiHandler(async (request, context) => {
  const body = await request.json();
  const {
    companyId,
    trackingNumber,
    riderId,
    status,
    pickupAddress,
    deliveryAddress,
    packageDescription,
    weightKg,
    deliveryFee,
    scheduledFor,
    // orderIds is assumed to be an array of OrderItem IDs from the frontend modal
    orderIds = [], 
    riderName,
    ...rest
  } = body;

  if (!companyId || !trackingNumber) {
    return formatResponse(false, null, "Missing required fields.", 400);
  }

  let finalPickup = pickupAddress;
  let finalDrop = deliveryAddress;
  let finalDesc = packageDescription;
  let finalFee = deliveryFee;
  let finalWeight = Number(weightKg) || 0;
  let customerOrderIds: string[] = [];
  let packageValue = rest.packageValue;
  let customerName = rest.customerName;

  // --- 1. Process linked OrderItem IDs to derive CustomerOrder IDs and auto-populate data ---
  if (orderIds.length > 0) {
    // 1a. Find the parent CustomerOrder ID for each OrderItem ID
    const orderItems = await prisma.orderItem.findMany({
        where: { id: { in: orderIds } },
        select: { orderId: true, quantity: true, price: true, marketplaceListingId: true }
    });
    
    // Get unique CustomerOrder IDs to link to the Delivery record
    customerOrderIds = Array.from(new Set(orderItems.map(item => item.orderId)));
    
    // 1b. Auto-populate fields from the first linked OrderItem (for pickup details)
    const primaryOrderItem = await prisma.orderItem.findUnique({
        where: { id: orderIds[0] }, 
        include: { 
            marketplaceListing: { 
                select: { name: true, locationName: true, contactName: true } 
            } 
        }
    });

    if (primaryOrderItem && primaryOrderItem.marketplaceListing) {
        // *** Pickup Address: Use marketplace listing location (seller) ***
        finalPickup = pickupAddress || primaryOrderItem.marketplaceListing.locationName || "";
        // If customerName is not set, use the pickup contact name (seller name) as a fallback hint
        customerName = customerName || primaryOrderItem.marketplaceListing.contactName; 
    }

    // 1c. Aggregate item data
    // const totalItemValue = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    // const totalItemWeight = orderItems.length > 0 ? orderItems.reduce((acc, item) => acc + (item.quantity * 1.5), 0) : 0; // Heuristic: 1.5kg per item quantity
    
    // packageValue = packageValue || totalItemValue;
    // finalWeight = finalWeight > 0 ? finalWeight : totalItemWeight;

    const totalItemValue = orderItems.reduce((acc, item) => acc + ((item.price ?? 0) * (item.quantity ?? 0)), 0);
    const totalItemWeight = orderItems.length > 0 ? orderItems.reduce((acc, item) => acc + ((item.quantity ?? 1) * 1.5), 0) : 0; 
    
    packageValue = packageValue ?? totalItemValue;
    finalWeight = finalWeight > 0 ? finalWeight : totalItemWeight;
  }

  // --- 2. Auto-populate from the primary CustomerOrder (for delivery details) ---
  if (customerOrderIds.length > 0) {
    const primaryCustomerOrder = await prisma.customerOrder.findUnique({
        where: { id: customerOrderIds[0] }, 
        include: { items: { include: { marketplaceListing: { select: { name: true } } } } },
    });

    if (primaryCustomerOrder) {
        // *** Delivery Address: Use CustomerOrder shippingAddress ***
        const shippingAddressObject = primaryCustomerOrder.shippingAddress as any;
        const deliveryAddressFromOrder = shippingAddressObject?.display_name || shippingAddressObject?.address_line_1 || null;
        finalDrop = deliveryAddress || deliveryAddressFromOrder || "";
        
        // Auto-populate package description
        const titles = primaryCustomerOrder.items
            ?.map((i) => (i.marketplaceListing as any)?.name)
            .filter(Boolean)
            .join(", ");
        finalDesc = packageDescription || titles || "Multiple items";
        
        // Auto-populate fee and name if not manually set
        // finalFee = deliveryFee || primaryCustomerOrder.totalShipping || Math.round((primaryCustomerOrder.totalFinalPrice || 0) * 0.05);
        
        finalFee = deliveryFee || primaryCustomerOrder.totalShipping || Math.round((primaryCustomerOrder.totalFinalPrice ?? 0) * 0.05); // Use 0 if totalFinalPrice is null
        customerName = customerName || primaryCustomerOrder.name;
    }
  }

  // Final check for required addresses if not linked
  if (!finalPickup || !finalDrop) {
    return formatResponse(false, null, "Pickup Address and Delivery Address are required.", 400);
  }
 
  // --- 3. Create the Delivery record ---
  try {
    const newDelivery = await prisma.delivery.create({
      data: {
        companyId,
        trackingNumber,
        riderId: riderId || null,
        riderName: riderName || null,
        status: status as DeliveryStatus,
        pickupAddress: finalPickup,
        deliveryAddress: finalDrop,
        packageDescription: finalDesc,
        weightKg: finalWeight,
        deliveryFee: Number(finalFee) || 0,
        packageValue: Number(packageValue) || 0,
        customerName: customerName,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        // Link to the parent CustomerOrder records
        CustomerOrder: customerOrderIds.length > 0 ? { connect: customerOrderIds.map((id: string) => ({ id })) } : undefined,
        ...rest,
      },
      include: {
        rider: { select: { name: true } }
      }
    });

    const formattedDelivery = {
      ...newDelivery,
      riderName: newDelivery.rider?.name || 'Unassigned',
    };

    
    try { await cacheDel(`admin:deliveries:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedDelivery, "Delivery created successfully.", 201);
  } catch (error: any) {
    if (error.code === 'P2002') { 
      return formatResponse(false, null, "A delivery with this tracking number already exists.", 409);
    }
    console.error("Delivery creation error:", error);
    return formatResponse(false, null, "Failed to create delivery.", 500);
  }
});