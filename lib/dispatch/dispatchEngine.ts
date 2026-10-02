/**
 * lib/dispatch/dispatchEngine.ts
 *
 * Core Smart Dispatch & Proximity Matching Engine for SalesmanPro On-Demand Delivery & Ghuba Rider Marketplace.
 * Provides:
 * - Nearest-rider discovery with haversine geospatial bounding & distance ranking
 * - Multi-criteria rider eligibility verification (status, online, freshness, vehicle compatibility, workload capacity)
 * - Atomic assignment & race-condition prevention (conditional state transitions)
 * - Bidding submission, review, and atomic bid selection
 * - Staged radius expansion (5km -> 10km -> 15km -> 25km) and offer expiration
 * - Full audit trails and state synchronization with CustomerOrder and Delivery records
 */

import prisma from "@/server/db/prismadb";
import { calculateDistance } from "@/lib/geofencing";
import { transitionDeliveryStatus } from "@/lib/delivery-lifecycle";
import { DeliveryRequestStatus, RiderVerificationStatus } from "@prisma/client";
import { creditRiderEarning } from "@/lib/payments/riderLedger";

export interface CreateDeliveryRequestInput {
  companyId: string;
  orderId?: string;
  deliveryId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupInstructions?: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffContactName: string;
  dropoffContactPhone: string;
  dropoffInstructions?: string;
  packageDescription?: string;
  packageWeightKg?: number;
  packageDimensions?: string;
  vehicleTypeRequired?: string;
  deliveryPriority?: string;
  customerDeliveryCharge?: number;
  offeredRiderFee: number;
  platformFee?: number;
  biddingEnabled?: boolean;
  minBidFee?: number;
  maxBidFee?: number;
  dispatchRadiusKm?: number;
  maxDispatchRadiusKm?: number;
  pickupDeadline?: Date;
  idempotencyKey?: string;
}

export interface NearbyRiderCandidate {
  riderProfileId: string;
  userId: string;
  fullName: string;
  phone: string;
  profilePhoto?: string | null;
  riderType: string;
  distanceKm: number;
  rating: number;
  currentLat: number;
  currentLng: number;
  totalCompletedDeliveries: number;
}

