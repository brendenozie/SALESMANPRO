import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { calculateDeliveryQuote, estimateDistanceKm } from "@/lib/logistics-pricing";

function createTrackingNumber(): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK-${Date.now().toString().slice(-4)}${randomPart}`;
}

function createOrderNumber(): string {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-LOG-${Date.now().toString().slice(-4)}${randomPart}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      companySlug,
      companyId: inputCompanyId,
      customer = {},
      pickup = {},
      dropoff = {},
      packageInfo = {},
      serviceType = "STANDARD",
      paymentMethod = "CASH_ON_DELIVERY",
    } = body;

    // 1. Resolve Company
    let targetCompanyId = inputCompanyId;
    let companyCurrency = "USD";
    let companySlugResolved = companySlug;

    if (!targetCompanyId && companySlug) {
      const company = await prisma.company.findFirst({
        where: {
          OR: [{ slug: companySlug }, { customDomain: companySlug }],
        },
        select: { id: true, currency: true, slug: true },
      });
      if (company) {
        targetCompanyId = company.id;
        companyCurrency = company.currency || "USD";
        companySlugResolved = company.slug;
      }
    }

    if (!targetCompanyId) {
      return NextResponse.json(
        { error: "Valid company slug or companyId is required" },
        { status: 400 }
      );
    }

    // 2. Validate Addresses
    const pickupAddress = pickup.address?.trim();
    const dropoffAddress = dropoff.address?.trim();

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Both pickup address and delivery destination address are required" },
        { status: 400 }
      );
    }

    // 3. Server-side quote calculation (Guarantees pricing integrity)
    const distanceKm = estimateDistanceKm(pickupAddress, dropoffAddress);
    const weightKg = Number(packageInfo.weightKg) || 1;
    const isFragile = Boolean(packageInfo.isFragile);
    const requiresColdChain = Boolean(packageInfo.requiresColdChain);
    const declaredValue = packageInfo.declaredValue ? Number(packageInfo.declaredValue) : 0;

    const quote = calculateDeliveryQuote({
      pickupAddress,
      dropoffAddress,
      distanceKm,
      weightKg,
      serviceType,
      isFragile,
      requiresColdChain,
      declaredValue,
      urgency: serviceType === "EXPRESS" || serviceType === "SAME_DAY" ? "EXPRESS" : "STANDARD",
    });

    // 4. Resolve or create Consumer
    const customerEmail = customer.email || session?.user?.email || null;
    const customerPhone = customer.phone || pickup.contactPhone || null;
    const customerName = customer.name || session?.user?.name || "Guest Customer";
    const loggedInUserId = session?.user?.id || null;

    let consumerId: string | null = null;
    if (customerEmail || customerPhone || loggedInUserId) {
      const existingConsumer = await prisma.consumer.findFirst({
        where: {
          companyId: targetCompanyId,
          OR: [
            ...(loggedInUserId ? [{ userId: loggedInUserId }] : []),
            ...(customerEmail ? [{ email: customerEmail }] : []),
            ...(customerPhone ? [{ phone: customerPhone }] : []),
          ],
        },
      });

      if (existingConsumer) {
        consumerId = existingConsumer.id;
      } else {
        const newConsumer = await prisma.consumer.create({
          data: {
            companyId: targetCompanyId,
            userId: loggedInUserId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: dropoffAddress,
          },
        });
        consumerId = newConsumer.id;
      }
    }

    const trackingNumber = createTrackingNumber();
    const orderNumber = createOrderNumber();
    const isCOD = paymentMethod === "CASH_ON_DELIVERY";

    // 5. Database transaction: Create CustomerOrder + Delivery + Initial Tracking Event
    const result = await prisma.$transaction(async (tx) => {
      // Create CustomerOrder
      const order = await tx.customerOrder.create({
        data: {
          Company: { connect: { id: targetCompanyId } },
          consumerId,
          name: customerName,
          email: customerEmail || "guest@delivery.com",
          phone: customerPhone || "N/A",
          shippingAddress: { address: dropoffAddress },
          orderSource: "WEBSITE",
          status: isCOD ? "PROCESSING" : "PENDING",
          paymentOption: paymentMethod,
          totalPrice: quote.total,
          totalFinalPrice: quote.total,
          delivery: true,
          trackingNumber,
          deliveryStatus: isCOD ? "CONFIRMED" : "PENDING_PAYMENT",
          notes: `Delivery booking: ${serviceType} service from ${pickupAddress} to ${dropoffAddress}. Notes: ${dropoff.notes || "None"}`,
        },
      });

      // Create Delivery
      const delivery = await tx.delivery.create({
        data: {
          companyId: targetCompanyId,
          trackingNumber,
          status: isCOD ? "CONFIRMED" : "PENDING_PAYMENT",
          consumerId,
          customerName,
          customerContact: customerPhone,
          customerEmail,
          pickupAddress,
          deliveryAddress: dropoffAddress,
          deliveryInstructions: dropoff.notes || pickup.notes || null,
          packageDescription: packageInfo.description || "Package Delivery",
          packageValue: declaredValue,
          packageType: packageInfo.packageType || "parcel",
          packageWeightKg: weightKg,
          weightKg,
          deliveryFee: quote.total,
          totalAmount: quote.total,
          totalDistanceKm: quote.estimatedDistanceKm,
          estimatedTravelTime: quote.estimatedTimeMins,
          scheduledFor: dropoff.scheduledAt ? new Date(dropoff.scheduledAt) : new Date(),
          notes: packageInfo.notes || null,
          CustomerOrders: {
            connect: [{ id: order.id }],
          },
        },
      });

      // Initial tracking audit entry
      await tx.deliveryTracking.create({
        data: {
          deliveryId: delivery.id,
          lat: 0,
          lng: 0,
          status: isCOD ? "CONFIRMED" : "REQUESTED",
          locationName: pickupAddress,
          note: isCOD
            ? "Order placed and confirmed. Awaiting driver assignment."
            : "Booking request received. Awaiting payment confirmation.",
        },
      });

      return { order, delivery };
    });

    return NextResponse.json({
      success: true,
      message: "Delivery booked successfully",
      trackingNumber,
      orderNumber: result.order.id,
      deliveryId: result.delivery.id,
      orderId: result.order.id,
      quote,
      currency: companyCurrency,
      companySlug: companySlugResolved,
      paymentStatus: isCOD ? "PAY_ON_DELIVERY" : "PENDING_PAYMENT",
    });
  } catch (error: any) {
    console.error("Error booking delivery:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process delivery booking" },
      { status: 500 }
    );
  }
}
