"use strict";
/**
 * lib/observability/redisMonitor.ts
 *
 * Redis Cache and Message Broker Health Inspector.
 * Extracts operational statistics (memory, clients, latency, keyspace) safely.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisHealth = void 0;
const redis_1 = require("@/lib/redis");
async function getRedisHealth() {
    if (!(0, redis_1.isRedisAvailable)()) {
        return {
            status: "DISCONNECTED",
            pingLatencyMs: 0,
            memoryUsedHuman: "0 B",
            memoryUsedBytes: 0,
            connectedClients: 0,
            totalKeys: 0,
            uptimeSeconds: 0,
            role: "unknown",
        };
    }
    const client = (0, redis_1.getRedisClient)();
    const start = Date.now();
    try {
        const pong = await Promise.race([
            client.ping(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
        ]);
        const pingLatencyMs = Date.now() - start;
        let info = "";
        try {
            info = await client.info();
        }
        catch { }
        const memoryMatch = info.match(/used_memory_human:(.+)/);
        const memoryBytesMatch = info.match(/used_memory:(\d+)/);
        const clientsMatch = info.match(/connected_clients:(\d+)/);
        const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);
        const roleMatch = info.match(/role:(.+)/);
        let totalKeys = 0;
        try {
            const dbsize = await client.dbsize();
            totalKeys = dbsize;
        }
        catch { }
        const memoryUsedHuman = memoryMatch ? memoryMatch[1].trim() : "unknown";
        const memoryUsedBytes = memoryBytesMatch ? parseInt(memoryBytesMatch[1], 10) : 0;
        const connectedClients = clientsMatch ? parseInt(clientsMatch[1], 10) : 1;
        const uptimeSeconds = uptimeMatch ? parseInt(uptimeMatch[1], 10) : 0;
        const role = roleMatch ? roleMatch[1].trim() : "master";
        return {
            status: pingLatencyMs > 100 ? "DEGRADED" : "CONNECTED",
            pingLatencyMs,
            memoryUsedHuman,
            memoryUsedBytes,
            connectedClients,
            totalKeys,
            uptimeSeconds,
            role,
        };
    }
    catch (err) {
        return {
            status: "DISCONNECTED",
            pingLatencyMs: Date.now() - start,
            memoryUsedHuman: "0 B",
            memoryUsedBytes: 0,
            connectedClients: 0,
            totalKeys: 0,
            uptimeSeconds: 0,
            role: "unknown",
        };
    }
}
exports.getRedisHealth = getRedisHealth;
