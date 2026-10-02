import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { calculateDistance } from "@/lib/geofencing";
import { DeliveryRequestStatus } from "@prisma/client";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/rider/deliveries/available: Discover open delivery requests & offers
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        vehicles: { where: { isActive: true } },
      },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    if (rider.verificationStatus !== "APPROVED") {
      return json(
        {
          success: false,
          message: "Your application is currently under review. Approved riders will receive delivery orders here.",
          verificationStatus: rider.verificationStatus,
        },
        403
      );
    }

    const { searchParams } = new URL(req.url);
    const radiusFilter = searchParams.get("radius") ? Number(searchParams.get("radius")) : rider.maxDistanceKm;

    // Rider current location (or default to Nairobi if not yet provided)
    const riderLat = rider.currentLat ?? -1.286389;
    const riderLng = rider.currentLng ?? 36.817223;

    // Fetch open delivery requests
    const requests = await prisma.deliveryRequest.findMany({
      where: {
        status: {
          in: [
            DeliveryRequestStatus.SEARCHING_FOR_RIDER,
            DeliveryRequestStatus.OFFERED,
            DeliveryRequestStatus.BIDDING,
          ],
        },
      },
      include: {
        company: { select: { id: true, name: true, logoUrl: true, address: true } },
        bids: {
          where: { riderProfileId: rider.id },
          select: { id: true, proposedFee: true, status: true, submittedAt: true },
        },
        offers: {
          where: { riderProfileId: rider.id },
          select: { id: true, status: true, expiresAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const availableOpportunities = [];

    for (const req of requests) {
      // Calculate distance from rider to pickup
      const distanceMeters = calculateDistance(riderLat, riderLng, req.pickupLat, req.pickupLng);
      const distanceKm = Number((distanceMeters / 1000).toFixed(1));

      // Calculate approximate delivery trip distance
      const tripMeters = calculateDistance(req.pickupLat, req.pickupLng, req.dropoffLat, req.dropoffLng);
      const tripKm = Number((tripMeters / 1000).toFixed(1));

      if (distanceKm > radiusFilter) {
        continue;
      }

      // Check vehicle compatibility
      if (req.vehicleTypeRequired && req.vehicleTypeRequired !== "ANY") {
        const matchesRiderType = rider.riderType.toUpperCase() === req.vehicleTypeRequired.toUpperCase();
        const matchesVehicle = rider.vehicles.some(
          (v) => v.vehicleType.toUpperCase() === req.vehicleTypeRequired?.toUpperCase()
        );
        if (!matchesRiderType && !matchesVehicle) {
          continue;
        }
      }

      const activeOffer = req.offers.find((o) => o.status === "PENDING" && new Date(o.expiresAt) > new Date());
      const myBid = req.bids[0] || null;

      // Privacy preservation: unassigned riders receive approximate dropoff area rather than exact customer street address
      const approximateDropoff = req.dropoffAddress.split(",")[0] || "Destination Area";

      availableOpportunities.push({
        id: req.id,
        trackingNumber: req.trackingNumber,
        storeName: req.company.name || "SalesmanPro Merchant",
        storeLogo: req.company.logoUrl,
        pickupAddress: req.pickupAddress,
        pickupArea: req.pickupAddress.split(",")[0] || "Pickup Area",
        dropoffArea: approximateDropoff,
        distanceToPickupKm: distanceKm,
        tripDistanceKm: tripKm,
        offeredRiderFee: req.offeredRiderFee,
        paymentType: req.paymentType || "GHUBA_ESCROW",
        escrowStatus: req.escrowStatus || "DEPOSITED",
        escrowAmount: req.escrowAmount || req.offeredRiderFee,
        transactionFeePercent: req.transactionFeePercent || 4.0,
        netRiderPayout: Math.round(req.offeredRiderFee - (req.offeredRiderFee * ((req.transactionFeePercent || 4.0) / 100))),
        biddingEnabled: req.biddingEnabled,
        minBidFee: req.minBidFee,
        maxBidFee: req.maxBidFee,
        vehicleTypeRequired: req.vehicleTypeRequired,
        packageDescription: req.packageDescription || "General Retail Package",
        packageWeightKg: req.packageWeightKg,
        priority: req.deliveryPriority,
        hasDirectOffer: !!activeOffer,
        offerExpiresAt: activeOffer?.expiresAt || null,
        myBid,
        createdAt: req.createdAt,
      });
    }

    return json({
      success: true,
      count: availableOpportunities.length,
      isOnline: rider.isOnline,
      currentLocation: { lat: riderLat, lng: riderLng },
      deliveries: availableOpportunities,
    });
  } catch (error: any) {
    console.error("[RIDER_AVAILABLE_DELIVERIES_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to fetch deliveries" }, 500);
  }
}
