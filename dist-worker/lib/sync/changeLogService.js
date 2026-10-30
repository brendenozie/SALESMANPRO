"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordOperationReceipt = exports.findOperationReceipt = exports.pullSyncChanges = exports.getHeadSequence = exports.appendSyncChange = exports.allocateNextSequence = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
/**
 * Atomically allocates the next monotonically increasing serverSequence for a tenant (companyId).
 */
async function allocateNextSequence(companyId, txClient) {
    const db = txClient || prismadb_1.default;
    const counter = await db.syncSequenceCounter.upsert({
        where: { companyId },
        update: {
            currentSequence: { increment: 1 },
        },
        create: {
            companyId,
            currentSequence: 1,
            minRetainedSeq: 0,
        },
    });
    return counter.currentSequence;
}
exports.allocateNextSequence = allocateNextSequence;
/**
 * Appends a tenant-scoped change log entry with a monotonic serverSequence.
 */
async function appendSyncChange(input, txClient) {
    const db = txClient || prismadb_1.default;
    const sequence = await allocateNextSequence(input.companyId, db);
    const entry = await db.syncChangeLog.create({
        data: {
            companyId: input.companyId,
            storeId: input.storeId || null,
            sequence,
            entityType: input.entityType,
            entityId: input.entityId,
            changeType: input.changeType,
            version: input.version ?? 1,
            payload: input.payload ?? null,
            sourceDeviceId: input.sourceDeviceId || null,
            sourceOperationId: input.sourceOperationId || null,
            actorId: input.actorId || null,
        },
    });
    return entry;
}
exports.appendSyncChange = appendSyncChange;
/**
 * Retrieves the current head serverSequence for a tenant.
 */
async function getHeadSequence(companyId) {
    const counter = await prismadb_1.default.syncSequenceCounter.findUnique({
        where: { companyId },
    });
    return {
        headSequence: counter?.currentSequence ?? 0,
        minRetainedSequence: counter?.minRetainedSeq ?? 0,
    };
}
exports.getHeadSequence = getHeadSequence;
/**
 * Pulls incremental changes after `cursor` for a tenant and optional branch `storeId`.
 */
async function pullSyncChanges(params) {
    const safeCursor = Math.max(0, Number(params.cursor || 0));
    const safeLimit = Math.max(1, Math.min(500, Number(params.limit || 200)));
    const { headSequence, minRetainedSequence } = await getHeadSequence(params.companyId);
    if (safeCursor > 0 && safeCursor < minRetainedSequence) {
        return {
            cursorExpired: true,
            minRetainedSequence,
            headSequence,
            nextCursor: safeCursor,
            hasMore: false,
            changes: [],
        };
    }
    const whereClause = {
        companyId: params.companyId,
        sequence: { gt: safeCursor },
    };
    if (params.storeId) {
        whereClause.OR = [{ storeId: null }, { storeId: params.storeId }];
    }
    const rows = await prismadb_1.default.syncChangeLog.findMany({
        where: whereClause,
        orderBy: { sequence: "asc" },
        take: safeLimit + 1,
    });
    const hasMore = rows.length > safeLimit;
    const page = hasMore ? rows.slice(0, safeLimit) : rows;
    const nextCursor = page.length > 0 ? page[page.length - 1].sequence : safeCursor;
    return {
        cursorExpired: false,
        minRetainedSequence,
        headSequence: Math.max(headSequence, nextCursor),
        nextCursor,
        hasMore,
        changes: page.map((r) => ({
            sequence: r.sequence,
            entityType: r.entityType,
            entityId: r.entityId,
            changeType: r.changeType,
            version: r.version,
            storeId: r.storeId,
            payload: r.payload,
            sourceDeviceId: r.sourceDeviceId,
            sourceOperationId: r.sourceOperationId,
            createdAt: r.createdAt.toISOString(),
        })),
    };
}
exports.pullSyncChanges = pullSyncChanges;
/**
 * Looks up an existing idempotent operation receipt for `(companyId, idempotencyKey)`.
 */
async function findOperationReceipt(companyId, idempotencyKey, txClient) {
    const db = txClient || prismadb_1.default;
    return db.syncOperationReceipt.findUnique({
        where: {
            companyId_idempotencyKey: {
                companyId,
                idempotencyKey,
            },
        },
    });
}
exports.findOperationReceipt = findOperationReceipt;
/**
 * Records an idempotent operation receipt so repeated retries return the same result without side effects.
 */
async function recordOperationReceipt(params, txClient) {
    const db = txClient || prismadb_1.default;
    return db.syncOperationReceipt.upsert({
        where: {
            companyId_idempotencyKey: {
                companyId: params.companyId,
                idempotencyKey: params.idempotencyKey,
            },
        },
        update: {
            status: params.status,
            serverEntityId: params.serverEntityId || undefined,
            serverSequence: params.serverSequence ?? undefined,
            responsePayload: params.responsePayload ?? undefined,
        },
        create: {
            companyId: params.companyId,
            storeId: params.storeId || null,
            deviceId: params.deviceId,
            operationId: params.operationId,
            idempotencyKey: params.idempotencyKey,
            entityType: params.entityType,
            entityLocalId: params.entityLocalId || null,
            serverEntityId: params.serverEntityId || null,
            status: params.status,
            serverSequence: params.serverSequence ?? null,
            responsePayload: params.responsePayload ?? null,
        },
    });
}
exports.recordOperationReceipt = recordOperationReceipt;
