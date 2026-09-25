/**
 * lib/pos/offline/sync/posSyncClient.ts
 *
 * Client Sync Engine Orchestrator for SalesmanPro POS.
 * Collects pending operations from the outbox journal in DAG order,
 * submits idempotent batches to /api/pos/sync, remaps generated server IDs,
 * and handles partial batch successes and conflict flags.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  SyncBatchRequest,
  SyncBatchResponse,
  JournalOperationItem,
} from "@/types/pos-offline";
import { POSStorageManager } from "../storage/storageManager";
import { TransactionJournalManager } from "../journal/transactionJournal";
import { ConnectivityManager } from "../connectivity/connectivityManager";

export interface SyncRunSummary {
  totalProcessed: number;
  succeeded: number;
  failed: number;
  conflicts: number;
}

export class POSSyncClient {
  private storage: POSStorageManager;
  private journal: TransactionJournalManager;
  private connectivity: ConnectivityManager;
  private endpoint: string;
  private deviceId: string;
  private companyId: string;
  private storeId: string;
  private isSyncing = false;

  constructor(
    storage: POSStorageManager,
    journal: TransactionJournalManager,
    connectivity: ConnectivityManager,
    deviceId = "DEV-DEFAULT",
    companyId = "default",
    storeId = "default",
    endpoint = "/api/pos/sync"
  ) {
    this.storage = storage;
    this.journal = journal;
    this.connectivity = connectivity;
    this.deviceId = deviceId;
    this.companyId = companyId;
    this.storeId = storeId;
    this.endpoint = endpoint;
  }

  public async syncPending(): Promise<SyncRunSummary> {
    if (this.isSyncing) {
      return { totalProcessed: 0, succeeded: 0, failed: 0, conflicts: 0 };
    }

    const state = this.connectivity.getState();
    if (state === "OFFLINE") {
      return { totalProcessed: 0, succeeded: 0, failed: 0, conflicts: 0 };
    }

    this.isSyncing = true;
    this.connectivity.setState("SYNCING");

    const summary: SyncRunSummary = {
      totalProcessed: 0,
      succeeded: 0,
      failed: 0,
      conflicts: 0,
    };

    try {
      const pending = await this.journal.getOrderedPendingOperations();
      if (pending.length === 0) {
        this.connectivity.setState("ONLINE");
        this.isSyncing = false;
        return summary;
      }

      // Filter operations whose nextRetryAt is in the future
      const now = Date.now();
      const readyToDispatch = pending.filter((op) => {
        if (!op.nextRetryAt) return true;
        return new Date(op.nextRetryAt).getTime() <= now;
      });

      if (readyToDispatch.length === 0) {
        this.connectivity.setState("ONLINE");
        this.isSyncing = false;
        return summary;
      }

      // Group into chunks of at most 25 operations
      const batchSize = 25;
      const batchItems = readyToDispatch.slice(0, batchSize);

      for (const op of batchItems) {
        await this.journal.markSyncing(op.operationId);
      }

      const batchPayload: SyncBatchRequest = {
        deviceId: this.deviceId,
        companyId: this.companyId,
        storeId: this.storeId,
        batchId: `BATCH-${uuidv4()}`,
        operations: batchItems,
      };

      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-POS-Device-Id": this.deviceId,
        },
        body: JSON.stringify(batchPayload),
      });

      if (!res.ok) {
        throw new Error(`Sync HTTP error: ${res.status} ${res.statusText}`);
      }

      const data: SyncBatchResponse = await res.json();

      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          summary.totalProcessed++;
          const matchingOp = batchItems.find((o) => o.operationId === result.operationId);

          if (result.status === "SUCCESS") {
            summary.succeeded++;
            await this.journal.markSynced(result.operationId, {
              serverEntityId: result.serverEntityId,
              serverRevision: data.serverRevision,
            });

            // Update matching local entities
            if (matchingOp?.entityType === "ORDER") {
              const localOrder = await this.storage.getOrder(matchingOp.entityLocalId);
              if (localOrder) {
                localOrder.syncStatus = "SYNCED";
                localOrder.serverId = result.serverEntityId || localOrder.serverId;
                localOrder.syncedAt = new Date().toISOString();
                await this.storage.saveOrder(localOrder);
              }
            } else if (matchingOp?.entityType === "CUSTOMER") {
              const localCust = await this.storage.searchCustomers(matchingOp.entityLocalId);
              const target = localCust.find((c) => c.localId === matchingOp.entityLocalId);
              if (target) {
                target.syncState = "SYNCED";
                target.serverId = result.serverEntityId || target.serverId;
                await this.storage.saveCustomer(target);
              }
            }
          } else if (result.status === "CONFLICT") {
            summary.conflicts++;
            await this.journal.markFailed(
              result.operationId,
              result.error || "Business conflict detected",
              true,
              (matchingOp?.attemptCount || 0) + 1
            );
          } else {
            summary.failed++;
            await this.journal.markFailed(
              result.operationId,
              result.error || "Operation failed on server",
              false,
              (matchingOp?.attemptCount || 0) + 1
            );
          }
        }
      }

      this.connectivity.setState(summary.failed > 0 ? "SYNC_ERROR" : "ONLINE");
    } catch (err: any) {
      console.warn(`[POS_SYNC_CLIENT_ERROR] ${err.message}`);
      this.connectivity.setState("SYNC_ERROR");
    } finally {
      this.isSyncing = false;
    }

    return summary;
  }
}
