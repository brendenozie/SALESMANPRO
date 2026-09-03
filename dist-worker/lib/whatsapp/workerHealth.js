"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWhatsAppWorkerHealth = exports.touchWhatsAppWorkerHeartbeat = exports.WHATSAPP_WORKER_HEARTBEAT_KEY = void 0;
const redis_1 = require("@/lib/redis");
exports.WHATSAPP_WORKER_HEARTBEAT_KEY = "salesmanpro:whatsapp:worker:heartbeat";
const HEARTBEAT_TTL_SECONDS = 90;
async function touchWhatsAppWorkerHeartbeat() {
    await redis_1.redisConnection.set(exports.WHATSAPP_WORKER_HEARTBEAT_KEY, String(Date.now()), "EX", HEARTBEAT_TTL_SECONDS);
}
exports.touchWhatsAppWorkerHeartbeat = touchWhatsAppWorkerHeartbeat;
async function getWhatsAppWorkerHealth() {
    try {
        const raw = await redis_1.redisConnection.get(exports.WHATSAPP_WORKER_HEARTBEAT_KEY);
        if (!raw) {
            return {
                status: "UNHEALTHY",
                message: "WhatsApp worker has not reported a heartbeat",
            };
        }
        const ageMs = Date.now() - Number(raw);
        if (Number.isNaN(ageMs) || ageMs > HEARTBEAT_TTL_SECONDS * 1000) {
            return {
                status: "UNHEALTHY",
                ageMs,
                message: "WhatsApp worker heartbeat is stale",
            };
        }
        return { status: "HEALTHY", ageMs };
    }
    catch (error) {
        return {
            status: "UNHEALTHY",
            message: error instanceof Error ? error.message : "Heartbeat check failed",
        };
    }
}
exports.getWhatsAppWorkerHealth = getWhatsAppWorkerHealth;
