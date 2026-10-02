/**
 * lib/dispatch/dispatchQueue.ts
 *
 * BullMQ Background Queue & Worker for Proximity Dispatch, Offer Expiry, and Radius Expansion.
 * Includes resilience safeguards: fallback to async immediate processing if Redis is unavailable.
 */

import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import prisma from "@/server/db/prismadb";
import { DispatchEngine } from "./dispatchEngine";
import { DeliveryRequestStatus } from "@prisma/client";

export const DISPATCH_QUEUE_NAME = "salesmanpro-rider-dispatch";

export interface DispatchJobData {
  deliveryRequestId: string;
  type: "INITIAL_DISPATCH" | "CHECK_EXPIRY_AND_EXPAND" | "RETRY_DISPATCH";
}

let dispatchQueue: Queue<DispatchJobData> | null = null;

export function getDispatchQueue(): Queue<DispatchJobData> | null {
  if (dispatchQueue) return dispatchQueue;
  try {
    dispatchQueue = new Queue<DispatchJobData>(DISPATCH_QUEUE_NAME, {
      connection: redisConnection,
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
  } catch (error) {
    console.warn("[DISPATCH_QUEUE] Redis queue initialization failed, falling back to direct execution:", error);
    return null;
  }
}

export async function enqueueDispatchJob(deliveryRequestId: string, delayMs = 0) {
  const q = getDispatchQueue();
  if (q) {
    try {
      await q.add(
        "dispatch-request",
        { deliveryRequestId, type: "INITIAL_DISPATCH" },
        { delay: delayMs }
      );
      return;
    } catch (err) {
      console.warn("[DISPATCH_QUEUE] Enqueue error, executing inline:", err);
    }
  }

  // Graceful fallback: Execute immediately asynchronously
  setTimeout(async () => {
    try {
      await DispatchEngine.dispatchToNearestRiders(deliveryRequestId);
    } catch (e) {
      console.error("[INLINE_DISPATCH_ERROR]", e);
    }
  }, Math.max(delayMs, 10));
}

/**
 * Worker processor function for dispatch jobs
 */
export async function processDispatchJob(job: Job<DispatchJobData>) {
  const { deliveryRequestId, type } = job.data;

  const request = await prisma.deliveryRequest.findUnique({
    where: { id: deliveryRequestId },
    include: { offers: true },
  });

  if (!request) return { success: false, reason: "Request not found" };

  // If already assigned or finished, skip
  if (
    request.status === DeliveryRequestStatus.ASSIGNED ||
    request.status === DeliveryRequestStatus.COMPLETED ||
    request.status === DeliveryRequestStatus.CANCELLED
  ) {
    return { success: true, reason: "Request already resolved" };
  }

  // Check if offers have expired and expand radius
  const now = new Date();
  const pendingOffers = request.offers.filter((o) => o.status === "PENDING");
  const expiredOffers = pendingOffers.filter((o) => o.expiresAt < now);

  if (expiredOffers.length > 0) {
    await prisma.deliveryOffer.updateMany({
      where: { id: { in: expiredOffers.map((o) => o.id) } },
      data: { status: "EXPIRED" },
    });
  }

  // If all offers expired and still unassigned, expand search
  const stillPendingOffers = await prisma.deliveryOffer.count({
    where: { deliveryRequestId, status: "PENDING", expiresAt: { gte: now } },
  });

  if (stillPendingOffers === 0) {
    await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: { status: DeliveryRequestStatus.SEARCHING_FOR_RIDER },
    });
    return await DispatchEngine.dispatchToNearestRiders(deliveryRequestId);
  }

  return { success: true, pendingOffers: stillPendingOffers };
}

export function createDispatchWorker() {
  return new Worker<DispatchJobData>(
    DISPATCH_QUEUE_NAME,
    async (job) => {
      return await processDispatchJob(job);
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );
}
