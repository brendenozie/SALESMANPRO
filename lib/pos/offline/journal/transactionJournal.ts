/**
 * lib/pos/offline/journal/transactionJournal.ts
 *
 * Durable Append-Only Outbox Transaction Journal for SalesmanPro POS.
 * Guarantees that every offline mutation (orders, customer creations, session updates)
 * is assigned a deterministic idempotency key, strictly ordered via a dependency DAG,
 * and persisted to storage before user feedback is displayed.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  JournalOperationItem,
  JournalEntityType,
  JournalOperationType,
  JournalOperationStatus,
} from "@/types/pos-offline";
import { POSStorageManager } from "../storage/storageManager";

export class TransactionJournalManager {
  private storage: POSStorageManager;
  private deviceId: string;
  private companyId: string;
  private storeId: string;

  constructor(
    storage: POSStorageManager,
    deviceId = "DEV-DEFAULT",
    companyId = "default",
    storeId = "default"
  ) {
    this.storage = storage;
    this.deviceId = deviceId;
    this.companyId = companyId;
    this.storeId = storeId;
  }

  /**
   * Appends an operation to the durable outbox journal.
   */
  async recordOperation(params: {
    entityType: JournalEntityType;
    entityLocalId: string;
    operationType: JournalOperationType;
    payload: any;
    dependencies?: string[];
    operatorId?: string;
  }): Promise<JournalOperationItem> {
    const operationId = `OP-${uuidv4()}`;
    const idempotencyKey = `${this.deviceId}:${operationId}`;

    const entry: JournalOperationItem = {
      operationId,
      deviceId: this.deviceId,
      companyId: this.companyId,
      storeId: this.storeId,
      operatorId: params.operatorId,
      entityType: params.entityType,
      entityLocalId: params.entityLocalId,
      operationType: params.operationType,
      payload: params.payload,
      dependencies: params.dependencies || [],
      idempotencyKey,
      status: "PENDING",
      attemptCount: 0,
      createdAt: new Date().toISOString(),
    };

    await this.storage.appendJournal(entry);
    return entry;
  }

  /**
   * Retrieves pending operations sorted in topological dependency order.
   */
  async getOrderedPendingOperations(): Promise<JournalOperationItem[]> {
    const pending = await this.storage.getPendingJournalEntries();
    return this.sortTopologically(pending);
  }

  /**
   * Sorts journal operations respecting dependency arrays.
   */
  public sortTopologically(items: JournalOperationItem[]): JournalOperationItem[] {
    const itemMap = new Map(items.map((i) => [i.operationId, i]));
    const visited = new Set<string>();
    const sorted: JournalOperationItem[] = [];

    function visit(item: JournalOperationItem) {
      if (visited.has(item.operationId)) return;
      visited.add(item.operationId);

      for (const depId of item.dependencies) {
        const depItem = itemMap.get(depId);
        if (depItem) {
          visit(depItem);
        }
      }

      sorted.push(item);
    }

    for (const item of items) {
      visit(item);
    }

    return sorted;
  }

  /**
   * Updates state to SYNCING before HTTP dispatch.
   */
  async markSyncing(operationId: string): Promise<void> {
    await this.storage.updateJournalStatus(operationId, "SYNCING", {
      lastAttemptAt: new Date().toISOString(),
    });
  }

  /**
   * Marks an operation as successfully acknowledged by the server.
   */
  async markSynced(
    operationId: string,
    meta: { serverEntityId?: string; serverRevision?: number }
  ): Promise<void> {
    await this.storage.updateJournalStatus(operationId, "SYNCED", {
      syncedAt: new Date().toISOString(),
      serverRevision: meta.serverRevision,
    });
  }

  /**
   * Records a failure or conflict with exponential backoff delay calculation.
   */
  async markFailed(
    operationId: string,
    errorMessage: string,
    isConflict = false,
    currentAttempt = 1
  ): Promise<void> {
    const status: JournalOperationStatus = isConflict ? "CONFLICT" : "FAILED";
    const nextRetryMs = this.calculateBackoffMs(currentAttempt);
    const nextRetryAt = new Date(Date.now() + nextRetryMs).toISOString();

    await this.storage.updateJournalStatus(operationId, status, {
      attemptCount: currentAttempt,
      errorMessage,
      nextRetryAt: isConflict ? null : nextRetryAt,
    });
  }

  /**
   * Exponential backoff with full jitter: delay = random(0, min(300s, 2s * 2^attempt))
   */
  public calculateBackoffMs(attempt: number): number {
    const baseMs = 2000;
    const maxMs = 300_000;
    const exp = Math.min(attempt, 8);
    const maxDelay = Math.min(maxMs, baseMs * Math.pow(2, exp));
    return Math.floor(Math.random() * maxDelay);
  }
}
