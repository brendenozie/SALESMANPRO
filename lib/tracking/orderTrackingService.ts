import prisma from "@/server/db/prismadb";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export interface TrackingEnrichedItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string | null;
  selectedOptions?: any;
}

export interface TrackingTimelineStep {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  date?: string | null;
}

export interface TrackingRiderInfo {
  id: string;
  name: string;
  phone?: string | null;
  image?: string | null;
  rating?: number;
  vehicle?: string | null;
  plateNumber?: string | null;
  vehicleType?: string | null;
  currentLat?: number | null;
  currentLng?: number | null;
  lastUpdate?: string | null;
}

export interface TrackingEscrowFinancials {
  paymentType: string;
  escrowStatus: string;
  escrowAmount: number;
  platformFeePercent?: number;
  offeredFee?: number;
  isEscrowSecured: boolean;
}

export interface TrackingResultData {
  orderId: string;
  trackingNumber: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  paymentOption?: string | null;
  paymentMethod?: string | null;
  deliveryStatus: string;
  shippingMethod: string;
  shippingAddress?: any;
  deliveryInstructions?: string | null;
  createdAt: string;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  items: TrackingEnrichedItem[];
  store: {
    name: string;
    slug?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    address?: string | null;
  };
  steps: TrackingTimelineStep[];
  rider?: TrackingRiderInfo | null;
  escrow?: TrackingEscrowFinancials | null;
  coordinates?: {
    pickup?: { lat: number; lng: number; address?: string };
    dropoff?: { lat: number; lng: number; address?: string };
    rider?: { lat: number; lng: number };
  } | null;
}

export interface CustomerOrderSummary {
  id: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
  storeName: string;
  storeSlug?: string | null;
}

