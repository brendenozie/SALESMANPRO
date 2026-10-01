/**
 * lib/ai/mascot/mascotQueue.ts
 *
 * BullMQ Queue definitions and background job submission for the SalesmanPro Mascot.
 * Handles job queuing, exponential retry policies, Redis connection lifecycle,
 * and reliable asynchronous execution across server restarts.
 */

import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { MascotTaskRecord } from "./taskTypes";
import { MascotTaskOrchestrator } from "./taskOrchestrator";

export const MASCOT_TASK_QUEUE_NAME = "salesmanpro-mascot-tasks";

export interface MascotJobData {
  taskId: string;
  companyId: string;
}

let _mascotQueue: Queue<MascotJobData> | null = null;

export function getMascotQueue(): Queue<MascotJobData> {
  if (!_mascotQueue) {
    _mascotQueue = new Queue<MascotJobData>(MASCOT_TASK_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }
  return _mascotQueue;
}

/**
 * Enqueues a validated Mascot task into the BullMQ background queue.
 * Includes graceful asynchronous runner fallback if Redis is unavailable.
 */
export async function enqueueMascotJob(task: MascotTaskRecord): Promise<{ queued: boolean; jobId: string }> {
  const jobId = `mascot_${task.id}`;

  try {
    const queue = getMascotQueue();
    const job = await queue.add(
      `task_${task.taskType}_${task.id}`,
      { taskId: task.id, companyId: task.companyId },
      {
        jobId,
        priority: task.priority,
      }
    );

    console.log(`[MascotQueue] Enqueued job ${job.id} for task #${task.id}`);
    return { queued: true, jobId: job.id || jobId };
  } catch (err: any) {
    console.warn(`[MascotQueue] Redis queue enqueue failed (${err?.message}). Running via asynchronous execution runner.`);
    // Fallback: Asynchronous execution without blocking HTTP response
    setImmediate(async () => {
      try {
        await MascotTaskOrchestrator.executeTask(task);
      } catch (execErr: any) {
        console.error(`[MascotQueueFallback] Execution error for task ${task.id}:`, execErr);
      }
    });

    return { queued: true, jobId };
  }
}
