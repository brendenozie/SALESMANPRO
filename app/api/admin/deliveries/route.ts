// ==========================================================
// FILE: /app/api/admin/deliveries/route.ts
// NEXT.JS APP ROUTER API
// ENTERPRISE DELIVERY API — SalesmanPro Logistics OS
// ==========================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { calculateDeliveryQuote } from "@/lib/logistics-pricing";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function createTrackingNumber() {
  return `VH-${Date.now().toString().slice(-6)}-${Math.random()
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
    const riderId = searchParams.get("riderId");
    const vehicleId = searchParams.get("vehicleId");

    if (!companyId) {
      return json({ success: false, message: "companyId required" }, 400);
    }

    const where: any = { companyId };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (riderId) where.riderId = riderId;
    if (vehicleId) where.vehicleId = vehicleId;

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerContact: { contains: search, mode: "insensitive" } },
        { riderName: { contains: search, mode: "insensitive" } },
        { pickupAddress: { contains: search, mode: "insensitive" } },
        { deliveryAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        rider: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: { select: { id: true, registration: true, make: true, model: true, type: true, status: true } },
        route: { select: { id: true, name: true, startPoint: true, endPoint: true } },
        CustomerOrders: {
          select: {
            id: true,
            name: true,
            phone: true,
            totalFinalPrice: true,
            status: true,
            deliveryStatus: true,
            items: {
              select: {
                id: true,
                price: true,
                quantity: true,
                marketplaceListing: { select: { name: true } },
              },
            },
          },
        },
        stops: { orderBy: { sequence: "asc" } },
        tracking: { orderBy: { recordedAt: "desc" }, take: 5 },
        proofs: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    const mapped = deliveries.map((item) => ({
      ...item,
      orderIds: item.CustomerOrders.map((x) => x.id),
      orderCount: item.CustomerOrders.length,
      proof: item.proofs?.[0] || null,
      latestTracking: item.tracking?.[0] || null,
    }));

    return json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error: any) {
    console.error("GET DELIVERIES ERROR:", error);
    return json({ success: false, message: error.message || "Failed to fetch deliveries" }, 500);
  }
}

// ==========================================================
// POST /api/admin/deliveries
// Supports BOTH order-linked dispatch and direct customer delivery creation
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
      vehicleId,
      routeId,
      driverProfileId,
      consumerId,
      pickupAddress,
      deliveryAddress,
      customerName,
      customerContact,
      customerEmail,
      packageDescription,
      packageValue,
      packageType,
      packageWeightKg,
      serviceType,
      deliveryFee,
      weightKg,
      scheduledFor,
      trackingNumber,
      deliveryInstructions,
      notes,
    } = body;

    if (!companyId) {
      return json({ success: false, message: "companyId required" }, 400);
    }

    if (!pickupAddress || !deliveryAddress) {
      return json({ success: false, message: "Pickup and delivery addresses are required" }, 400);
    }

    // Auto-calculate server-side pricing if not explicitly provided
    const quote = calculateDeliveryQuote({
      pickupAddress,
      deliveryAddress,
      weightKg: parseNumber(weightKg || packageWeightKg || 1),
      packageType: packageType || 'medium',
      serviceType: serviceType || 'STANDARD',
      packageValue: parseNumber(packageValue),
    });

    const calculatedFee = deliveryFee !== undefined && deliveryFee !== null
      ? parseNumber(deliveryFee)
      : quote.total;

    // Resolve rider / driver name
    let resolvedRiderName: string | null = null;
    let resolvedRiderId = riderId || null;

    if (resolvedRiderId) {
      const riderUser = await prisma.user.findUnique({
        where: { id: resolvedRiderId },
        select: { name: true },
      });
      resolvedRiderName = riderUser?.name || null;
    } else if (driverProfileId) {
      const driverRecord = await prisma.transportDriver.findUnique({
        where: { id: driverProfileId },
        include: { user: { select: { id: true, name: true } } },
      });
      if (driverRecord) {
        resolvedRiderId = driverRecord.user.id;
        resolvedRiderName = driverRecord.user.name;
      }
    }

    const generatedTracking = trackingNumber || createTrackingNumber();
    const initialStatus = resolvedRiderId ? "DRIVER_ASSIGNED" : "CONFIRMED";

    // Create delivery record atomically
    const delivery = await prisma.$transaction(async (tx) => {
      const newDel = await tx.delivery.create({
        data: {
          companyId,
          trackingNumber: generatedTracking,
          status: initialStatus as any,
          riderId: resolvedRiderId,
          riderName: resolvedRiderName,
          vehicleId: vehicleId || null,
          routeId: routeId || null,
          driverProfileId: driverProfileId || null,
          consumerId: consumerId || null,
          customerName: customerName || "Customer",
          customerContact: customerContact || null,
          customerEmail: customerEmail || null,
          pickupAddress,
          deliveryAddress,
          deliveryInstructions: deliveryInstructions || null,
          packageDescription: packageDescription || "Package Delivery",
          packageValue: parseNumber(packageValue),
          packageType: packageType || "medium",
          packageWeightKg: parseNumber(packageWeightKg || weightKg || 1),
          weightKg: parseNumber(weightKg || packageWeightKg || 1),
          deliveryFee: calculatedFee,
          totalAmount: calculatedFee,
          notes: notes || null,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
          totalDistanceKm: quote.estimatedDistanceKm,
          estimatedTravelTime: quote.estimatedTimeMins,
          ...(orderIds.length > 0
            ? {
                CustomerOrders: {
                  connect: orderIds.map((id: string) => ({ id })),
                },
              }
            : {}),
        },
      });

      // Initial tracking audit entry
      await tx.deliveryTracking.create({
        data: {
          deliveryId: newDel.id,
          riderId: resolvedRiderId,
          lat: 0,
          lng: 0,
          status: initialStatus,
          locationName: pickupAddress,
          note: `Delivery created with tracking ${generatedTracking}`,
        },
      });

      // Link orders and create multi-drop stops if orderIds provided
      if (orderIds.length > 0) {
        await tx.customerOrder.updateMany({
          where: { id: { in: orderIds } },
          data: {
            deliveryId: newDel.id,
            trackingNumber: generatedTracking,
            deliveryStatus: resolvedRiderId ? "Assigned" : "Scheduled",
            delivery: true,
          },
        });

        let seq = 1;
        for (const oId of orderIds) {
          const ord = await tx.customerOrder.findUnique({ where: { id: oId } });
          if (!ord) continue;
          const shipping: any = ord.shippingAddress || {};
          await tx.deliveryStop.create({
            data: {
              deliveryId: newDel.id,
              orderId: oId,
              sequence: seq++,
              customerName: ord.name || customerName,
              phone: ord.phone || customerContact,
              address: shipping.display_name || ord.name || deliveryAddress,
              lat: shipping.lat ? Number(shipping.lat) : null,
              lng: shipping.lng ? Number(shipping.lng) : null,
              status: "PENDING",
            },
          });
        }
      }

      return newDel;
    });

    return json({
      success: true,
      message: "Delivery created successfully",
      data: delivery,
    }, 201);
  } catch (error: any) {
    console.error("POST DELIVERY ERROR:", error);
    return json({ success: false, message: error.message || "Failed to create delivery" }, 500);
  }
}
