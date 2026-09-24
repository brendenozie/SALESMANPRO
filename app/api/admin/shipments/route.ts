import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function mapStatusToShipment(status: string): 'In Warehouse' | 'In Transit' | 'Delivered' | 'On Hold' | 'Cancelled' {
  switch (status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return 'Delivered';
    case 'IN_TRANSIT':
    case 'INPROGRESS':
    case 'OUT_FOR_DELIVERY':
    case 'DRIVER_EN_ROUTE_TO_PICKUP':
    case 'ARRIVED_AT_PICKUP':
    case 'PICKED_UP':
      return 'In Transit';
    case 'CANCELLED':
      return 'Cancelled';
    case 'ON_HOLD':
    case 'FAILED':
    case 'FAILED_DELIVERY':
      return 'On Hold';
    case 'DRAFT':
    case 'PENDING':
    case 'REQUESTED':
    case 'QUOTED':
    case 'CONFIRMED':
    case 'SCHEDULED':
    default:
      return 'In Warehouse';
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return json({ success: false, message: "companyId required" }, 400);
    }

    const deliveries = await prisma.delivery.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        rider: { select: { name: true } },
        vehicle: { select: { registration: true, type: true } },
        tracking: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });

    const shipments = deliveries.map((d) => {
      const mode = d.vehicle?.type === 'HEAVY_DUTY' ? 'Sea Freight' : d.weightKg && d.weightKg > 100 ? 'Air Freight' : 'Land Transport';
      const lastLoc = d.tracking?.[0]?.locationName || d.pickupAddress || 'Dispatch Hub';

      return {
        id: d.id,
        trackingNumber: d.trackingNumber,
        customer: d.customerName || 'Customer Account',
        content: d.packageDescription || 'General Cargo',
        weight: `${d.weightKg || d.packageWeightKg || 1} kg`,
        status: mapStatusToShipment(d.status),
        lastLocation: lastLoc,
        shippingMode: mode as 'Air Freight' | 'Sea Freight' | 'Land Transport',
        value: `KES ${(d.packageValue || d.totalAmount || 0).toLocaleString()}`,
        createdAt: d.createdAt.toISOString(),
      };
    });

    return json({
      success: true,
      data: shipments,
    });
  } catch (error: any) {
    console.error("[SHIPMENTS_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to fetch shipments" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const {
      companyId,
      customerName,
      customerEmail,
      customerContact,
      pickupAddress,
      deliveryAddress,
      packageDescription,
      packageValue,
      weightKg,
      shippingMode,
      notes,
    } = body;

    if (!companyId || !pickupAddress || !deliveryAddress) {
      return json({ success: false, message: "Missing required fields" }, 400);
    }

    const trackingNumber = `SHP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const delivery = await prisma.delivery.create({
      data: {
        companyId,
        trackingNumber,
        status: "CONFIRMED",
        customerName: customerName || "Cargo Client",
        customerEmail: customerEmail || null,
        customerContact: customerContact || null,
        pickupAddress,
        deliveryAddress,
        packageDescription: packageDescription || "Commercial Cargo",
        packageValue: Number(packageValue) || 0,
        weightKg: Number(weightKg) || 10,
        packageWeightKg: Number(weightKg) || 10,
        deliveryFee: Number(packageValue) ? Math.round(Number(packageValue) * 0.08) : 500,
        totalAmount: Number(packageValue) ? Math.round(Number(packageValue) * 0.08) : 500,
        notes: notes || `Mode: ${shippingMode || 'Land Transport'}`,
      },
    });

    await prisma.deliveryTracking.create({
      data: {
        deliveryId: delivery.id,
        lat: 0,
        lng: 0,
        status: "CONFIRMED",
        locationName: pickupAddress,
        note: `Shipment booked under manifest ${trackingNumber}`,
      },
    });

    return json({
      success: true,
      message: "Shipment created successfully",
      data: {
        id: delivery.id,
        trackingNumber: delivery.trackingNumber,
        customer: delivery.customerName,
        content: delivery.packageDescription,
        weight: `${delivery.weightKg} kg`,
        status: 'In Warehouse',
        lastLocation: pickupAddress,
        shippingMode: shippingMode || 'Land Transport',
        value: `KES ${(delivery.packageValue || 0).toLocaleString()}`,
        createdAt: delivery.createdAt.toISOString(),
      },
    }, 201);
  } catch (error: any) {
    console.error("[SHIPMENTS_POST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to create shipment" }, 500);
  }
}
