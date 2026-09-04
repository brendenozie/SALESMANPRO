/**
 * lib/ai/workforce/memoryManager.ts
 *
 * Multi-Tenant Partitioned Agent Memory System.
 * Guarantees zero cross-tenant contamination:
 * - Store Agents can ONLY query and mutate memories belonging to their own companyId.
 * - Platform Agents query aggregated platform intelligence.
 */

import prisma from "@/server/db/prismadb";
import { AgentMemoryScope, WorkforceExecutionContext, AgentWorkforceLevel } from "./types";

export class WorkforceMemoryManager {
  /**
   * Records a memory item scoped strictly by tenant or platform domain.
   */
  public static async recordMemory(params: {
    context: WorkforceExecutionContext;
    scope: AgentMemoryScope;
    key: string;
    content: string;
    metadata?: Record<string, unknown>;
    expiresInDays?: number;
  }) {
    const { context, scope, key, content, metadata, expiresInDays } = params;

    // Strict multi-tenant check for Store level
    if (context.level === AgentWorkforceLevel.STORE && !context.companyId) {
      throw new Error("Cannot record store memory without a valid companyId.");
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Upsert or create memory record
    const existing = await prisma.aIAgentMemory.findFirst({
      where: {
        companyId: context.level === AgentWorkforceLevel.STORE ? context.companyId : null,
        scope,
        key,
      },
    });

    if (existing) {
      return prisma.aIAgentMemory.update({
        where: { id: existing.id },
        data: {
          content,
          metadata: (metadata as any) || undefined,
          expiresAt,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.aIAgentMemory.create({
      data: {
        companyId: context.level === AgentWorkforceLevel.STORE ? context.companyId : undefined,
        scope,
        key,
        content,
        metadata: (metadata as any) || undefined,
        expiresAt,
      },
    });
  }

  /**
   * Retrieves relevant memory records for context injection.
   */
  public static async getMemories(params: {
    context: WorkforceExecutionContext;
    scope?: AgentMemoryScope;
    keys?: string[];
    limit?: number;
  }) {
    const { context, scope, keys, limit = 5 } = params;

    return prisma.aIAgentMemory.findMany({
      where: {
        companyId: context.level === AgentWorkforceLevel.STORE ? context.companyId : null,
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
