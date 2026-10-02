"use strict";
/**
 * lib/dispatch/dispatchQueue.ts
 *
 * BullMQ Background Queue & Worker for Proximity Dispatch, Offer Expiry, and Radius Expansion.
 * Includes resilience safeguards: fallback to async immediate processing if Redis is unavailable.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDispatchWorker = exports.processDispatchJob = exports.enqueueDispatchJob = exports.getDispatchQueue = exports.DISPATCH_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const dispatchEngine_1 = require("./dispatchEngine");
const client_1 = require("@prisma/client");
exports.DISPATCH_QUEUE_NAME = "salesmanpro-rider-dispatch";
let dispatchQueue = null;
function getDispatchQueue() {
    if (dispatchQueue)
        return dispatchQueue;
    try {
        dispatchQueue = new bullmq_1.Queue(exports.DISPATCH_QUEUE_NAME, {
            connection: redis_1.redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
                removeOnComplete: 100,
                removeOnFail: 200,
            },
        });
        return dispatchQueue;
    }
    catch (error) {
        console.warn("[DISPATCH_QUEUE] Redis queue initialization failed, falling back to direct execution:", error);
        return null;
    }
}
exports.getDispatchQueue = getDispatchQueue;
async function enqueueDispatchJob(deliveryRequestId, delayMs = 0) {
    const q = getDispatchQueue();
    if (q) {
        try {
            await q.add("dispatch-request", { deliveryRequestId, type: "INITIAL_DISPATCH" }, { delay: delayMs });
            return;
        }
        catch (err) {
            console.warn("[DISPATCH_QUEUE] Enqueue error, executing inline:", err);
        }
    }
    // Graceful fallback: Execute immediately asynchronously
    setTimeout(async () => {
        try {
            await dispatchEngine_1.DispatchEngine.dispatchToNearestRiders(deliveryRequestId);
        }
        catch (e) {
            console.error("[INLINE_DISPATCH_ERROR]", e);
        }
    }, Math.max(delayMs, 10));
}
exports.enqueueDispatchJob = enqueueDispatchJob;
/**
 * Worker processor function for dispatch jobs
 */
async function processDispatchJob(job) {
    const { deliveryRequestId, type } = job.data;
    const request = await prismadb_1.default.deliveryRequest.findUnique({
        where: { id: deliveryRequestId },
        include: { offers: true },
    });
    if (!request)
        return { success: false, reason: "Request not found" };
    // If already assigned or finished, skip
    if (request.status === client_1.DeliveryRequestStatus.ASSIGNED ||
        request.status === client_1.DeliveryRequestStatus.COMPLETED ||
        request.status === client_1.DeliveryRequestStatus.CANCELLED) {
        return { success: true, reason: "Request already resolved" };
    }
    // Check if offers have expired and expand radius
    const now = new Date();
    const pendingOffers = request.offers.filter((o) => o.status === "PENDING");
    const expiredOffers = pendingOffers.filter((o) => o.expiresAt < now);
    if (expiredOffers.length > 0) {
        await prismadb_1.default.deliveryOffer.updateMany({
            where: { id: { in: expiredOffers.map((o) => o.id) } },
            data: { status: "EXPIRED" },
        });
    }
    // If all offers expired and still unassigned, expand search
    const stillPendingOffers = await prismadb_1.default.deliveryOffer.count({
        where: { deliveryRequestId, status: "PENDING", expiresAt: { gte: now } },
    });
    if (stillPendingOffers === 0) {
        await prismadb_1.default.deliveryRequest.update({
            where: { id: deliveryRequestId },
            data: { status: client_1.DeliveryRequestStatus.SEARCHING_FOR_RIDER },
        });
        return await dispatchEngine_1.DispatchEngine.dispatchToNearestRiders(deliveryRequestId);
    }
    return { success: true, pendingOffers: stillPendingOffers };
}
exports.processDispatchJob = processDispatchJob;
function createDispatchWorker() {
    return new bullmq_1.Worker(exports.DISPATCH_QUEUE_NAME, async (job) => {
        return await processDispatchJob(job);
    }, {
        connection: redis_1.redisConnection,
        concurrency: 5,
    });
}
exports.createDispatchWorker = createDispatchWorker;
