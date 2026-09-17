"use strict";
/**
 * lib/observability/dbMonitor.ts
 *
 * MongoDB & Prisma Database Health Inspector.
 * Measures database round-trip latency, collection statistics, and integrates
 * with the backup subsystem to verify backup freshness.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseHealth = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
/**
 * Checks MongoDB database connectivity and measures query latency
 */
async function getDatabaseHealth() {
    const start = Date.now();
    let status = "OFFLINE";
    let pingLatencyMs = 0;
    let isPrimary = true;
    let dbName = "salesmanpro";
    try {
        // Run admin ping command
        const pingResult = await Promise.race([
            prismadb_1.default.$runCommandRaw({ ping: 1 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("MongoDB ping timeout")), 3000)),
        ]);
        pingLatencyMs = Date.now() - start;
        status = pingLatencyMs > 200 ? "DEGRADED" : "ONLINE";
    }
    catch (err) {
        pingLatencyMs = Date.now() - start;
        status = "OFFLINE";
    }
    // Sample primary collection counts
    const collections = [];
    if (status !== "OFFLINE") {
        try {
            const [users, companies, products, orders, payments, messages] = await Promise.all([
                prismadb_1.default.user.count().catch(() => 0),
                prismadb_1.default.company.count().catch(() => 0),
                prismadb_1.default.product.count().catch(() => 0),
                prismadb_1.default.customerOrder.count().catch(() => 0),
                prismadb_1.default.payment.count().catch(() => 0),
                prismadb_1.default.whatsAppMessage.count().catch(() => 0),
            ]);
            collections.push({ name: "User", estimatedCount: users }, { name: "Company", estimatedCount: companies }, { name: "Product", estimatedCount: products }, { name: "CustomerOrder", estimatedCount: orders }, { name: "Payment", estimatedCount: payments }, { name: "WhatsAppMessage", estimatedCount: messages });
        }
        catch { }
    }
    // Check last backup status from DatabaseBackup table
    let lastSuccessfulBackup = null;
    let lastFailedBackup = null;
    try {
        const success = await prismadb_1.default.databaseBackup.findFirst({
            where: { status: { in: ["COMPLETED", "VERIFIED"] } },
            orderBy: { createdAt: "desc" },
            select: { id: true, createdAt: true, sizeBytes: true, status: true },
        });
        if (success) {
            lastSuccessfulBackup = {
                id: success.id,
                createdAt: success.createdAt.toISOString(),
                byteSize: Number(success.sizeBytes || 0),
                status: success.status,
            };
        }
        const failed = await prismadb_1.default.databaseBackup.findFirst({
            where: { status: "FAILED" },
            orderBy: { createdAt: "desc" },
            select: { id: true, createdAt: true, failureReason: true },
        });
        if (failed) {
            lastFailedBackup = {
                id: failed.id,
                createdAt: failed.createdAt.toISOString(),
                error: failed.failureReason || "Backup execution failure",
            };
        }
    }
    catch { }
    // Slow requests in DB
    let slowQueriesCount = 0;
    try {
        slowQueriesCount = await prismadb_1.default.monitoringRequest.count({
            where: {
                isSlow: true,
                timestamp: { gte: new Date(Date.now() - 3600000) },
            },
        });
    }
    catch { }
    return {
        status,
        pingLatencyMs,
        isPrimary,
        databaseName: dbName,
        totalCollections: collections.length,
        collections,
        lastSuccessfulBackup,
        lastFailedBackup,
        slowQueriesCount,
    };
}
exports.getDatabaseHealth = getDatabaseHealth;
