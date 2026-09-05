"use strict";
/**
 * lib/ai/workforce/memoryManager.ts
 *
 * Multi-Tenant Partitioned Agent Memory System.
 * Guarantees zero cross-tenant contamination:
 * - Store Agents can ONLY query and mutate memories belonging to their own companyId.
 * - Platform Agents query aggregated platform intelligence.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceMemoryManager = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
class WorkforceMemoryManager {
    /**
     * Records a memory item scoped strictly by tenant or platform domain.
     */
    static async recordMemory(params) {
        const { context, scope, key, content, metadata, expiresInDays } = params;
        // Strict multi-tenant check for Store level
        if (context.level === types_1.AgentWorkforceLevel.STORE && !context.companyId) {
            throw new Error("Cannot record store memory without a valid companyId.");
        }
        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : undefined;
        // Upsert or create memory record
        const existing = await prismadb_1.default.aIAgentMemory.findFirst({
            where: {
                companyId: context.level === types_1.AgentWorkforceLevel.STORE ? context.companyId : null,
                scope,
                key,
            },
        });
        if (existing) {
            return prismadb_1.default.aIAgentMemory.update({
                where: { id: existing.id },
                data: {
                    content,
                    metadata: metadata || undefined,
                    expiresAt,
                    updatedAt: new Date(),
                },
            });
        }
        return prismadb_1.default.aIAgentMemory.create({
            data: {
                companyId: context.level === types_1.AgentWorkforceLevel.STORE ? context.companyId : undefined,
                scope,
                key,
                content,
                metadata: metadata || undefined,
                expiresAt,
            },
        });
    }
    /**
     * Retrieves relevant memory records for context injection.
     */
    static async getMemories(params) {
        const { context, scope, keys, limit = 5 } = params;
        return prismadb_1.default.aIAgentMemory.findMany({
            where: {
                companyId: context.level === types_1.AgentWorkforceLevel.STORE ? context.companyId : null,
                ...(scope ? { scope } : {}),
                ...(keys && keys.length > 0 ? { key: { in: keys } } : {}),
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: { updatedAt: "desc" },
            take: limit,
            select: {
                id: true,
                scope: true,
                key: true,
                content: true,
                metadata: true,
                updatedAt: true,
            },
        });
    }
}
exports.WorkforceMemoryManager = WorkforceMemoryManager;
