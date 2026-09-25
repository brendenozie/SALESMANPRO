/**
 * lib/media/transcoding/dispatcher.ts
 *
 * Universal Background Transcoding Dispatcher for SalesmanPro.
 * Safe to call from any endpoint or service across the platform.
 * Enqueues the video into the Redis mediaProcessingQueue without blocking the HTTP response.
 */

import { mediaProcessingQueue } from "@/lib/media/queues";
import { TranscodeJobInput } from "./videoTranscoder";

export async function dispatchVideoTranscode(
  input: TranscodeJobInput
): Promise<{ enqueued: boolean; jobId?: string; error?: string }> {
  try {
    const job = await mediaProcessingQueue.add("video-transcode", input, {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    console.log(`[DISPATCHER] Enqueued video transcoding job #${job.id} for MediaAsset ${input.mediaAssetId}`);
    return { enqueued: true, jobId: job.id };
  } catch (error: any) {
    console.warn(`[DISPATCHER WARNING] Could not enqueue to Redis (running offline or build): ${error.message}`);
    return { enqueued: false, error: error.message };
  }
}
