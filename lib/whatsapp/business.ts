// lib/whatsapp/business.ts

import prisma from "@/server/db/prismadb";
import { createOrder as createOrderRecord } from "@/lib/orders/createOrder";

/**
 * PRODUCT SEARCH
 */
export async function searchMarketplace(params: {
  companyId: string;

  query?: string;

  category?: string;

  maxPrice?: number;

  limit?: number;
}) {
  const limit = Math.min(params.limit || 5, 10);

  const listings = await prisma.marketplaceListings.findMany({
    where: {
      companyId: params.companyId,

      status: "ACTIVE",

      isAvailable: true,

      showOnGhuba: true,

      ghubaAdminApproved: true,

      ghubaStatus: "APPROVED",

      ...(params.maxPrice
        ? {
            finalPrice: {
              lte: params.maxPrice,
            },
          }
        : {}),

      ...(params.query
        ? {
            OR: [
              {
                name: {
                  contains: params.query,
                  mode: "insensitive",
                },
              },

              {
                description: {
                  contains: params.query,
                  mode: "insensitive",
                },
              },

              {
                brand: {
                  contains: params.query,
                  mode: "insensitive",
                },
              },

              {
                tags: {
                  has: params.query,
                },
              },
            ],
          }
        : {}),

      ...(params.category
        ? {
            category: {
              contains: params.category,
              mode: "insensitive",
            },
          }
        : {}),
    },

    orderBy: [
      {
        isFeatured: "desc",
      },

      {
        createdAt: "desc",
      },
    ],

    take: limit,

    select: {
      id: true,

      name: true,

      description: true,

      finalPrice: true,

      sellingPrice: true,

      images: true,

      brand: true,

      condition: true,

      category: true,

      isAvailable: true,

      delivery: true,
    },
  });

  return listings;
}

/**
 * PRODUCT DETAILS
 */
export async function getListing(listingId: string, companyId: string) {
  return prisma.marketplaceListings.findFirst({
    where: {
      id: listingId,

      companyId,
    },

    select: {
      id: true,

      name: true,

      description: true,

      longDescription: true,

      finalPrice: true,

      sellingPrice: true,

      buyingPrice: true,

      discount: true,

      tax: true,

      shippingCost: true,

      quantity: true,

      images: true,

      videos: true,

      brand: true,

      model: true,

      color: true,

      size: true,

      condition: true,

      material: true,

      category: true,

      subCategoryName: true,

      delivery: true,

      deliveryMethod: true,

      paymentOption: true,

      amenities: true,

      providerRating: true,

      bookingSlots: true,

      availabilityStart: true,

      availabilityEnd: true,

      serviceSchedule: true,

      requiredClientInfo: true,

      hourlyRate: true,

      minimumHours: true,
    },
  });
}

/**
 * SERVER-SIDE PRICING
 *
 * Replace this implementation with the pricing engine
 * we created previously if its exported function has
 * a different name/signature.
 */
export async function calculateOrderPricing(params: {
  companyId: string;

  items: Array<{
    marketplaceListingId: string;

    quantity: number;

    selectedOptions?: unknown[];
  }>;
}) {
  const listings = await prisma.marketplaceListings.findMany({
    where: {
      id: {
        in: params.items.map((item) => item.marketplaceListingId),
      },

      companyId: params.companyId,
    },
  });

  const byId = new Map(listings.map((listing) => [listing.id, listing]));

  let subtotal = 0;

  const pricedItems = [];

  for (const item of params.items) {
    const listing = byId.get(item.marketplaceListingId);

    if (!listing) {
      throw new Error(`Listing ${item.marketplaceListingId} was not found`);
    }

    if (!listing.isAvailable) {
      throw new Error(`${listing.name} is currently unavailable`);
    }

    const unitPrice = listing.finalPrice ?? listing.sellingPrice;

    if (unitPrice <= 0) {
      throw new Error(`${listing.name} has an invalid price`);
    }

    const total = unitPrice * item.quantity;

    subtotal += total;

    pricedItems.push({
      marketplaceListingId: listing.id,

      name: listing.name,

      quantity: item.quantity,

      unitPrice,

      totalPrice: total,

      selectedOptions: item.selectedOptions || [],
    });
  }

  return {
    items: pricedItems,

    subtotal,

    discount: 0,

    tax: 0,

    shipping: 0,

    total: subtotal,
  };
}

/**
 * CREATE ORDER
 *
 * IMPORTANT:
 * The AI does not calculate or persist
 * arbitrary prices.
 */
