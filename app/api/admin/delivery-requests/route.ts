import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { DispatchEngine } from "@/lib/dispatch/dispatchEngine";
import { enqueueDispatchJob } from "@/lib/dispatch/dispatchQueue";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/admin/delivery-requests: List delivery requests for a store
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || (session.user as any).companyId;
    const statusFilter = searchParams.get("status");

    if (!companyId) {
      return json({ success: false, message: "Company ID is required" }, 400);
    }

    const requests = await prisma.deliveryRequest.findMany({
      where: {
        companyId,
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      include: {
        bids: {
          include: {
            riderProfile: {
              select: { fullName: true, phone: true, rating: true, profilePhoto: true, riderType: true },
            },
          },
          orderBy: { proposedFee: "asc" },
        },
        assignment: {
          include: {
            riderProfile: {
              select: {
                fullName: true,
                phone: true,
                profilePhoto: true,
                rating: true,
                currentLat: true,
                currentLng: true,
                locationUpdatedAt: true,
              },
            },
          },
        },
        order: {
          select: { id: true, totalPrice: true, totalFinalPrice: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return json({ success: true, count: requests.length, requests });
  } catch (error: any) {
    console.error("[ADMIN_DELIVERY_REQUESTS_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load delivery requests" }, 500);
  }
}

// POST /api/admin/delivery-requests: Create an on-demand external rider delivery request
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const {
      companyId = (session.user as any).companyId,
      orderId,
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupContactName,
      pickupContactPhone,
      pickupInstructions,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      dropoffContactName,
      dropoffContactPhone,
      dropoffInstructions,
      packageDescription,
      packageWeightKg,
      packageDimensions,
      vehicleTypeRequired = "ANY",
      deliveryPriority = "STANDARD",
      offeredRiderFee,
      customerDeliveryCharge = 0,
      biddingEnabled = true,
      minBidFee,
      maxBidFee,
      dispatchRadiusKm = 5.0,
      idempotencyKey,
    } = body;

    if (!companyId) {
      return json({ success: false, message: "Company ID is required." }, 400);
    }

    if (!pickupAddress || !dropoffAddress) {
      return json({ success: false, message: "Pickup and dropoff addresses are required." }, 400);
    }

    if (!offeredRiderFee || Number(offeredRiderFee) <= 0) {
      return json({ success: false, message: "Valid positive offered rider fee is required." }, 400);
    }

    // Default GPS coordinates if geocoding wasn't provided by client (e.g. Nairobi center coords)
    const finalPickupLat = typeof pickupLat === "number" ? pickupLat : -1.286389;
    const finalPickupLng = typeof pickupLng === "number" ? pickupLng : 36.817223;
    const finalDropoffLat = typeof dropoffLat === "number" ? dropoffLat : -1.292066;
    const finalDropoffLng = typeof dropoffLng === "number" ? dropoffLng : 36.821946;

    // Create delivery request in DB
    const { request, isDuplicate } = await DispatchEngine.createDeliveryRequest({
      companyId,
      orderId: orderId || undefined,
      pickupAddress,
      pickupLat: finalPickupLat,
      pickupLng: finalPickupLng,
      pickupContactName: pickupContactName || "Store Dispatcher",
      pickupContactPhone: pickupContactPhone || "",
      pickupInstructions,
      dropoffAddress,
      dropoffLat: finalDropoffLat,
      dropoffLng: finalDropoffLng,
      dropoffContactName: dropoffContactName || "Customer",
      dropoffContactPhone: dropoffContactPhone || "",
      dropoffInstructions,
      packageDescription,
      packageWeightKg: packageWeightKg ? Number(packageWeightKg) : undefined,
      packageDimensions,
      vehicleTypeRequired,
      deliveryPriority,
      customerDeliveryCharge: Number(customerDeliveryCharge),
      offeredRiderFee: Number(offeredRiderFee),
      biddingEnabled,
      minBidFee: minBidFee ? Number(minBidFee) : undefined,
      maxBidFee: maxBidFee ? Number(maxBidFee) : undefined,
      dispatchRadiusKm: Number(dispatchRadiusKm),
      idempotencyKey,
    });

    // Enqueue background dispatch expansion job
    if (!isDuplicate) {
      await enqueueDispatchJob(request.id, 90 * 1000); // Check expiry and expand after 90s
    }

    return json({
      success: true,
      message: isDuplicate
        ? "Existing delivery request retrieved."
        : "External rider request created. Searching for nearby riders...",
      request,
    });
  } catch (error: any) {
    console.error("[ADMIN_DELIVERY_REQUEST_CREATE_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to create delivery request" }, 500);
  }
}
