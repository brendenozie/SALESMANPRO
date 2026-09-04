/**
 * lib/ai/workforce/queue.ts
 *
 * BullMQ Queue definitions for Asynchronous AI Workforce Tasks.
 */

import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { AgentRunInput, WorkforceExecutionContext } from "./types";

export const WORKFORCE_QUEUE_NAME = "salesmanpro-ai-workforce";

export interface WorkforceJobData {
  input: AgentRunInput;
  context: WorkforceExecutionContext;
}

export const workforceQueue = new Queue<WorkforceJobData>(WORKFORCE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 500,
    removeOnFail: 2000,
  },
});

export async function enqueueWorkforceTask(
  input: AgentRunInput,
  context: WorkforceExecutionContext,
) {
  const job = await workforceQueue.add(
    `task_${input.agentKey}_${Date.now()}`,
    { input, context },
    {
      priority: input.priority || 2,
    },
  );

  return { jobId: job.id };
}