export async function createWhatsAppOrder(params: {
  companyId: string;

  consumerId?: string;

  name: string;

  email?: string;

  phone: string;

  items: Array<{
    marketplaceListingId: string;

    quantity: number;

    selectedOptions?: unknown[];

    price?: number;

    totalPrice?: number;

    date?: string;

    timeSlot?: string;

    serviceNotes?: string;
  }>;

  paymentOption:
    | "cod"
    | "pickupatshop"
    | "mpesa"
    | "card"
    | "paystack"
    | "ghuba"
    | "stripe"
    | "paypal"
    | "cash"
    | "split"
    | "pending";

  shippingAddress?: unknown;

  shippingMethod?: string;

  conversationId: string;

  sourceMessageId?: string;
}) {
  const pricing = await calculateOrderPricing({
    companyId: params.companyId,

    items: params.items,
  });

  const order = await createOrderRecord({
    companyId: params.companyId,

    consumerId: params.consumerId,

    name: params.name,

    email: params.email,

    phone: params.phone,

    items: pricing.items.map((item) => ({
      marketplaceListingId: item.marketplaceListingId,

      quantity: item.quantity,

      price: item.unitPrice,

      totalPrice: item.totalPrice,

      selectedOptions: item.selectedOptions as any,
    })),

    totalPrice: pricing.subtotal,

    totalFinalPrice: pricing.total,

    paymentOption: params.paymentOption,

    shippingAddress: params.shippingAddress as any,

    shippingMethod: params.shippingMethod,

    delivery: false,

    deliveryStatus: "Order Placed",

    notes: `Created via WhatsApp AI. Conversation: ${params.conversationId}`,
  });

  return {
    order,

    pricing,
  };
}

/**
 * ORDER STATUS
 */
export async function getOrderStatus(params: {
  companyId: string;

  orderId?: string;

  trackingNumber?: string;

  phone?: string;
}) {
  const order = await prisma.customerOrder.findFirst({
    where: {
      companyId: params.companyId,

      ...(params.orderId
        ? {
            id: params.orderId,
          }
        : {}),

      ...(params.trackingNumber
        ? {
            trackingNumber: params.trackingNumber,
          }
        : {}),

      ...(params.phone
        ? {
            phone: params.phone,
          }
        : {}),
    },

    select: {
      id: true,

      trackingNumber: true,

      status: true,

      paymentStatus: true,

      paymentOption: true,

      deliveryStatus: true,

      estimatedArrival: true,

      totalFinalPrice: true,

      createdAt: true,
    },
  });

  return order;
}

/**
 * SERVICE AVAILABILITY
 *
 * This is the adapter point for your actual booking/
 * appointment availability service.
 */
export async function getServiceAvailability(params: {
  companyId: string;

  listingId: string;

  date?: string;
}) {
  const listing = await prisma.marketplaceListings.findFirst({
    where: {
      id: params.listingId,

      companyId: params.companyId,
    },

    select: {
      id: true,

      name: true,

      bookingSlots: true,

      availabilityStart: true,

      availabilityEnd: true,

      serviceSchedule: true,

      minNoticePeriod: true,

      maxBookingAhead: true,
    },
  });

  if (!listing) {
    throw new Error("Service listing not found");
  }

  return {
    listingId: listing.id,

    serviceName: listing.name,

    requestedDate: params.date || null,

    bookingSlots: listing.bookingSlots,

    availabilityStart: listing.availabilityStart,

    availabilityEnd: listing.availabilityEnd,

    serviceSchedule: listing.serviceSchedule,

    minNoticePeriod: listing.minNoticePeriod,

    maxBookingAhead: listing.maxBookingAhead,
  };
}

/**
 * BOOK SERVICE
 *
 * Uses the same unified order service rather than
 * creating a WhatsApp-specific order implementation.
 */
export async function bookService(params: {
  companyId: string;

  consumerId?: string;

  name: string;

  email?: string;

  phone: string;

  listingId: string;

  date: string;

  timeSlot?: string;

  quantity?: number;

  serviceNotes?: string;

  paymentOption:
    | "cod"
    | "pickupatshop"
    | "mpesa"
    | "card"
    | "paystack"
    | "ghuba"
    | "stripe"
    | "paypal"
    | "cash"
    | "split"
    | "pending";

  conversationId: string;
}) {
  const availability = await getServiceAvailability({
    companyId: params.companyId,

    listingId: params.listingId,

    date: params.date,
  });

  if (!availability) {
    throw new Error("Service availability could not be verified");
  }

  return createWhatsAppOrder({
    companyId: params.companyId,

    consumerId: params.consumerId,

    name: params.name,

    email: params.email,

    phone: params.phone,

    items: [
      {
        marketplaceListingId: params.listingId,

        quantity: params.quantity || 1,

        date: params.date,

        timeSlot: params.timeSlot,

        serviceNotes: params.serviceNotes,
      },
    ],

    paymentOption: params.paymentOption,

    conversationId: params.conversationId,
  });
}
