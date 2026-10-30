"use strict";
/**
 * lib/pos/offline/sync/posSyncClient.ts
 *
 * Client Sync Engine Orchestrator for SalesmanPro POS (Web, Android, Windows Desktop).
 * Implements the Shared Synchronization Protocol:
 * 1. Push pending operations from the durable outbox journal in DAG order (/api/sync/push).
 * 2. Remap provisional local entity IDs to authoritative server IDs.
 * 3. Pull incremental changes by serverSequence cursor (/api/sync/pull).
 * 4. Recover automatically from expired cursors via non-destructive bootstrap (/api/sync/bootstrap).
 * 5. Acknowledge durable cursor progression (/api/sync/acknowledge).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSSyncClient = void 0;
const uuid_1 = require("uuid");
class POSSyncClient {
    storage;
    journal;
    connectivity;
    endpoint;
    deviceId;
    companyId;
    storeId;
    isSyncing = false;
    constructor(storage, journal, connectivity, deviceId = "DEV-DEFAULT", companyId = "default", storeId = "default", endpoint = "/api/sync/push") {
        this.storage = storage;
        this.journal = journal;
        this.connectivity = connectivity;
        this.deviceId = deviceId;
        this.companyId = companyId;
        this.storeId = storeId;
        this.endpoint = endpoint;
    }
    async syncPending() {
        if (this.isSyncing) {
            return { totalProcessed: 0, succeeded: 0, failed: 0, conflicts: 0 };
        }
        const state = this.connectivity.getState();
        if (state === "OFFLINE") {
            return { totalProcessed: 0, succeeded: 0, failed: 0, conflicts: 0 };
        }
        this.isSyncing = true;
        this.connectivity.setState("SYNCING");
        const summary = {
            totalProcessed: 0,
            succeeded: 0,
            failed: 0,
            conflicts: 0,
            pulledChanges: 0,
        };
        try {
            const pending = await this.journal.getOrderedPendingOperations();
            const now = Date.now();
            const readyToDispatch = pending.filter((op) => {
                if (!op.nextRetryAt)
                    return true;
                return new Date(op.nextRetryAt).getTime() <= now;
            });
            if (readyToDispatch.length > 0) {
                const batchSize = 25;
                const batchItems = readyToDispatch.slice(0, batchSize);
                for (const op of batchItems) {
                    await this.journal.markSyncing(op.operationId);
                }
                const batchPayload = {
                    deviceId: this.deviceId,
                    companyId: this.companyId,
                    storeId: this.storeId,
                    batchId: `BATCH-${(0, uuid_1.v4)()}`,
                    operations: batchItems,
                };
                const res = await fetch(this.endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-POS-Device-Id": this.deviceId,
                        "X-POS-Company-Id": this.companyId,
                        "X-POS-Store-Id": this.storeId,
                    },
                    body: JSON.stringify(batchPayload),
                });
                if (!res.ok) {
                    throw new Error(`Sync HTTP error: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();
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
                            if (matchingOp?.entityType === "ORDER" ||
                                matchingOp?.entityType === "SALE") {
                                const localOrder = await this.storage.getOrder(matchingOp.entityLocalId);
                                if (localOrder) {
                                    localOrder.syncStatus = "SYNCED";
                                    localOrder.serverId =
                                        result.serverEntityId || localOrder.serverId;
                                    if (result.trackingNumber) {
                                        localOrder.trackingNumber = result.trackingNumber;
                                    }
                                    localOrder.syncedAt = new Date().toISOString();
                                    await this.storage.saveOrder(localOrder);
                                }
                            }
                            else if (matchingOp?.entityType === "CUSTOMER") {
                                const localCust = await this.storage.searchCustomers(matchingOp.entityLocalId);
                                const target = localCust.find((c) => c.localId === matchingOp.entityLocalId);
                                if (target) {
                                    target.syncState = "SYNCED";
                                    target.serverId =
                                        result.serverEntityId || target.serverId;
                                    await this.storage.saveCustomer(target);
                                }
                            }
                        }
                        else if (result.status === "CONFLICT") {
                            summary.conflicts++;
                            await this.journal.markFailed(result.operationId, result.error || "Business conflict detected", true, (matchingOp?.attemptCount || 0) + 1);
                        }
                        else {
                            summary.failed++;
                            await this.journal.markFailed(result.operationId, result.error || "Operation failed on server", false, (matchingOp?.attemptCount || 0) + 1);
                        }
                    }
                }
            }
            this.connectivity.setState(summary.failed > 0 ? "SYNC_ERROR" : "ONLINE");
        }
        catch (err) {
            console.warn(`[POS_SYNC_CLIENT_ERROR] ${err.message}`);
            this.connectivity.setState("SYNC_ERROR");
        }
        finally {
            this.isSyncing = false;
        }
        return summary;
    }
    /**
     * Pulls incremental server changes since the last acknowledged `cursor`
     * and applies them to local storage. Automatically triggers bootstrap if cursor expired.
     */
    async pullIncrementalChanges() {
        const meta = (await this.storage.getSyncMetadata()) || {
            key: "sync_state",
            companyId: this.companyId,
            storeId: this.storeId,
            deviceId: this.deviceId,
            cursor: 0,
            receiptSequence: 1,
        };
        const url = `/api/sync/pull?companyId=${encodeURIComponent(this.companyId)}&storeId=${encodeURIComponent(this.storeId)}&deviceId=${encodeURIComponent(this.deviceId)}&cursor=${meta.cursor || 0}&limit=200`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "X-POS-Device-Id": this.deviceId,
                "X-POS-Company-Id": this.companyId,
                "X-POS-Store-Id": this.storeId,
            },
        });
        if (!res.ok) {
            throw new Error(`Pull sync failed: HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.cursorExpired) {
            await this.bootstrapCatalog();
            const updatedMeta = await this.storage.getSyncMetadata();
            return {
                appliedCount: 0,
                nextCursor: updatedMeta?.cursor || 0,
                cursorExpired: true,
            };
        }
        const changes = Array.isArray(data.changes) ? data.changes : [];
        let appliedCount = 0;
        for (const change of changes) {
            if (change.entityType === "INVENTORY" || change.entityType === "PRODUCT") {
                if (change.changeType === "DELETED") {
                    await this.storage.deleteProduct(change.entityId);
                    appliedCount++;
                }
                else if (change.payload) {
                    const listingId = change.payload.marketplaceListingId ||
                        change.payload.id ||
                        change.entityId;
                    const existing = await this.storage.getProduct(listingId);
                    if (existing) {
                        const newCloudStock = change.payload.cloudAuthoritativeStock ??
                            change.payload.stock ??
                            existing.localStockQuantity;
                        await this.storage.saveProduct({
                            ...existing,
                            localStockQuantity: newCloudStock,
                            cloudAuthoritativeStock: newCloudStock,
                            pendingLocalDelta: 0,
                            serverStockRevision: change.sequence,
                            updatedAt: change.createdAt || new Date().toISOString(),
                        });
                        appliedCount++;
                    }
                }
            }
        }
        const nextCursor = Number(data.nextCursor ?? meta.cursor ?? 0);
        await this.storage.saveSyncMetadata({
            ...meta,
            cursor: nextCursor,
            lastSyncAt: new Date().toISOString(),
        });
        const allJournal = await this.storage.getAllJournalEntries();
        const pendingCount = allJournal.filter((j) => j.status === "PENDING").length;
        const failedCount = allJournal.filter((j) => j.status === "FAILED" || j.status === "CONFLICT").length;
        await fetch("/api/sync/acknowledge", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-POS-Device-Id": this.deviceId,
                "X-POS-Company-Id": this.companyId,
            },
            body: JSON.stringify({
                companyId: this.companyId,
                storeId: this.storeId,
                deviceId: this.deviceId,
                ackedSequence: nextCursor,
                pendingOutboxCount: pendingCount,
                failedOutboxCount: failedCount,
                localDbHealth: "HEALTHY",
            }),
        }).catch(() => null);
        return {
            appliedCount,
            nextCursor,
            cursorExpired: false,
        };
    }
    /**
     * Runs non-destructive bootstrap provisioning (/api/sync/bootstrap), refreshing
     * the local product catalog and customers while preserving all pending outbox items.
     */
    async bootstrapCatalog() {
        const res = await fetch("/api/sync/bootstrap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-POS-Device-Id": this.deviceId,
                "X-POS-Company-Id": this.companyId,
                "X-POS-Store-Id": this.storeId,
            },
            body: JSON.stringify({
                companyId: this.companyId,
                storeId: this.storeId,
                deviceId: this.deviceId,
                page: 1,
                pageSize: 500,
            }),
        });
        if (!res.ok) {
            throw new Error(`Bootstrap HTTP ${res.status}`);
        }
        const data = await res.json();
        const rawProducts = Array.isArray(data.products) ? data.products : [];
        const mappedProducts = rawProducts.map((p) => ({
            id: p.id,
            productId: p.productId || null,
            companyId: this.companyId,
            storeId: this.storeId,
            name: p.name,
            sku: p.sku || null,
            barcode: p.barcode || null,
            sellingPrice: Number(p.price || 0),
            finalPrice: Number(p.finalPrice || p.price || 0),
            taxRate: Number(p.taxRate ?? 16),
            categoryId: p.categoryId || null,
            categoryName: p.category || "General",
            isAvailable: p.isAvailable !== false,
            imageUrl: p.image || null,
            pricingMode: "PRODUCT",
            trackInventory: true,
            localStockQuantity: Number(p.stock || 0),
            cloudAuthoritativeStock: Number(p.cloudAuthoritativeStock ?? p.stock ?? 0),
            allocatedOfflineStock: p.allocatedOfflineStock ?? null,
            pendingLocalDelta: 0,
            serverStockRevision: Number(data.headSequence || 1),
            variants: [],
            updatedAt: p.updatedAt || new Date().toISOString(),
        }));
        await this.storage.bulkSaveProducts(mappedProducts);
        const existingMeta = await this.storage.getSyncMetadata();
        await this.storage.saveSyncMetadata({
            key: "sync_state",
            companyId: this.companyId,
            storeId: this.storeId,
            deviceId: this.deviceId,
            cursor: Number(data.headSequence || 0),
            lastSyncAt: new Date().toISOString(),
            lastBootstrapAt: new Date().toISOString(),
            offlineGrantToken: data.offlineGrant?.token || existingMeta?.offlineGrantToken || null,
            offlineGrantExpiresAt: data.offlineGrant?.payload?.expiresAt ||
                existingMeta?.offlineGrantExpiresAt ||
                null,
            offlineStockPolicy: data.settings?.offlineInventoryPolicy ||
                existingMeta?.offlineStockPolicy ||
                "CONTROLLED",
            receiptSequence: existingMeta?.receiptSequence || 1,
        });
        return {
            productsProvisioned: mappedProducts.length,
            headSequence: Number(data.headSequence || 0),
        };
    }
}
exports.POSSyncClient = POSSyncClient;
