"use strict";
/**
 * lib/ai/workforce/queue.ts
 *
 * BullMQ Queue definitions for Asynchronous AI Workforce Tasks.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueWorkforceTask = exports.workforceQueue = exports.WORKFORCE_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.WORKFORCE_QUEUE_NAME = "salesmanpro-ai-workforce";
exports.workforceQueue = new bullmq_1.Queue(exports.WORKFORCE_QUEUE_NAME, {
    connection: redis_1.redisConnection,
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
async function enqueueWorkforceTask(input, context) {
    const fallbackJobId = `wf_${input.agentKey}_${Date.now()}`;
    try {
        const job = await exports.workforceQueue.add(`task_${input.agentKey}_${Date.now()}`, { input, context }, {
            priority: input.priority || 2,
        });
        return { jobId: job.id || fallbackJobId, queued: true };
    }
    catch (err) {
        console.warn(`[WorkforceQueue] Redis enqueue failed (${err?.message}). Running via asynchronous runner fallback.`);
        setImmediate(async () => {
            try {
                const { WorkforceOrchestrator } = await Promise.resolve().then(() => __importStar(require("./orchestrator")));
                const orchestrator = new WorkforceOrchestrator();
                await orchestrator.execute(input, context);
            }
            catch (execErr) {
                console.error(`[WorkforceQueueFallback] Execution error for agent ${input.agentKey}:`, execErr);
            }
        });
        return { jobId: fallbackJobId, queued: true, fallback: true };
    }
}
exports.enqueueWorkforceTask = enqueueWorkforceTask;
