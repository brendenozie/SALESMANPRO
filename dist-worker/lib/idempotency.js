"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIdempotency = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
/**
 * Concurrency-safe Idempotency wrapper.
 * Prevents race condition duplicate key crashes and safely awaits active in-flight locks.
 */
async function withIdempotency(key, handler, maxWaitMs = 5000) {
    // 1. Check existing record
    const existing = await prismadb_1.default.idempotency.findUnique({ where: { id: key } });
    if (existing?.response) {
        return existing.response;
    }
    // 2. If existing and locked, wait for the other worker to finish
    if (existing?.locked) {
        const started = Date.now();
        while (Date.now() - started < maxWaitMs) {
            await new Promise((r) => setTimeout(r, 200));
            const poll = await prismadb_1.default.idempotency.findUnique({ where: { id: key } });
            if (poll?.response)
                return poll.response;
            if (!poll?.locked)
                break;
        }
    }
    // 3. Acquire lock with race-condition catch
    let lockAcquired = false;
    try {
        await prismadb_1.default.idempotency.create({
            data: { id: key, locked: true },
        });
        lockAcquired = true;
    }
    catch (err) {
        // Unique constraint violation (P2002): another request acquired lock concurrently
        const started = Date.now();
        while (Date.now() - started < maxWaitMs) {
            await new Promise((r) => setTimeout(r, 200));
            const poll = await prismadb_1.default.idempotency.findUnique({ where: { id: key } });
            if (poll?.response)
                return poll.response;
            if (!poll?.locked) {
                lockAcquired = true;
                break;
            }
        }
    }
    try {
        const result = await handler();
        await prismadb_1.default.idempotency.upsert({
            where: { id: key },
            update: {
                locked: false,
                response: result,
            },
            create: {
                id: key,
                locked: false,
                response: result,
            },
        });
        return result;
    }
    catch (err) {
        try {
            await prismadb_1.default.idempotency.update({
                where: { id: key },
                data: { locked: false },
            });
        }
        catch (_) { }
        throw err;
    }
}
exports.withIdempotency = withIdempotency;
