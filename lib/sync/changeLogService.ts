import prisma from "@/server/db/prismadb";

export type SyncEntityType =
  | "PRODUCT"
  | "INVENTORY"
  | "CUSTOMER"
  | "SALE"
  | "ORDER"
  | "EXPENSE"
  | "QUOTATION"
  | "INVOICE"
  | "RETURN"
  | "POS_SESSION"
  | "STAFF"
  | "SETTINGS";

export type SyncChangeType = "CREATED" | "UPDATED" | "DELETED";

export interface AppendSyncChangeInput {
  companyId: string;
  storeId?: string | null;
  entityType: SyncEntityType | string;
  entityId: string;
  changeType: SyncChangeType;
  version?: number;
  payload?: any;
  sourceDeviceId?: string | null;
  sourceOperationId?: string | null;
  actorId?: string | null;
}

/**
 * Atomically allocates the next monotonically increasing serverSequence for a tenant (companyId).
 */
export async function allocateNextSequence(companyId: string, txClient?: any): Promise<number> {
  const db = txClient || prisma;
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

/**
 * Appends a tenant-scoped change log entry with a monotonic serverSequence.
 */
export async function appendSyncChange(input: AppendSyncChangeInput, txClient?: any) {
  const db = txClient || prisma;
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

/**
 * Retrieves the current head serverSequence for a tenant.
 */
export async function getHeadSequence(companyId: string): Promise<{
  headSequence: number;
  minRetainedSequence: number;
}> {
  const counter = await prisma.syncSequenceCounter.findUnique({
    where: { companyId },
  });
  return {
    headSequence: counter?.currentSequence ?? 0,
    minRetainedSequence: counter?.minRetainedSeq ?? 0,
  };
}

/**
 * Pulls incremental changes after `cursor` for a tenant and optional branch `storeId`.
 */
export async function pullSyncChanges(params: {
  companyId: string;
  storeId?: string | null;
  cursor: number;
  limit?: number;
  excludeDeviceId?: string | null;
}) {
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

  const whereClause: any = {
    companyId: params.companyId,
    sequence: { gt: safeCursor },
  };

  if (params.storeId) {
    whereClause.OR = [{ storeId: null }, { storeId: params.storeId }];
  }

  const rows = await prisma.syncChangeLog.findMany({
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
    changes: page.map((r: any) => ({
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

/**
 * Looks up an existing idempotent operation receipt for `(companyId, idempotencyKey)`.
 */
export async function findOperationReceipt(companyId: string, idempotencyKey: string, txClient?: any) {
  const db = txClient || prisma;
  return db.syncOperationReceipt.findUnique({
    where: {
      companyId_idempotencyKey: {
        companyId,
        idempotencyKey,
      },
    },
  });
}

/**
 * Records an idempotent operation receipt so repeated retries return the same result without side effects.
 */
export async function recordOperationReceipt(
  params: {
    companyId: string;
    storeId?: string | null;
    deviceId: string;
    operationId: string;
    idempotencyKey: string;
    entityType: string;
    entityLocalId?: string | null;
    serverEntityId?: string | null;
    status: "APPLIED" | "APPLIED_WITH_WARNING" | "DUPLICATE_IGNORED" | "CONFLICT_HOLD" | "REJECTED";
    serverSequence?: number | null;
    responsePayload?: any;
  },
  txClient?: any
) {
  const db = txClient || prisma;
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

