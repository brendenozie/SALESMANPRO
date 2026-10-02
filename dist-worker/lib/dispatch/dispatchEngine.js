"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchEngine = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const geofencing_1 = require("@/lib/geofencing");
const delivery_lifecycle_1 = require("@/lib/delivery-lifecycle");
const client_1 = require("@prisma/client");
const riderLedger_1 = require("@/lib/payments/riderLedger");
class DispatchEngine {
    /**
     * Creates a new delivery request from a store order and initiates proximity dispatch.
     */
    static async createDeliveryRequest(input) {
        // 1. Idempotency Check
        if (input.idempotencyKey) {
            const existing = await prismadb_1.default.deliveryRequest.findUnique({
                where: { idempotencyKey: input.idempotencyKey },
                include: { assignment: true, offers: true, bids: true },
            });
            if (existing) {
                return { request: existing, isDuplicate: true };
            }
        }
        // 2. Validate Store Delivery Configuration
        const storeConfig = await prismadb_1.default.storeDeliveryConfig.findUnique({
            where: { companyId: input.companyId },
        });
        const minFee = storeConfig?.minRiderFee ?? 50;
        const maxFee = storeConfig?.maxRiderFee ?? 10000;
        if (input.offeredRiderFee < minFee || input.offeredRiderFee > maxFee) {
            throw new Error(`Offered fee (${input.offeredRiderFee}) must be between KSH ${minFee} and KSH ${maxFee}.`);
        }
        const trackingNumber = `DEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        // Calculate platform transaction cost (default 4% or SuperAdmin-configured)
        const platformConfig = await prismadb_1.default.platformDeliveryConfig.findFirst();
        const feePercent = platformConfig?.transactionFeePercent ?? 4.0;
        const platformFee = input.platformFee ?? Math.round((input.offeredRiderFee * feePercent) / 100);
        // Escrow Deposit determination
        const paymentType = input.paymentType || "GHUBA_ESCROW";
        const isEscrow = paymentType === "GHUBA_ESCROW";
        const escrowStatus = isEscrow ? "DEPOSITED" : "NOT_APPLICABLE";
        const escrowAmount = isEscrow ? input.offeredRiderFee : 0.0;
        const escrowDepositedAt = isEscrow ? new Date() : null;
        // 3. Create Delivery Request Record in DB
        const request = await prismadb_1.default.deliveryRequest.create({
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
                paymentType,
                escrowStatus,
                escrowAmount,
                escrowDepositedAt,
                transactionFeePercent: feePercent,
                biddingEnabled: input.biddingEnabled ?? (storeConfig?.biddingAllowed ?? true),
                minBidFee: input.minBidFee || null,
                maxBidFee: input.maxBidFee || null,
                dispatchRadiusKm: input.dispatchRadiusKm ?? (storeConfig?.maxDeliveryRadiusKm ? Math.min(5.0, storeConfig.maxDeliveryRadiusKm) : 5.0),
                maxDispatchRadiusKm: input.maxDispatchRadiusKm ?? (storeConfig?.maxDeliveryRadiusKm ?? 25.0),
                status: client_1.DeliveryRequestStatus.SEARCHING_FOR_RIDER,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                pickupDeadline: input.pickupDeadline || null,
                idempotencyKey: input.idempotencyKey || null,
            },
        });
        // 4. Update linked order status if orderId provided
        if (input.orderId) {
            await prismadb_1.default.customerOrder.update({
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
    static async findEligibleNearbyRiders(pickupLat, pickupLng, radiusKm, vehicleTypeRequired = "ANY", excludeRiderIds = []) {
        // 15-minute location freshness window
        const freshnessCutoff = new Date(Date.now() - 15 * 60 * 1000);
        // Approximate bounding box (1 deg latitude ~ 111km, 1 deg longitude ~ 111km * cos(lat))
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos((pickupLat * Math.PI) / 180));
        const riders = await prismadb_1.default.riderProfile.findMany({
            where: {
                verificationStatus: client_1.RiderVerificationStatus.APPROVED,
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
        const candidates = [];
        for (const r of riders) {
            if (r.currentLat === null || r.currentLng === null)
                continue;
            // Check active assignment limit: max 1 active delivery per rider to prevent overload
            if (r.activeDeliveryRequestId) {
                continue;
            }
            // Check vehicle compatibility
            if (vehicleTypeRequired !== "ANY") {
                const matchesRiderType = r.riderType.toUpperCase() === vehicleTypeRequired.toUpperCase();
                const matchesVehicle = r.vehicles.some((v) => v.vehicleType.toUpperCase() === vehicleTypeRequired.toUpperCase());
                if (!matchesRiderType && !matchesVehicle) {
                    continue;
                }
            }
            // Precise Haversine distance in meters -> km
            const distanceMeters = (0, geofencing_1.calculateDistance)(pickupLat, pickupLng, r.currentLat, r.currentLng);
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
    static async dispatchToNearestRiders(deliveryRequestId) {
        const request = await prismadb_1.default.deliveryRequest.findUnique({
            where: { id: deliveryRequestId },
            include: {
                offers: true,
            },
        });
        if (!request || request.status !== client_1.DeliveryRequestStatus.SEARCHING_FOR_RIDER) {
            return { success: false, message: "Request is not open for dispatch" };
        }
        const previousOfferedRiderIds = request.offers.map((o) => o.riderProfileId);
        const candidates = await this.findEligibleNearbyRiders(request.pickupLat, request.pickupLng, request.dispatchRadiusKm, request.vehicleTypeRequired || "ANY", previousOfferedRiderIds);
        if (candidates.length === 0) {
            // Auto-radius expansion if still under max radius
            if (request.dispatchRadiusKm < request.maxDispatchRadiusKm) {
                const nextRadius = Math.min(request.dispatchRadiusKm + 5.0, request.maxDispatchRadiusKm);
                await prismadb_1.default.deliveryRequest.update({
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
        await prismadb_1.default.$transaction(topCandidates.map((c) => prismadb_1.default.deliveryOffer.create({
            data: {
                deliveryRequestId,
                riderProfileId: c.riderProfileId,
                status: "PENDING",
                expiresAt: offerExpiryTime,
                riderDistanceKm: c.distanceKm,
            },
        })));
        await prismadb_1.default.deliveryRequest.update({
            where: { id: deliveryRequestId },
            data: { status: client_1.DeliveryRequestStatus.OFFERED },
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
    static async acceptDeliveryOffer(deliveryRequestId, riderProfileId) {
        const rider = await prismadb_1.default.riderProfile.findUnique({
            where: { id: riderProfileId },
        });
        if (!rider) {
            throw new Error("Rider profile not found");
        }
        if (rider.verificationStatus !== client_1.RiderVerificationStatus.APPROVED) {
            throw new Error("Rider account is not verified and approved.");
        }
        if (rider.activeDeliveryRequestId) {
            throw new Error("You already have an active assigned delivery.");
        }
        // Atomic conditional check and update: only succeed if request is in SEARCHING_FOR_RIDER or OFFERED
        // This prevents two riders from claiming the same assignment concurrently.
        const result = await prismadb_1.default.deliveryRequest.updateMany({
            where: {
                id: deliveryRequestId,
                status: { in: [client_1.DeliveryRequestStatus.SEARCHING_FOR_RIDER, client_1.DeliveryRequestStatus.OFFERED, client_1.DeliveryRequestStatus.BIDDING] },
            },
            data: {
                status: client_1.DeliveryRequestStatus.ASSIGNED,
                assignedRiderProfileId: riderProfileId,
            },
        });
        if (result.count === 0) {
            throw new Error("Delivery request is no longer available. It was already assigned or cancelled.");
        }
        // Retrieve fresh request with updated state
        const request = await prismadb_1.default.deliveryRequest.findUnique({
            where: { id: deliveryRequestId },
        });
        if (!request) {
            throw new Error("Delivery request not found");
        }
        const agreedFee = request.offeredRiderFee;
        const feePercent = request.transactionFeePercent ?? 4.0;
        const platformCommission = request.platformFee ?? Math.round((agreedFee * feePercent) / 100);
        const netRiderEarning = agreedFee - platformCommission;
        // Create assignment and update rider active status
        const assignment = await prismadb_1.default.deliveryAssignment.create({
            data: {
                deliveryRequestId,
                deliveryId: request.deliveryId || null,
                riderProfileId,
                agreedFee,
                platformCommission,
                netRiderEarning,
                paymentType: request.paymentType,
                escrowStatus: request.escrowStatus,
                escrowAmount: request.escrowAmount,
                status: "ACTIVE",
            },
        });
        // Bind rider active delivery
        await prismadb_1.default.riderProfile.update({
            where: { id: riderProfileId },
            data: { activeDeliveryRequestId: deliveryRequestId },
        });
        // Mark rider offer as ACCEPTED and other pending offers as EXPIRED
        await prismadb_1.default.deliveryOffer.updateMany({
            where: { deliveryRequestId, riderProfileId },
            data: { status: "ACCEPTED", respondedAt: new Date() },
        });
        await prismadb_1.default.deliveryOffer.updateMany({
            where: { deliveryRequestId, riderProfileId: { not: riderProfileId }, status: "PENDING" },
            data: { status: "EXPIRED" },
        });
        // Sync with existing Delivery & CustomerOrder records
        if (request.deliveryId) {
            await prismadb_1.default.delivery.update({
                where: { id: request.deliveryId },
                data: {
                    riderId: rider.userId,
                    riderName: rider.fullName,
                    status: "DRIVER_ASSIGNED",
                },
            });
            await (0, delivery_lifecycle_1.transitionDeliveryStatus)({
                deliveryId: request.deliveryId,
                nextStatus: "DRIVER_ASSIGNED",
                actorId: rider.userId,
                actorName: rider.fullName,
                note: `Marketplace rider ${rider.fullName} accepted assignment.`,
            });
        }
        else if (request.orderId) {
            await prismadb_1.default.customerOrder.update({
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
    static async submitBid(deliveryRequestId, riderProfileId, proposedFee, estimatedPickupMinutes, note) {
        const request = await prismadb_1.default.deliveryRequest.findUnique({
            where: { id: deliveryRequestId },
        });
        if (!request) {
            throw new Error("Delivery request not found");
        }
        if (!request.biddingEnabled) {
            throw new Error("Bidding is not enabled for this delivery request.");
        }
        if (request.status !== client_1.DeliveryRequestStatus.SEARCHING_FOR_RIDER &&
            request.status !== client_1.DeliveryRequestStatus.OFFERED &&
            request.status !== client_1.DeliveryRequestStatus.BIDDING) {
            throw new Error("Bidding is closed for this request.");
        }
        if (request.minBidFee && proposedFee < request.minBidFee) {
            throw new Error(`Proposed fee cannot be lower than KSH ${request.minBidFee}`);
        }
        if (request.maxBidFee && proposedFee > request.maxBidFee) {
            throw new Error(`Proposed fee cannot exceed KSH ${request.maxBidFee}`);
        }
        const rider = await prismadb_1.default.riderProfile.findUnique({
            where: { id: riderProfileId },
        });
        if (!rider || rider.verificationStatus !== client_1.RiderVerificationStatus.APPROVED) {
            throw new Error("Only verified riders can submit bids.");
        }
        // Check if rider already submitted an active bid
        const existingBid = await prismadb_1.default.deliveryBid.findFirst({
            where: { deliveryRequestId, riderProfileId, status: "SUBMITTED" },
        });
        let bid;
        if (existingBid) {
            bid = await prismadb_1.default.deliveryBid.update({
                where: { id: existingBid.id },
                data: {
                    proposedFee,
                    estimatedPickupMinutes: estimatedPickupMinutes || existingBid.estimatedPickupMinutes,
                    note: note || existingBid.note,
                    submittedAt: new Date(),
                },
            });
        }
        else {
            bid = await prismadb_1.default.deliveryBid.create({
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
        if (request.status !== client_1.DeliveryRequestStatus.BIDDING) {
            await prismadb_1.default.deliveryRequest.update({
                where: { id: deliveryRequestId },
                data: { status: client_1.DeliveryRequestStatus.BIDDING },
            });
        }
        return { success: true, bid };
    }
    /**
     * Store Acceptance of a Rider's Bid: Atomically claims assignment and rejects other bids.
     */
    static async acceptBid(deliveryRequestId, bidId, companyId) {
        const bid = await prismadb_1.default.deliveryBid.findUnique({
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
        if (rider.verificationStatus !== client_1.RiderVerificationStatus.APPROVED) {
            throw new Error("Rider is not verified.");
        }
        if (rider.activeDeliveryRequestId) {
            throw new Error("Rider currently has another active delivery.");
        }
        const platformConfig = await prismadb_1.default.platformDeliveryConfig.findFirst();
        const feePercent = platformConfig?.transactionFeePercent ?? 4.0;
        const platformCommission = Math.round((bid.proposedFee * feePercent) / 100);
        const netRiderEarning = bid.proposedFee - platformCommission;
        const paymentType = bid.deliveryRequest.paymentType || "GHUBA_ESCROW";
        const isEscrow = paymentType === "GHUBA_ESCROW";
        const escrowAmount = isEscrow ? bid.proposedFee : 0.0;
        const escrowStatus = isEscrow ? "DEPOSITED" : "NOT_APPLICABLE";
        // Atomic conditional update
        const result = await prismadb_1.default.deliveryRequest.updateMany({
            where: {
                id: deliveryRequestId,
                companyId,
                status: { in: [client_1.DeliveryRequestStatus.SEARCHING_FOR_RIDER, client_1.DeliveryRequestStatus.OFFERED, client_1.DeliveryRequestStatus.BIDDING] },
            },
            data: {
                status: client_1.DeliveryRequestStatus.ASSIGNED,
                assignedRiderProfileId: rider.id,
                finalAgreedFee: bid.proposedFee,
                platformFee: platformCommission,
                escrowAmount,
                escrowStatus,
                escrowDepositedAt: isEscrow ? new Date() : null,
            },
        });
        if (result.count === 0) {
            throw new Error("Request already assigned or closed.");
        }
        const assignment = await prismadb_1.default.deliveryAssignment.create({
            data: {
                deliveryRequestId,
                deliveryId: bid.deliveryRequest.deliveryId || null,
                riderProfileId: rider.id,
                agreedFee: bid.proposedFee,
                platformCommission,
                netRiderEarning,
                paymentType,
                escrowStatus,
                escrowAmount,
                status: "ACTIVE",
            },
        });
        // Mark accepted bid and reject other bids
        await prismadb_1.default.deliveryBid.update({
            where: { id: bidId },
            data: { status: "ACCEPTED", decidedAt: new Date() },
        });
        await prismadb_1.default.deliveryBid.updateMany({
            where: { deliveryRequestId, id: { not: bidId }, status: "SUBMITTED" },
            data: { status: "REJECTED", decidedAt: new Date() },
        });
        // Bind rider active delivery
        await prismadb_1.default.riderProfile.update({
            where: { id: rider.id },
            data: { activeDeliveryRequestId: deliveryRequestId },
        });
        // Synchronize order/delivery
        if (bid.deliveryRequest.deliveryId) {
            await prismadb_1.default.delivery.update({
                where: { id: bid.deliveryRequest.deliveryId },
                data: {
                    riderId: rider.userId,
                    riderName: rider.fullName,
                    status: "DRIVER_ASSIGNED",
                    deliveryFee: bid.proposedFee,
                },
            });
            await (0, delivery_lifecycle_1.transitionDeliveryStatus)({
                deliveryId: bid.deliveryRequest.deliveryId,
                nextStatus: "DRIVER_ASSIGNED",
                actorId: rider.userId,
                actorName: rider.fullName,
                note: `Store accepted bid of KSH ${bid.proposedFee} from rider ${rider.fullName}.`,
            });
        }
        else if (bid.deliveryRequest.orderId) {
            await prismadb_1.default.customerOrder.update({
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
    static async advanceDeliveryStep(deliveryRequestId, riderProfileId, nextStatus, proof) {
        const request = await prismadb_1.default.deliveryRequest.findUnique({
            where: { id: deliveryRequestId },
            include: { assignment: true },
        });
        if (!request || !request.assignment) {
            throw new Error("Active assignment not found for this delivery request.");
        }
        if (request.assignment.riderProfileId !== riderProfileId) {
            throw new Error("Unauthorized: you are not the assigned rider for this delivery.");
        }
        const assignment = request.assignment;
        const updateData = {
            status: nextStatus,
        };
        if (nextStatus === client_1.DeliveryRequestStatus.ORDER_COLLECTED) {
            await prismadb_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: { pickupConfirmedAt: new Date() },
            });
        }
        if (nextStatus === client_1.DeliveryRequestStatus.DELIVERED || nextStatus === client_1.DeliveryRequestStatus.COMPLETED) {
            // Validate Proof of Delivery
            if (proof) {
                await prismadb_1.default.deliveryAssignment.update({
                    where: { id: assignment.id },
                    data: {
                        deliveryConfirmedAt: new Date(),
                        proofType: proof.type,
                        proofData: proof,
                        status: "COMPLETED",
                    },
                });
            }
            // Free rider's active delivery slot and update trip stats
            await prismadb_1.default.riderProfile.update({
                where: { id: riderProfileId },
                data: {
                    activeDeliveryRequestId: null,
                    totalCompletedDeliveries: { increment: 1 },
                },
            });
            // Credit rider financial earnings ledger & release escrow
            await (0, riderLedger_1.creditRiderEarning)({
                riderProfileId,
                assignmentId: assignment.id,
                deliveryRequestId,
                orderId: request.orderId || undefined,
                storeId: request.companyId,
                grossAmount: assignment.agreedFee,
                platformCommission: assignment.platformCommission,
                netAmount: assignment.netRiderEarning,
                paymentType: assignment.paymentType,
            });
        }
        await prismadb_1.default.deliveryRequest.update({
            where: { id: deliveryRequestId },
            data: updateData,
        });
        // Synchronize connected delivery / CustomerOrder
        if (request.deliveryId) {
            const mappedStatus = nextStatus === client_1.DeliveryRequestStatus.RIDER_EN_ROUTE_TO_PICKUP
                ? "DRIVER_EN_ROUTE_TO_PICKUP"
                : nextStatus === client_1.DeliveryRequestStatus.ARRIVED_AT_PICKUP
                    ? "ARRIVED_AT_PICKUP"
                    : nextStatus === client_1.DeliveryRequestStatus.ORDER_COLLECTED
                        ? "PICKED_UP"
                        : nextStatus === client_1.DeliveryRequestStatus.IN_TRANSIT
                            ? "IN_TRANSIT"
                            : nextStatus === client_1.DeliveryRequestStatus.ARRIVED_AT_DROPOFF
                                ? "ARRIVED_AT_DESTINATION"
                                : nextStatus === client_1.DeliveryRequestStatus.DELIVERED
                                    ? "DELIVERED"
                                    : nextStatus === client_1.DeliveryRequestStatus.COMPLETED
                                        ? "COMPLETED"
                                        : "INPROGRESS";
            await (0, delivery_lifecycle_1.transitionDeliveryStatus)({
                deliveryId: request.deliveryId,
                nextStatus: mappedStatus,
                actorId: riderProfileId,
                note: `Marketplace rider updated delivery to ${nextStatus}`,
                proof,
            });
        }
        else if (request.orderId) {
            const orderDeliveryStatus = nextStatus === client_1.DeliveryRequestStatus.ORDER_COLLECTED
                ? "Order Collected"
                : nextStatus === client_1.DeliveryRequestStatus.IN_TRANSIT
                    ? "In Transit"
                    : nextStatus === client_1.DeliveryRequestStatus.DELIVERED || nextStatus === client_1.DeliveryRequestStatus.COMPLETED
                        ? "Delivered"
                        : "Out For Delivery";
            await prismadb_1.default.customerOrder.update({
                where: { id: request.orderId },
                data: {
                    deliveryStatus: orderDeliveryStatus,
                    status: nextStatus === client_1.DeliveryRequestStatus.COMPLETED || nextStatus === client_1.DeliveryRequestStatus.DELIVERED ? "COMPLETED" : "PROCESSING",
                },
            });
        }
        return { success: true, status: nextStatus };
    }
    /**
     * Cancel Delivery Request (with policy check)
     */
    static async cancelRequest(deliveryRequestId, cancelledBy, actorId, reason) {
        const request = await prismadb_1.default.deliveryRequest.findUnique({
            where: { id: deliveryRequestId },
            include: { assignment: true },
        });
        if (!request) {
            throw new Error("Delivery request not found");
        }
        if (request.status === client_1.DeliveryRequestStatus.COMPLETED ||
            request.status === client_1.DeliveryRequestStatus.DELIVERED) {
            throw new Error("Cannot cancel a delivery that has already been completed.");
        }
        // If an assignment was active, release rider and record cancellation
        if (request.assignment) {
            await prismadb_1.default.deliveryAssignment.update({
                where: { id: request.assignment.id },
                data: {
                    status: "CANCELLED",
                    cancellationReason: reason,
                    cancelledBy,
                },
            });
            await prismadb_1.default.riderProfile.update({
                where: { id: request.assignment.riderProfileId },
                data: { activeDeliveryRequestId: null },
            });
        }
        await prismadb_1.default.deliveryRequest.update({
            where: { id: deliveryRequestId },
            data: { status: client_1.DeliveryRequestStatus.CANCELLED },
        });
        if (request.deliveryId) {
            await (0, delivery_lifecycle_1.transitionDeliveryStatus)({
                deliveryId: request.deliveryId,
                nextStatus: "CANCELLED",
                actorId,
                actorRole: cancelledBy,
                note: `Cancelled by ${cancelledBy}: ${reason}`,
            });
        }
        else if (request.orderId) {
            await prismadb_1.default.customerOrder.update({
                where: { id: request.orderId },
                data: { deliveryStatus: "Cancelled" },
            });
        }
        return { success: true, message: "Delivery request cancelled successfully" };
    }
}
exports.DispatchEngine = DispatchEngine;
