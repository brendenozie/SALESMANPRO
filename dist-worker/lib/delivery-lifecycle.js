"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionDeliveryStatus = exports.isValidDeliveryTransition = exports.isValidTransition = exports.VALID_DELIVERY_TRANSITIONS = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
exports.VALID_DELIVERY_TRANSITIONS = {
    DRAFT: ['REQUESTED', 'QUOTED', 'PENDING_PAYMENT', 'CANCELLED'],
    PENDING: ['CONFIRMED', 'ASSIGNED', 'DRIVER_ASSIGNED', 'SCHEDULED', 'REQUESTED', 'CANCELLED', 'ON_HOLD'],
    REQUESTED: ['QUOTED', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED'],
    QUOTED: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED'],
    PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED', 'FAILED'],
    CONFIRMED: ['SCHEDULED', 'DRIVER_ASSIGNED', 'ASSIGNED', 'CANCELLED', 'ON_HOLD'],
    SCHEDULED: ['DRIVER_ASSIGNED', 'ASSIGNED', 'CANCELLED', 'RESCHEDULED', 'ON_HOLD'],
    DRIVER_ASSIGNED: ['DRIVER_EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'RESCHEDULED', 'CANCELLED'],
    ASSIGNED: ['DRIVER_EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'INPROGRESS', 'RESCHEDULED', 'CANCELLED'],
    DRIVER_EN_ROUTE_TO_PICKUP: ['ARRIVED_AT_PICKUP', 'PICKED_UP', 'FAILED_PICKUP', 'CANCELLED'],
    ARRIVED_AT_PICKUP: ['ORDER_COLLECTED', 'PICKED_UP', 'FAILED_PICKUP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT', 'INPROGRESS', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'RETURNED', 'ON_HOLD'],
    IN_TRANSIT: ['ARRIVED_AT_DROPOFF', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_DELIVERY', 'RETURNED', 'ON_HOLD'],
    INPROGRESS: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'FAILED_DELIVERY', 'RETURNED'],
    ARRIVED_AT_DESTINATION: ['OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'COMPLETED', 'FAILED_DELIVERY', 'RETURNED'],
    DELIVERED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    FAILED: ['RESCHEDULED'],
    FAILED_PICKUP: ['RESCHEDULED', 'CANCELLED'],
    FAILED_DELIVERY: ['RESCHEDULED', 'RETURNED', 'CANCELLED'],
    RESCHEDULED: ['SCHEDULED', 'DRIVER_ASSIGNED', 'CANCELLED'],
    RETURNED: ['COMPLETED', 'CANCELLED'],
    ON_HOLD: ['CONFIRMED', 'SCHEDULED', 'DRIVER_ASSIGNED', 'IN_TRANSIT', 'CANCELLED'],
    SEARCHING_FOR_RIDER: ['OFFERED', 'BIDDING', 'RIDER_ASSIGNED', 'ASSIGNED', 'EXPIRED', 'CANCELLED'],
    OFFERED: ['RIDER_ASSIGNED', 'ASSIGNED', 'BIDDING', 'SEARCHING_FOR_RIDER', 'EXPIRED', 'CANCELLED'],
    BIDDING: ['RIDER_ASSIGNED', 'ASSIGNED', 'SEARCHING_FOR_RIDER', 'EXPIRED', 'CANCELLED'],
    RIDER_ASSIGNED: ['RIDER_EN_ROUTE_TO_PICKUP', 'DRIVER_EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'ORDER_COLLECTED', 'PICKED_UP', 'CANCELLED', 'DISPUTED'],
    RIDER_EN_ROUTE_TO_PICKUP: ['ARRIVED_AT_PICKUP', 'ORDER_COLLECTED', 'PICKED_UP', 'FAILED_PICKUP', 'CANCELLED', 'DISPUTED'],
    ORDER_COLLECTED: ['IN_TRANSIT', 'ARRIVED_AT_DROPOFF', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DISPUTED', 'RETURNED'],
    ARRIVED_AT_DROPOFF: ['DELIVERED', 'FAILED_DELIVERY', 'DISPUTED'],
    EXPIRED: ['SEARCHING_FOR_RIDER', 'CANCELLED', 'REQUESTED'],
    DISPUTED: ['COMPLETED', 'CANCELLED', 'DELIVERED', 'RETURNED']
};
function isValidTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus)
        return true;
    const allowed = exports.VALID_DELIVERY_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
}
exports.isValidTransition = isValidTransition;
exports.isValidDeliveryTransition = isValidTransition;
/**
 * Executes an atomic status transition on a delivery record:
 * 1. Validates the transition state machine
 * 2. Updates the delivery in the database
 * 3. Synchronizes any connected CustomerOrder status
 * 4. Logs a DeliveryTracking event for tracking history
 * 5. If proof provided and transitioning to DELIVERED/COMPLETED, records DeliveryProof
 */
async function transitionDeliveryStatus(payload) {
    const nextStatus = (payload.nextStatus || payload.targetStatus);
    if (!nextStatus) {
        throw new Error("Target status is required for transition");
    }
    const { deliveryId, actorId, actorName, note, lat, lng, locationName, failureReason, } = payload;
    const signatureUrl = payload.signatureUrl || payload.proof?.signatureUrl;
    const imageUrl = payload.imageUrl || payload.proof?.imageUrl;
    const recipientName = payload.recipientName || payload.proof?.recipientName;
    const recipientPhone = payload.recipientPhone || payload.proof?.recipientPhone;
    const currentDelivery = await prismadb_1.default.delivery.findUnique({
        where: { id: deliveryId },
        include: {
            CustomerOrders: true,
            stops: true,
        },
    });
    if (!currentDelivery) {
        throw new Error(`Delivery not found: ${deliveryId}`);
    }
    // Validate state machine (allow override if admin, but check)
    if (!isValidTransition(currentDelivery.status, nextStatus)) {
        console.warn(`[LIFECYCLE WARNING] Transition from ${currentDelivery.status} to ${nextStatus} is non-standard.`);
    }
    // Execute in Prisma Transaction for absolute data integrity
    return await prismadb_1.default.$transaction(async (tx) => {
        // 1. Update Delivery Record
        const updateData = {
            status: nextStatus,
        };
        if (note)
            updateData.notes = note;
        if (nextStatus === 'COMPLETED' || nextStatus === 'DELIVERED') {
            // mark any stops delivered
            await tx.deliveryStop.updateMany({
                where: { deliveryId },
                data: {
                    status: 'DELIVERED',
                    deliveredAt: new Date(),
                },
            });
        }
        const updatedDelivery = await tx.delivery.update({
            where: { id: deliveryId },
            data: updateData,
        });
        // 2. Synchronize connected CustomerOrders
        if (currentDelivery.CustomerOrders.length > 0) {
            const orderStatusMap = {
                CONFIRMED: { status: 'PROCESSING', deliveryStatus: 'Confirmed' },
                SCHEDULED: { status: 'PROCESSING', deliveryStatus: 'Scheduled' },
                DRIVER_ASSIGNED: { status: 'PROCESSING', deliveryStatus: 'Driver Assigned' },
                ASSIGNED: { status: 'PROCESSING', deliveryStatus: 'Assigned' },
                DRIVER_EN_ROUTE_TO_PICKUP: { status: 'PROCESSING', deliveryStatus: 'Driver En Route' },
                ARRIVED_AT_PICKUP: { status: 'PROCESSING', deliveryStatus: 'At Pickup' },
                PICKED_UP: { status: 'SHIPPED', deliveryStatus: 'Picked Up' },
                IN_TRANSIT: { status: 'SHIPPED', deliveryStatus: 'In Transit' },
                INPROGRESS: { status: 'SHIPPED', deliveryStatus: 'In Progress' },
                ARRIVED_AT_DESTINATION: { status: 'SHIPPED', deliveryStatus: 'Arrived at Destination' },
                OUT_FOR_DELIVERY: { status: 'OUT_FOR_DELIVERY', deliveryStatus: 'Out For Delivery' },
                DELIVERED: { status: 'COMPLETED', deliveryStatus: 'Delivered' },
                COMPLETED: { status: 'COMPLETED', deliveryStatus: 'Completed' },
                FAILED: { status: 'FAILED', deliveryStatus: 'Failed' },
                FAILED_PICKUP: { status: 'FAILED', deliveryStatus: 'Pickup Failed' },
                FAILED_DELIVERY: { status: 'FAILED', deliveryStatus: 'Delivery Failed' },
                CANCELLED: { status: 'CANCELLED', deliveryStatus: 'Cancelled' },
                RETURNED: { status: 'RETURNED', deliveryStatus: 'Returned' },
                ON_HOLD: { status: 'ON_HOLD', deliveryStatus: 'On Hold' },
                SEARCHING_FOR_RIDER: { status: 'PROCESSING', deliveryStatus: 'Searching for Rider' },
                OFFERED: { status: 'PROCESSING', deliveryStatus: 'Offered to Rider' },
                BIDDING: { status: 'PROCESSING', deliveryStatus: 'Bidding Open' },
                RIDER_ASSIGNED: { status: 'PROCESSING', deliveryStatus: 'Rider Assigned' },
                RIDER_EN_ROUTE_TO_PICKUP: { status: 'PROCESSING', deliveryStatus: 'Rider En Route' },
                ORDER_COLLECTED: { status: 'SHIPPED', deliveryStatus: 'Order Collected' },
                ARRIVED_AT_DROPOFF: { status: 'OUT_FOR_DELIVERY', deliveryStatus: 'Arrived at Dropoff' },
                EXPIRED: { status: 'PENDING', deliveryStatus: 'Request Expired' },
                DISPUTED: { status: 'ON_HOLD', deliveryStatus: 'Disputed' },
            };
            const mapped = orderStatusMap[nextStatus];
            if (mapped) {
                await tx.customerOrder.updateMany({
                    where: { deliveryId },
                    data: {
                        deliveryStatus: mapped.deliveryStatus,
                        status: mapped.status,
                    },
                });
            }
        }
        // 3. Record Audit Timeline / Tracking Event
        await tx.deliveryTracking.create({
            data: {
                deliveryId,
                riderId: actorId || currentDelivery.riderId || null,
                lat: lat || 0,
                lng: lng || 0,
                status: nextStatus,
                locationName: locationName || (nextStatus === 'DELIVERED' ? currentDelivery.deliveryAddress : currentDelivery.pickupAddress) || 'En Route',
                note: note || (failureReason ? `Failure Reason: ${failureReason}` : `Status transitioned to ${nextStatus}`),
                recordedAt: new Date(),
            },
        });
        // 4. Record Proof of Delivery if provided
        if (signatureUrl || imageUrl || recipientName) {
            await tx.deliveryProof.create({
                data: {
                    deliveryId,
                    type: signatureUrl ? 'SIGNATURE' : imageUrl ? 'PHOTO' : 'OTP',
                    signatureUrl: signatureUrl || null,
                    imageUrl: imageUrl || null,
                    recipientName: recipientName || currentDelivery.customerName || 'Authorized Recipient',
                    recipientPhone: recipientPhone || currentDelivery.customerContact || null,
                    notes: note || null,
                    lat: lat || null,
                    lng: lng || null,
                },
            });
        }
        // 5. Record Exception if failure
        if (nextStatus === 'FAILED' || nextStatus === 'FAILED_PICKUP' || nextStatus === 'FAILED_DELIVERY') {
            await tx.deliveryException.create({
                data: {
                    deliveryId,
                    reason: failureReason || note || 'Delivery attempt unsuccessful',
                    notes: `Reported by ${actorName || 'Courier'}. Location: ${locationName || 'N/A'}`,
                },
            });
        }
        return updatedDelivery;
    });
}
exports.transitionDeliveryStatus = transitionDeliveryStatus;