export async function resolveOrderTracking(
  query: string,
  storeSlug?: string | null,
): Promise<{
  success: boolean;
  data?: TrackingResultData;
  multipleOrders?: CustomerOrderSummary[];
  error?: string;
}> {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    return { success: false, error: "Tracking number, order number, or phone/email is required." };
  }

  // Strip leading '#' or whitespace often typed by users (e.g. #ORD-123 or #TRK-123)
  const clean = trimmed.replace(/^#+/, "").trim();
  const isEmail = clean.includes("@");
  const isPhone = !isEmail && /^[\d\s+\-()]{7,20}$/.test(clean);
  const cleanDigits = clean.replace(/\D/g, "");

  // Resolve store company ID if storeSlug provided
  let storeCompanyId: string | null = null;
  if (storeSlug) {
    const store = await prisma.company.findFirst({
      where: {
        OR: [
          { slug: { equals: storeSlug, mode: "insensitive" } },
          isValidObjectId(storeSlug) ? { id: storeSlug } : undefined,
        ].filter(Boolean) as any,
      },
      select: { id: true },
    });
    if (store) storeCompanyId = store.id;
  }

  // --------------------------------------------------------------------------
  // PATH A: Customer Email or Phone Search
  // --------------------------------------------------------------------------
  if (isEmail || (isPhone && cleanDigits.length >= 9)) {
    const matchingOrders = await prisma.customerOrder.findMany({
      where: {
        OR: [
          isEmail ? { email: { equals: clean, mode: "insensitive" } } : undefined,
          isPhone
            ? {
                OR: [
                  { phone: { contains: cleanDigits.slice(-9) } },
                  { mpesaPhone: { contains: cleanDigits.slice(-9) } },
                ],
              }
            : undefined,
        ].filter(Boolean) as any,
        ...(storeCompanyId ? { companyId: storeCompanyId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: { select: { id: true, quantity: true, price: true } },
        Company: { select: { name: true, slug: true } },
      },
    });

    if (matchingOrders.length === 0) {
      return {
        success: false,
        error: `No orders found matching ${isEmail ? "email" : "phone"} "${clean}".`,
      };
    }

    if (matchingOrders.length === 1) {
      // If single order, return its full tracking view directly
      return fetchFullOrderTracking(matchingOrders[0].id);
    }

    // Multiple orders found - return list of summaries so user can select
    return {
      success: true,
      multipleOrders: matchingOrders.map((ord) => ({
        id: ord.id,
        trackingNumber: ord.trackingNumber || ord.id.slice(-8).toUpperCase(),
        status: ord.status,
        paymentStatus: ord.paymentStatus,
        total: ord.totalFinalPrice || ord.totalPrice || 0,
        itemCount: ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0,
        createdAt: ord.createdAt.toISOString(),
        storeName: ord.Company?.name || "Store",
        storeSlug: ord.Company?.slug || null,
      })),
    };
  }

  // --------------------------------------------------------------------------
  // PATH B: Exact Tracking / Order Identifier Search
  // --------------------------------------------------------------------------
  return fetchFullOrderTracking(clean, storeCompanyId);
}

async function fetchFullOrderTracking(
  cleanQuery: string,
  storeCompanyId?: string | null,
): Promise<{
  success: boolean;
  data?: TrackingResultData;
  error?: string;
}> {
  // 1. Try finding in CustomerOrder
  const order = await prisma.customerOrder.findFirst({
    where: {
      OR: [
        { trackingNumber: { equals: cleanQuery, mode: "insensitive" } },
        { transactionReference: { equals: cleanQuery, mode: "insensitive" } },
        { externalReference: { equals: cleanQuery, mode: "insensitive" } },
        { transactionId: { equals: cleanQuery, mode: "insensitive" } },
        isValidObjectId(cleanQuery) ? { id: cleanQuery } : undefined,
      ].filter(Boolean) as any,
      ...(storeCompanyId ? { companyId: storeCompanyId } : {}),
    },
    include: {
      items: true,
      Company: {
        select: {
          id: true,
          name: true,
          slug: true,
          contactEmail: true,
          contactPhone: true,
          logoUrl: true,
          bannerUrl: true,
          address: true,
        },
      },
      deliveryRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          assignment: {
            include: {
              riderProfile: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                  currentLat: true,
                  currentLng: true,
                  rating: true,
                  vehicles: {
                    take: 1,
                    select: {
                      make: true,
                      model: true,
                      plateNumber: true,
                      vehicleType: true,
                      color: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      Delivery: {
        include: {
          rider: { select: { id: true, name: true, phone: true, image: true } },
          vehicle: { select: { registration: true, model: true, type: true } },
          tracking: { orderBy: { recordedAt: "desc" }, take: 10 },
          proofs: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  // 2. If not found in CustomerOrder, try finding in DeliveryRequest directly
  if (!order) {
    const delReq = await prisma.deliveryRequest.findFirst({
      where: {
        OR: [
          { trackingNumber: { equals: cleanQuery, mode: "insensitive" } },
          { orderReference: { equals: cleanQuery, mode: "insensitive" } },
          isValidObjectId(cleanQuery) ? { id: cleanQuery } : undefined,
        ].filter(Boolean) as any,
        ...(storeCompanyId ? { companyId: storeCompanyId } : {}),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            contactEmail: true,
            contactPhone: true,
            logoUrl: true,
            bannerUrl: true,
            address: true,
          },
        },
        order: {
          include: { items: true },
        },
        assignment: {
          include: {
            riderProfile: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                currentLat: true,
                currentLng: true,
                rating: true,
                vehicles: {
                  take: 1,
                  select: {
                    make: true,
                    model: true,
                    plateNumber: true,
                    vehicleType: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!delReq) {
      return {
        success: false,
        error: `No package or order found matching "${cleanQuery}". Please double check your tracking code or order number.`,
      };
    }

    // Build tracking view directly from DeliveryRequest
    return {
      success: true,
      data: formatDeliveryRequestTracking(delReq),
    };
  }

  // 3. Enrich items with product titles and images
  const listingIds = order.items
    .map((i) => i.marketplaceListingId)
    .filter(Boolean) as string[];

  const listings = listingIds.length
    ? await prisma.marketplaceListings.findMany({
        where: { id: { in: listingIds } },
        select: { id: true, name: true, images: true, sellingPrice: true },
      })
    : [];

  const listingMap = new Map(listings.map((l) => [l.id, l]));

  const enrichedItems: TrackingEnrichedItem[] = order.items.map((item) => {
    const listing = item.marketplaceListingId ? listingMap.get(item.marketplaceListingId) : null;
    const firstImage = listing?.images?.[0];
    return {
      id: item.id,
      name: listing?.name || "Store Item",
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      image: typeof firstImage === "string" ? firstImage : null,
      selectedOptions: item.selectedOptions,
    };
  });

  // 4. Resolve delivery/rider details (from DeliveryRequest or fleet Delivery)
  const activeDeliveryReq = order.deliveryRequests?.[0] || null;
  const activeFleetDelivery = order.Delivery || null;

  let riderInfo: TrackingRiderInfo | null = null;
  let escrowInfo: TrackingEscrowFinancials | null = null;
  let coordinatesInfo: TrackingResultData["coordinates"] = null;

  if (activeDeliveryReq) {
    const assignment = activeDeliveryReq.assignment;
    const assignedRider = assignment?.riderProfile;
    const vehicle = assignedRider?.vehicles?.[0];

    if (assignedRider) {
      riderInfo = {
        id: assignedRider.id,
        name: assignedRider.fullName,
        phone: ["RIDER_ASSIGNED", "RIDER_EN_ROUTE_TO_PICKUP", "ORDER_COLLECTED", "IN_TRANSIT", "ARRIVED_AT_DROPOFF"].includes(
          activeDeliveryReq.status
        )
          ? assignedRider.phone
          : null,
        rating: assignedRider.rating || 5.0,
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : "Motorbike",
        plateNumber: vehicle?.plateNumber || null,
        vehicleType: vehicle?.vehicleType || "MOTORBIKE",
        currentLat: assignedRider.currentLat,
        currentLng: assignedRider.currentLng,
      };
    }

    escrowInfo = {
      paymentType: activeDeliveryReq.paymentType || "GHUBA_ESCROW",
      escrowStatus: activeDeliveryReq.escrowStatus || "DEPOSITED",
      escrowAmount: activeDeliveryReq.escrowAmount || activeDeliveryReq.offeredRiderFee,
      platformFeePercent: activeDeliveryReq.transactionFeePercent || 4.0,
      offeredFee: activeDeliveryReq.offeredRiderFee,
      isEscrowSecured: activeDeliveryReq.paymentType === "GHUBA_ESCROW" && activeDeliveryReq.escrowStatus === "DEPOSITED",
    };

    coordinatesInfo = {
      pickup: {
        lat: activeDeliveryReq.pickupLat,
        lng: activeDeliveryReq.pickupLng,
        address: activeDeliveryReq.pickupAddress,
      },
      dropoff: {
        lat: activeDeliveryReq.dropoffLat,
        lng: activeDeliveryReq.dropoffLng,
        address: activeDeliveryReq.dropoffAddress,
      },
      rider:
        assignedRider?.currentLat && assignedRider?.currentLng
          ? { lat: assignedRider.currentLat, lng: assignedRider.currentLng }
          : undefined,
    };
  } else if (activeFleetDelivery) {
    if (activeFleetDelivery.rider) {
      riderInfo = {
        id: activeFleetDelivery.rider.id,
        name: activeFleetDelivery.rider.name || "Store Driver",
        phone: activeFleetDelivery.rider.phone,
        image: activeFleetDelivery.rider.image,
        vehicle: activeFleetDelivery.vehicle?.model || null,
        plateNumber: activeFleetDelivery.vehicle?.registration || null,
        vehicleType: activeFleetDelivery.vehicle?.type || null,
      };
    }
  }

  // 5. Construct lifecycle milestone steps
  const isPaid =
    order.paymentStatus === "COMPLETED" ||
    order.status === "PAID" ||
    order.paymentOption === "cash" ||
    order.paymentOption === "cod" ||
    escrowInfo?.isEscrowSecured;

  const reqStatus = activeDeliveryReq?.status;
  const isRiderAssigned = !!reqStatus && reqStatus !== "SEARCHING_FOR_RIDER" && reqStatus !== "OFFERED" && reqStatus !== "CANCELLED";
  const isInTransit = reqStatus === "ORDER_COLLECTED" || reqStatus === "IN_TRANSIT" || reqStatus === "ARRIVED_AT_DROPOFF" || order.deliveryStatus?.toLowerCase().includes("transit");
  const isDelivered = reqStatus === "DELIVERED" || order.status === "COMPLETED" || order.deliveryStatus?.toLowerCase().includes("delivered");

  const steps: TrackingTimelineStep[] = [
    {
      title: "Order Placed",
      description: `Order received on ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "recently"}`,
      completed: true,
      current: !isPaid && !isRiderAssigned && !isDelivered,
      date: order.createdAt.toISOString(),
    },
    {
      title: isPaid ? (escrowInfo?.isEscrowSecured ? "Escrow Payment Secured" : "Payment Confirmed") : "Payment Pending",
      description: isPaid
        ? escrowInfo?.isEscrowSecured
          ? `Deposit of KES ${escrowInfo.escrowAmount.toLocaleString()} secured in Ghuba Escrow`
          : `Paid via ${order.paymentMethod || order.paymentOption || "Gateway"}`
        : `Awaiting payment via ${order.paymentOption || "M-Pesa / Card"}`,
      completed: isPaid,
      current: isPaid && !isRiderAssigned && !isInTransit && !isDelivered,
      date: order.transactionDate ? order.transactionDate.toISOString() : null,
    },
    {
      title: isRiderAssigned ? "Rider Dispatched" : "Processing & Fulfillment",
      description: isRiderAssigned
        ? riderInfo
          ? `${riderInfo.name} assigned (${riderInfo.vehicle || "Motorbike"} • ${riderInfo.plateNumber || "Pending"})`
          : "Rider assigned and en route to store"
        : isPaid
        ? "Store is preparing your order"
        : "Will process upon payment confirmation",
      completed: isRiderAssigned || isInTransit || isDelivered,
      current: isRiderAssigned && !isInTransit && !isDelivered,
      date: null,
    },
    {
      title: "In Transit to Customer",
      description: isInTransit
        ? "Package picked up and on route to delivery destination"
        : "Awaiting pickup from store",
      completed: isInTransit || isDelivered,
      current: isInTransit && !isDelivered,
      date: null,
    },
    {
      title: "Delivered",
      description: isDelivered ? "Package successfully handed over to recipient" : "Pending arrival",
      completed: isDelivered,
      current: isDelivered,
      date: order.deliveryDate ? order.deliveryDate.toISOString() : null,
    },
  ];

  const primaryTrackingNumber =
    order.trackingNumber ||
    activeDeliveryReq?.trackingNumber ||
    activeFleetDelivery?.trackingNumber ||
    order.id.slice(-8).toUpperCase();

  return {
    success: true,
    data: {
      orderId: order.id,
      trackingNumber: primaryTrackingNumber,
      orderNumber: order.id.slice(-6).toUpperCase(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentOption: order.paymentOption,
      paymentMethod: order.paymentMethod,
      deliveryStatus: activeDeliveryReq ? activeDeliveryReq.status.replace(/_/g, " ") : order.deliveryStatus || (isPaid ? "Processing" : "Pending Payment"),
      shippingMethod: order.shippingMethod || (activeDeliveryReq ? "Ghuba On-Demand Express" : "Standard Delivery"),
      shippingAddress: order.shippingAddress || (activeDeliveryReq ? { display_name: activeDeliveryReq.dropoffAddress } : null),
      deliveryInstructions: order.deliveryInstructions || activeDeliveryReq?.dropoffInstructions || null,
      createdAt: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedArrival
        ? order.estimatedArrival.toLocaleDateString()
        : new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
      deliveredAt: isDelivered ? (order.deliveryDate ? order.deliveryDate.toISOString() : new Date().toISOString()) : null,
      pricing: {
        subtotal: order.totalPrice || 0,
        discount: order.totalDiscount || 0,
        shipping: order.totalShipping || (activeDeliveryReq?.customerDeliveryCharge ?? 0),
        tax: order.totalTax || 0,
        total: order.totalFinalPrice || order.totalPrice || 0,
      },
      items: enrichedItems,
      store: {
        name: order.Company?.name || "SalesmanPro Store",
        slug: order.Company?.slug || null,
        phone: order.Company?.contactPhone || null,
        email: order.Company?.contactEmail || null,
        logoUrl: order.Company?.logoUrl || null,
        address: order.Company?.address || null,
      },
      steps,
      rider: riderInfo,
      escrow: escrowInfo,
      coordinates: coordinatesInfo,
    },
  };
}

function formatDeliveryRequestTracking(delReq: any): TrackingResultData {
  const assignment = delReq.assignment;
  const rider = assignment?.riderProfile;
  const vehicle = rider?.vehicles?.[0];

  const riderInfo: TrackingRiderInfo | null = rider
    ? {
        id: rider.id,
        name: rider.fullName,
        phone: ["RIDER_ASSIGNED", "RIDER_EN_ROUTE_TO_PICKUP", "ORDER_COLLECTED", "IN_TRANSIT", "ARRIVED_AT_DROPOFF"].includes(
          delReq.status
        )
          ? rider.phone
          : null,
        rating: rider.rating || 5.0,
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : "Motorbike",
        plateNumber: vehicle?.plateNumber || null,
        vehicleType: vehicle?.vehicleType || "MOTORBIKE",
        currentLat: rider.currentLat,
        currentLng: rider.currentLng,
      }
    : null;

  const isEscrow = delReq.paymentType === "GHUBA_ESCROW";
  const isDelivered = delReq.status === "DELIVERED";
  const isInTransit = ["ORDER_COLLECTED", "IN_TRANSIT", "ARRIVED_AT_DROPOFF"].includes(delReq.status);
  const isAssigned = !!rider;

  const steps: TrackingTimelineStep[] = [
    {
      title: "Delivery Request Created",
      description: `Request placed at store on ${new Date(delReq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      completed: true,
      current: !isAssigned && !isInTransit && !isDelivered,
      date: delReq.createdAt.toISOString(),
    },
    {
      title: isEscrow ? "Ghuba Escrow Secured" : "Cash Settlement Set",
      description: isEscrow
        ? `Deposit of KES ${delReq.escrowAmount.toLocaleString()} secured in Ghuba Escrow`
        : `Payment: ${delReq.paymentType.replace(/_/g, " ")}`,
      completed: true,
      current: false,
      date: delReq.escrowDepositedAt ? delReq.escrowDepositedAt.toISOString() : null,
    },
    {
      title: "Rider Assigned",
      description: riderInfo
        ? `${riderInfo.name} assigned (${riderInfo.vehicle || "Motorbike"} • ${riderInfo.plateNumber || "Pending"})`
        : "Marketplace searching for nearest available rider",
      completed: isAssigned || isInTransit || isDelivered,
      current: isAssigned && !isInTransit && !isDelivered,
      date: null,
    },
    {
      title: "In Transit",
      description: isInTransit
        ? "Package picked up from store and en route to destination"
        : "Awaiting package pickup",
      completed: isInTransit || isDelivered,
      current: isInTransit && !isDelivered,
      date: null,
    },
    {
      title: "Delivered",
      description: isDelivered ? "Package safely handed over to recipient" : "Pending arrival",
      completed: isDelivered,
      current: isDelivered,
      date: delReq.updatedAt ? delReq.updatedAt.toISOString() : null,
    },
  ];

  return {
    orderId: delReq.id,
    trackingNumber: delReq.trackingNumber,
    orderNumber: delReq.orderReference || delReq.id.slice(-6).toUpperCase(),
    status: delReq.status,
    paymentStatus: isEscrow ? "ESCROW_SECURED" : "PENDING_CASH",
    paymentOption: delReq.paymentType,
    paymentMethod: delReq.paymentType,
    deliveryStatus: delReq.status.replace(/_/g, " "),
    shippingMethod: "Ghuba On-Demand Rider Network",
    shippingAddress: { display_name: delReq.dropoffAddress },
    deliveryInstructions: delReq.dropoffInstructions,
    createdAt: delReq.createdAt.toISOString(),
    estimatedDelivery: new Date(new Date(delReq.createdAt).getTime() + 60 * 60 * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    deliveredAt: isDelivered ? delReq.updatedAt.toISOString() : null,
    pricing: {
      subtotal: delReq.customerDeliveryCharge || delReq.offeredRiderFee,
      discount: 0,
      shipping: delReq.customerDeliveryCharge || delReq.offeredRiderFee,
      tax: 0,
      total: delReq.customerDeliveryCharge || delReq.offeredRiderFee,
    },
    items: [
      {
        id: delReq.id,
        name: delReq.packageDescription || "Marketplace Delivery Package",
        quantity: 1,
        price: delReq.customerDeliveryCharge || delReq.offeredRiderFee,
        totalPrice: delReq.customerDeliveryCharge || delReq.offeredRiderFee,
      },
    ],
    store: {
      name: delReq.company?.name || "Merchant Store",
      slug: delReq.company?.slug || null,
      phone: delReq.pickupContactPhone || delReq.company?.contactPhone || null,
      email: delReq.company?.contactEmail || null,
      logoUrl: delReq.company?.logoUrl || null,
      address: delReq.pickupAddress || null,
    },
    steps,
    rider: riderInfo,
    escrow: {
      paymentType: delReq.paymentType,
      escrowStatus: delReq.escrowStatus,
      escrowAmount: delReq.escrowAmount,
      platformFeePercent: delReq.transactionFeePercent,
      offeredFee: delReq.offeredRiderFee,
      isEscrowSecured: isEscrow && delReq.escrowStatus === "DEPOSITED",
    },
    coordinates: {
      pickup: {
        lat: delReq.pickupLat,
        lng: delReq.pickupLng,
        address: delReq.pickupAddress,
      },
      dropoff: {
        lat: delReq.dropoffLat,
        lng: delReq.dropoffLng,
        address: delReq.dropoffAddress,
      },
      rider:
        rider?.currentLat && rider?.currentLng
          ? { lat: rider.currentLat, lng: rider.currentLng }
          : undefined,
    },
  };
}