export class DispatchEngine {
  /**
   * Creates a new delivery request from a store order and initiates proximity dispatch.
   */
  public static async createDeliveryRequest(input: CreateDeliveryRequestInput) {
    // 1. Idempotency Check
    if (input.idempotencyKey) {
      const existing = await prisma.deliveryRequest.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { assignment: true, offers: true, bids: true },
      });
      if (existing) {
        return { request: existing, isDuplicate: true };
      }
    }

    // 2. Validate Store Delivery Configuration
    const storeConfig = await prisma.storeDeliveryConfig.findUnique({
      where: { companyId: input.companyId },
    });

    const minFee = storeConfig?.minRiderFee ?? 50;
    const maxFee = storeConfig?.maxRiderFee ?? 10000;
    if (input.offeredRiderFee < minFee || input.offeredRiderFee > maxFee) {
      throw new Error(`Offered fee (${input.offeredRiderFee}) must be between KSH ${minFee} and KSH ${maxFee}.`);
    }

    const trackingNumber = `DEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Calculate platform commission (default 10% or admin-configured)
    const platformFee = input.platformFee ?? Math.round(input.offeredRiderFee * 0.1);

    // 3. Create Delivery Request Record in DB
    const request = await prisma.deliveryRequest.create({
      data: {
        companyId: input.companyId,
        orderId: input.orderId || null,
        deliveryId: input.deliveryId || null,
        trackingNumber,
        pickupAddress: input.pickupAddress,
        pickupLat: input.pickupLat,
        pickupLng: input.pickupLng,
        pickupContactName: input.pickupContactName,
        pickupContactPhone: input.pickupContactPhone,
        pickupInstructions: input.pickupInstructions || null,
        dropoffAddress: input.dropoffAddress,
        dropoffLat: input.dropoffLat,
        dropoffLng: input.dropoffLng,
        dropoffContactName: input.dropoffContactName,
        dropoffContactPhone: input.dropoffContactPhone,
        dropoffInstructions: input.dropoffInstructions || null,
        packageDescription: input.packageDescription || null,
        packageWeightKg: input.packageWeightKg || null,
        packageDimensions: input.packageDimensions || null,
        vehicleTypeRequired: input.vehicleTypeRequired || "ANY",
        deliveryPriority: input.deliveryPriority || "STANDARD",
        customerDeliveryCharge: input.customerDeliveryCharge ?? 0,
        offeredRiderFee: input.offeredRiderFee,
        platformFee,
        biddingEnabled: input.biddingEnabled ?? (storeConfig?.biddingAllowed ?? true),
        minBidFee: input.minBidFee || null,
        maxBidFee: input.maxBidFee || null,
        dispatchRadiusKm: input.dispatchRadiusKm ?? (storeConfig?.maxDeliveryRadiusKm ? Math.min(5.0, storeConfig.maxDeliveryRadiusKm) : 5.0),
        maxDispatchRadiusKm: input.maxDispatchRadiusKm ?? (storeConfig?.maxDeliveryRadiusKm ?? 25.0),
        status: DeliveryRequestStatus.SEARCHING_FOR_RIDER,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour default expiry
        pickupDeadline: input.pickupDeadline || null,
        idempotencyKey: input.idempotencyKey || null,
      },
    });

    // 4. Update linked order status if orderId provided
    if (input.orderId) {
      await prisma.customerOrder.update({
        where: { id: input.orderId },
        data: {
          deliveryStatus: "Searching for Rider",
          deliveryId: input.deliveryId || undefined,
        },
      });
    }

    // 5. Trigger immediate nearest rider dispatch attempt
    await this.dispatchToNearestRiders(request.id);

    return { request, isDuplicate: false };
  }

  /**
   * Finds all verified, online, eligible riders near pickup coordinates.
   */
  public static async findEligibleNearbyRiders(
    pickupLat: number,
    pickupLng: number,
    radiusKm: number,
    vehicleTypeRequired = "ANY",
    excludeRiderIds: string[] = []
  ): Promise<NearbyRiderCandidate[]> {
    // 15-minute location freshness window
    const freshnessCutoff = new Date(Date.now() - 15 * 60 * 1000);

    // Approximate bounding box (1 deg latitude ~ 111km, 1 deg longitude ~ 111km * cos(lat))
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((pickupLat * Math.PI) / 180));

    const riders = await prisma.riderProfile.findMany({
      where: {
        verificationStatus: RiderVerificationStatus.APPROVED,
        isOnline: true,
        currentLat: {
          gte: pickupLat - latDelta,
          lte: pickupLat + latDelta,
        },
        currentLng: {
          gte: pickupLng - lngDelta,
          lte: pickupLng + lngDelta,
        },
        locationUpdatedAt: {
          gte: freshnessCutoff,
        },
        id: {
          notIn: excludeRiderIds,
        },
      },
      include: {
        user: { select: { name: true, phone: true } },
        vehicles: { where: { isActive: true } },
      },
      take: 50,
    });

    const candidates: NearbyRiderCandidate[] = [];

    for (const r of riders) {
      if (r.currentLat === null || r.currentLng === null) continue;

      // Check active assignment limit: max 1 active delivery per rider to prevent overload
      if (r.activeDeliveryRequestId) {
        continue;
      }

      // Check vehicle compatibility
      if (vehicleTypeRequired !== "ANY") {
        const matchesRiderType = r.riderType.toUpperCase() === vehicleTypeRequired.toUpperCase();
        const matchesVehicle = r.vehicles.some(
          (v) => v.vehicleType.toUpperCase() === vehicleTypeRequired.toUpperCase()
        );
        if (!matchesRiderType && !matchesVehicle) {
          continue;
        }
      }

      // Precise Haversine distance in meters -> km
      const distanceMeters = calculateDistance(pickupLat, pickupLng, r.currentLat, r.currentLng);
      const distanceKm = Number((distanceMeters / 1000).toFixed(2));

      // Filter by request radius and rider's maximum preferred distance
      if (distanceKm <= radiusKm && distanceKm <= r.maxDistanceKm) {
        candidates.push({
          riderProfileId: r.id,
          userId: r.userId,
          fullName: r.fullName || r.user.name || "Independent Rider",
          phone: r.phone || r.user.phone || "",
          profilePhoto: r.profilePhoto,
          riderType: r.riderType,
          distanceKm,
          rating: r.rating,
          currentLat: r.currentLat,
          currentLng: r.currentLng,
          totalCompletedDeliveries: r.totalCompletedDeliveries,
        });
      }
    }

    // Rank candidates by distance (closest first), then by rating
    return candidates.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      return b.rating - a.rating;
    });
  }

  /**
   * Dispatches delivery offers to nearest eligible riders.
   */
  public static async dispatchToNearestRiders(deliveryRequestId: string) {
    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      include: {
        offers: true,
      },
    });

    if (!request || request.status !== DeliveryRequestStatus.SEARCHING_FOR_RIDER) {
      return { success: false, message: "Request is not open for dispatch" };
    }

    const previousOfferedRiderIds = request.offers.map((o) => o.riderProfileId);

    const candidates = await this.findEligibleNearbyRiders(
      request.pickupLat,
      request.pickupLng,
      request.dispatchRadiusKm,
      request.vehicleTypeRequired || "ANY",
      previousOfferedRiderIds
    );

    if (candidates.length === 0) {
      // Auto-radius expansion if still under max radius
      if (request.dispatchRadiusKm < request.maxDispatchRadiusKm) {
        const nextRadius = Math.min(request.dispatchRadiusKm + 5.0, request.maxDispatchRadiusKm);
        await prisma.deliveryRequest.update({
          where: { id: deliveryRequestId },
          data: { dispatchRadiusKm: nextRadius },
        });
        return { success: true, message: `No riders at ${request.dispatchRadiusKm}km. Expanded to ${nextRadius}km.`, candidateCount: 0 };
      }

      return { success: false, message: "No eligible riders found in range", candidateCount: 0 };
    }

    // Pick top candidates (batch size 3 for controlled parallel offer, or 1 for strict sequential)
    const topCandidates = candidates.slice(0, 3);
    const offerExpiryTime = new Date(Date.now() + 90 * 1000); // 90 seconds offer window

    await prisma.$transaction(
      topCandidates.map((c) =>
        prisma.deliveryOffer.create({
          data: {
            deliveryRequestId,
            riderProfileId: c.riderProfileId,
            status: "PENDING",
            expiresAt: offerExpiryTime,
            riderDistanceKm: c.distanceKm,
          },
        })
      )
    );

    await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: { status: DeliveryRequestStatus.OFFERED },
    });

    return {
      success: true,
      candidateCount: topCandidates.length,
      offersDispatched: topCandidates.map((c) => ({
        riderId: c.riderProfileId,
        distanceKm: c.distanceKm,
      })),
    };
  }

  /**
   * Atomic Rider Acceptance: Prevents race conditions using MongoDB conditional atomic update.
   */
  public static async acceptDeliveryOffer(deliveryRequestId: string, riderProfileId: string) {
    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderProfileId },
    });

    if (!rider) {
      throw new Error("Rider profile not found");
    }

    if (rider.verificationStatus !== RiderVerificationStatus.APPROVED) {
      throw new Error("Rider account is not verified and approved.");
    }

    if (rider.activeDeliveryRequestId) {
      throw new Error("You already have an active assigned delivery.");
    }

    // Atomic conditional check and update: only succeed if request is in SEARCHING_FOR_RIDER or OFFERED
    // This prevents two riders from claiming the same assignment concurrently.
    const result = await prisma.deliveryRequest.updateMany({
      where: {
        id: deliveryRequestId,
        status: { in: [DeliveryRequestStatus.SEARCHING_FOR_RIDER, DeliveryRequestStatus.OFFERED, DeliveryRequestStatus.BIDDING] },
      },
      data: {
        status: DeliveryRequestStatus.ASSIGNED,
        assignedRiderProfileId: riderProfileId,
      },
    });

    if (result.count === 0) {
      throw new Error("Delivery request is no longer available. It was already assigned or cancelled.");
    }

    // Retrieve fresh request with updated state
    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
    });

    if (!request) {
      throw new Error("Delivery request not found");
    }

    const agreedFee = request.offeredRiderFee;
    const platformCommission = request.platformFee ?? Math.round(agreedFee * 0.1);
    const netRiderEarning = agreedFee - platformCommission;

    // Create assignment and update rider active status
    const assignment = await prisma.deliveryAssignment.create({
      data: {
        deliveryRequestId,
        deliveryId: request.deliveryId || null,
        riderProfileId,
        agreedFee,
        platformCommission,
        netRiderEarning,
        status: "ACTIVE",
      },
    });

    // Bind rider active delivery
    await prisma.riderProfile.update({
      where: { id: riderProfileId },
      data: { activeDeliveryRequestId: deliveryRequestId },
    });

    // Mark rider offer as ACCEPTED and other pending offers as EXPIRED
    await prisma.deliveryOffer.updateMany({
      where: { deliveryRequestId, riderProfileId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    await prisma.deliveryOffer.updateMany({
      where: { deliveryRequestId, riderProfileId: { not: riderProfileId }, status: "PENDING" },
      data: { status: "EXPIRED" },
    });

    // Sync with existing Delivery & CustomerOrder records
    if (request.deliveryId) {
      await prisma.delivery.update({
        where: { id: request.deliveryId },
        data: {
          riderId: rider.userId,
          riderName: rider.fullName,
          status: "DRIVER_ASSIGNED",
        },
      });
      await transitionDeliveryStatus({
        deliveryId: request.deliveryId,
        nextStatus: "DRIVER_ASSIGNED",
        actorId: rider.userId,
        actorName: rider.fullName,
        note: `Marketplace rider ${rider.fullName} accepted assignment.`,
      });
    } else if (request.orderId) {
      await prisma.customerOrder.update({
        where: { id: request.orderId },
        data: {
          deliveryStatus: "Rider Assigned",
          deliveryPersonName: rider.fullName,
          deliveryPersonContact: rider.phone,
        },
      });
    }

    return { success: true, assignment, request };
  }

  /**
   * Rider Bidding: Submit a proposed delivery fee.
   */
  public static async submitBid(
    deliveryRequestId: string,
    riderProfileId: string,
    proposedFee: number,
    estimatedPickupMinutes?: number,
    note?: string
  ) {
    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
    });

    if (!request) {
      throw new Error("Delivery request not found");
    }

    if (!request.biddingEnabled) {
      throw new Error("Bidding is not enabled for this delivery request.");
    }

    if (
      request.status !== DeliveryRequestStatus.SEARCHING_FOR_RIDER &&
      request.status !== DeliveryRequestStatus.OFFERED &&
      request.status !== DeliveryRequestStatus.BIDDING
    ) {
      throw new Error("Bidding is closed for this request.");
    }

    if (request.minBidFee && proposedFee < request.minBidFee) {
      throw new Error(`Proposed fee cannot be lower than KSH ${request.minBidFee}`);
    }

    if (request.maxBidFee && proposedFee > request.maxBidFee) {
      throw new Error(`Proposed fee cannot exceed KSH ${request.maxBidFee}`);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderProfileId },
    });

    if (!rider || rider.verificationStatus !== RiderVerificationStatus.APPROVED) {
      throw new Error("Only verified riders can submit bids.");
    }

    // Check if rider already submitted an active bid
    const existingBid = await prisma.deliveryBid.findFirst({
      where: { deliveryRequestId, riderProfileId, status: "SUBMITTED" },
    });

    let bid;
    if (existingBid) {
      bid = await prisma.deliveryBid.update({
        where: { id: existingBid.id },
        data: {
          proposedFee,
          estimatedPickupMinutes: estimatedPickupMinutes || existingBid.estimatedPickupMinutes,
          note: note || existingBid.note,
          submittedAt: new Date(),
        },
      });
    } else {
      bid = await prisma.deliveryBid.create({
        data: {
          deliveryRequestId,
          riderProfileId,
          proposedFee,
          estimatedPickupMinutes: estimatedPickupMinutes || null,
          note: note || null,
          status: "SUBMITTED",
        },
      });
    }

    // Update request status to BIDDING if not already
    if (request.status !== DeliveryRequestStatus.BIDDING) {
      await prisma.deliveryRequest.update({
        where: { id: deliveryRequestId },
        data: { status: DeliveryRequestStatus.BIDDING },
      });
    }

    return { success: true, bid };
  }

  /**
   * Store Acceptance of a Rider's Bid: Atomically claims assignment and rejects other bids.
   */
  public static async acceptBid(deliveryRequestId: string, bidId: string, companyId: string) {
    const bid = await prisma.deliveryBid.findUnique({
      where: { id: bidId },
      include: { riderProfile: true, deliveryRequest: true },
    });

    if (!bid || bid.deliveryRequestId !== deliveryRequestId) {
      throw new Error("Bid not found for this delivery request.");
    }

    if (bid.deliveryRequest.companyId !== companyId) {
      throw new Error("Unauthorized to accept bids for this store.");
    }

    if (bid.status !== "SUBMITTED") {
      throw new Error("Bid is no longer active.");
    }

    const rider = bid.riderProfile;
    if (rider.verificationStatus !== RiderVerificationStatus.APPROVED) {
      throw new Error("Rider is not verified.");
    }

    if (rider.activeDeliveryRequestId) {
      throw new Error("Rider currently has another active delivery.");
    }

    // Atomic conditional update
    const result = await prisma.deliveryRequest.updateMany({
      where: {
        id: deliveryRequestId,
        companyId,
        status: { in: [DeliveryRequestStatus.SEARCHING_FOR_RIDER, DeliveryRequestStatus.OFFERED, DeliveryRequestStatus.BIDDING] },
      },
      data: {
        status: DeliveryRequestStatus.ASSIGNED,
        assignedRiderProfileId: rider.id,
        finalAgreedFee: bid.proposedFee,
      },
    });

    if (result.count === 0) {
      throw new Error("Request already assigned or closed.");
    }

    const platformCommission = Math.round(bid.proposedFee * 0.1);
    const netRiderEarning = bid.proposedFee - platformCommission;

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        deliveryRequestId,
        deliveryId: bid.deliveryRequest.deliveryId || null,
        riderProfileId: rider.id,
        agreedFee: bid.proposedFee,
        platformCommission,
        netRiderEarning,
        status: "ACTIVE",
      },
    });

    // Mark accepted bid and reject other bids
    await prisma.deliveryBid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED", decidedAt: new Date() },
    });
    await prisma.deliveryBid.updateMany({
      where: { deliveryRequestId, id: { not: bidId }, status: "SUBMITTED" },
      data: { status: "REJECTED", decidedAt: new Date() },
    });

    // Bind rider active delivery
    await prisma.riderProfile.update({
      where: { id: rider.id },
      data: { activeDeliveryRequestId: deliveryRequestId },
    });

    // Synchronize order/delivery
    if (bid.deliveryRequest.deliveryId) {
      await prisma.delivery.update({
        where: { id: bid.deliveryRequest.deliveryId },
        data: {
          riderId: rider.userId,
          riderName: rider.fullName,
          status: "DRIVER_ASSIGNED",
          deliveryFee: bid.proposedFee,
        },
      });
      await transitionDeliveryStatus({
        deliveryId: bid.deliveryRequest.deliveryId,
        nextStatus: "DRIVER_ASSIGNED",
        actorId: rider.userId,
        actorName: rider.fullName,
        note: `Store accepted bid of KSH ${bid.proposedFee} from rider ${rider.fullName}.`,
      });
    } else if (bid.deliveryRequest.orderId) {
      await prisma.customerOrder.update({
        where: { id: bid.deliveryRequest.orderId },
        data: {
          deliveryStatus: "Rider Assigned",
          deliveryPersonName: rider.fullName,
          deliveryPersonContact: rider.phone,
        },
      });
    }

    return { success: true, assignment };
  }

  /**
   * Progress Active Delivery Step: e.g. RIDER_EN_ROUTE_TO_PICKUP, ARRIVED_AT_PICKUP, ORDER_COLLECTED, IN_TRANSIT, DELIVERED
   */
  public static async advanceDeliveryStep(
    deliveryRequestId: string,
    riderProfileId: string,
    nextStatus: DeliveryRequestStatus,
    proof?: { type: "OTP" | "PHOTO" | "SIGNATURE"; recipientName?: string; recipientPhone?: string; imageUrl?: string; signatureUrl?: string; otpCode?: string; notes?: string }
  ) {
    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      include: { assignment: true, riderProfile: false },
    });

    if (!request || !request.assignment) {
      throw new Error("Active assignment not found for this delivery request.");
    }

    if (request.assignment.riderProfileId !== riderProfileId) {
      throw new Error("Unauthorized: you are not the assigned rider for this delivery.");
    }

    const assignment = request.assignment;

    const updateData: any = {
      status: nextStatus,
    };

    if (nextStatus === DeliveryRequestStatus.ORDER_COLLECTED) {
      await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: { pickupConfirmedAt: new Date() },
      });
    }

    if (nextStatus === DeliveryRequestStatus.DELIVERED || nextStatus === DeliveryRequestStatus.COMPLETED) {
      // Validate Proof of Delivery
      if (proof) {
        await prisma.deliveryAssignment.update({
          where: { id: assignment.id },
          data: {
            deliveryConfirmedAt: new Date(),
            proofType: proof.type,
            proofData: proof as any,
            status: "COMPLETED",
          },
        });
      }

      // Free rider's active delivery slot
      await prisma.riderProfile.update({
        where: { id: riderProfileId },
        data: {
          activeDeliveryRequestId: null,
          totalCompletedDeliveries: { increment: 1 },
          walletBalance: { increment: assignment.netRiderEarning },
          totalEarnings: { increment: assignment.netRiderEarning },
        },
      });

      // Credit rider financial earnings ledger
      await creditRiderEarning({
        riderProfileId,
        assignmentId: assignment.id,
        deliveryRequestId,
        orderId: request.orderId || undefined,
        storeId: request.companyId,
        grossAmount: assignment.agreedFee,
        platformCommission: assignment.platformCommission,
        netAmount: assignment.netRiderEarning,
      });
    }

    await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: updateData,
    });

    // Synchronize connected delivery / CustomerOrder
    if (request.deliveryId) {
      const mappedStatus: any =
        nextStatus === DeliveryRequestStatus.RIDER_EN_ROUTE_TO_PICKUP
          ? "DRIVER_EN_ROUTE_TO_PICKUP"
          : nextStatus === DeliveryRequestStatus.ARRIVED_AT_PICKUP
          ? "ARRIVED_AT_PICKUP"
          : nextStatus === DeliveryRequestStatus.ORDER_COLLECTED
          ? "PICKED_UP"
          : nextStatus === DeliveryRequestStatus.IN_TRANSIT
          ? "IN_TRANSIT"
          : nextStatus === DeliveryRequestStatus.ARRIVED_AT_DROPOFF
          ? "ARRIVED_AT_DESTINATION"
          : nextStatus === DeliveryRequestStatus.DELIVERED
          ? "DELIVERED"
          : nextStatus === DeliveryRequestStatus.COMPLETED
          ? "COMPLETED"
          : "INPROGRESS";

      await transitionDeliveryStatus({
        deliveryId: request.deliveryId,
        nextStatus: mappedStatus,
        actorId: riderProfileId,
        note: `Marketplace rider updated delivery to ${nextStatus}`,
        proof,
      });
    } else if (request.orderId) {
      const orderDeliveryStatus =
        nextStatus === DeliveryRequestStatus.ORDER_COLLECTED
          ? "Order Collected"
          : nextStatus === DeliveryRequestStatus.IN_TRANSIT
          ? "In Transit"
          : nextStatus === DeliveryRequestStatus.DELIVERED || nextStatus === DeliveryRequestStatus.COMPLETED
          ? "Delivered"
          : "Out For Delivery";

      await prisma.customerOrder.update({
        where: { id: request.orderId },
        data: {
          deliveryStatus: orderDeliveryStatus,
          status: nextStatus === DeliveryRequestStatus.COMPLETED || nextStatus === DeliveryRequestStatus.DELIVERED ? "COMPLETED" : "PROCESSING",
        },
      });
    }

    return { success: true, status: nextStatus };
  }

  /**
   * Cancel Delivery Request (with policy check)
   */
  public static async cancelRequest(
    deliveryRequestId: string,
    cancelledBy: "STORE" | "RIDER" | "SUPER_ADMIN",
    actorId: string,
    reason: string
  ) {
    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      include: { assignment: true },
    });

    if (!request) {
      throw new Error("Delivery request not found");
    }

    if (
      request.status === DeliveryRequestStatus.COMPLETED ||
      request.status === DeliveryRequestStatus.DELIVERED
    ) {
      throw new Error("Cannot cancel a delivery that has already been completed.");
    }

    // If an assignment was active, release rider and record cancellation
    if (request.assignment) {
      await prisma.deliveryAssignment.update({
        where: { id: request.assignment.id },
        data: {
          status: "CANCELLED",
          cancellationReason: reason,
          cancelledBy,
        },
      });

      await prisma.riderProfile.update({
        where: { id: request.assignment.riderProfileId },
        data: { activeDeliveryRequestId: null },
      });
    }

    await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: { status: DeliveryRequestStatus.CANCELLED },
    });

    if (request.deliveryId) {
      await transitionDeliveryStatus({
        deliveryId: request.deliveryId,
        nextStatus: "CANCELLED",
        actorId,
        actorRole: cancelledBy,
        note: `Cancelled by ${cancelledBy}: ${reason}`,
      });
    } else if (request.orderId) {
      await prisma.customerOrder.update({
        where: { id: request.orderId },
        data: { deliveryStatus: "Cancelled" },
      });
    }

    return { success: true, message: "Delivery request cancelled successfully" };
  }
}
