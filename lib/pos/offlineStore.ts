/**
 * SalesmanPro POS Offline Store, Transactional Outbox & Local Spooler Queue
 * Powered by IndexedDB + POSStorageManager + Native Android/WPF SQLite Mirroring
 * for uninterrupted sales processing, local receipt printing, inventory movement tracking,
 * and automatic idempotent cloud synchronization when network connectivity returns.
 */

import {
  NormalizedPrintPayload,
  executeUnifiedPrint,
} from "@/lib/printing/unifiedPrintClient";
import { POSStorageManager } from "@/lib/pos/offline/storage/storageManager";
import { TransactionJournalManager } from "@/lib/pos/offline/journal/transactionJournal";
import { ConnectivityManager } from "@/lib/pos/offline/connectivity/connectivityManager";
import { POSSyncClient } from "@/lib/pos/offline/sync/posSyncClient";
import type {
  LocalOrderRecord,
  LocalProductRecord,
  LocalInventoryMovementRecord,
  LocalExpenseRecord,
} from "@/types/pos-offline";

const DB_NAME = "SalesmanPro_POS_Offline";
const DB_VERSION = 1;

export interface OfflinePendingOrder {
  id: string; // e.g. "off_ord_17182938493_xyz"
  localTrackingNumber: string;
  companyId: string;
  storeId?: string;
  deviceId?: string;
  payload: any;
  receiptData: any;
  createdAt: string;
  status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED" | "CONFLICT";
  retryCount: number;
  lastError?: string;
  serverOrderId?: string;
  serverTrackingNumber?: string;
}

export interface OfflinePrintJob {
  id: string; // jobId
  payload: NormalizedPrintPayload;
  htmlFallback?: string;
  createdAt: string;
  printed: boolean;
  status?: "QUEUED" | "SENDING" | "COMPLETED" | "FAILED" | "REQUIRES_ATTENTION";
  reprintCount?: number;
  error?: string;
}

export interface OfflineSyncOverview {
  deviceId: string;
  companyId: string;
  storeId: string;
  isOnline: boolean;
  lastSyncAt: string | null;
  cursor: number;
  pendingTransactionsCount: number;
  pendingInventoryMovementsCount: number;
  pendingExpensesCount: number;
  failedOperationsCount: number;
  conflictOperationsCount: number;
  pendingPrintJobsCount: number;
  failedPrintJobsCount: number;
  localDbHealth: "HEALTHY" | "DEGRADED";
  offlineStockPolicy: "STRICT" | "CONTROLLED" | "FLEXIBLE";
  pendingOrders: OfflinePendingOrder[];
  printJobs: OfflinePrintJob[];
  journalOperations: any[];
}

const engineCache = new Map<
  string,
  {
    storage: POSStorageManager;
    journal: TransactionJournalManager;
    connectivity: ConnectivityManager;
    syncClient: POSSyncClient;
  }
>();

export function getDeviceId(): string {
  if (typeof window === "undefined") return "POS_SERVER";
  try {
    const existing = window.localStorage.getItem("salesmanpro_pos_device_id");
    if (existing) return existing;
    const generated = `POS_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    window.localStorage.setItem("salesmanpro_pos_device_id", generated);
    return generated;
  } catch {
    return "POS_WEB_CLIENT";
  }
}

export function getOfflineEngine(companyId: string, storeId = "default") {
  const cleanCompanyId = companyId || "default";
  const cleanStoreId = storeId || `store_${cleanCompanyId}`;
  const key = `${cleanCompanyId}:${cleanStoreId}`;

  if (!engineCache.has(key)) {
    const deviceId = getDeviceId();
    const storage = new POSStorageManager(cleanCompanyId, cleanStoreId);
    const journal = new TransactionJournalManager(
      storage,
      deviceId,
      cleanCompanyId,
      cleanStoreId
    );
    const connectivity = new ConnectivityManager();
    const syncClient = new POSSyncClient(
      storage,
      journal,
      connectivity,
      deviceId,
      cleanCompanyId,
      cleanStoreId,
      "/api/sync/push"
    );
    engineCache.set(key, { storage, journal, connectivity, syncClient });
  }

  return engineCache.get(key)!;
}

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("products")) {
        const productStore = db.createObjectStore("products", { keyPath: "id" });
        productStore.createIndex("companyId", "companyId", { unique: false });
        productStore.createIndex("name", "name", { unique: false });
        productStore.createIndex("sku", "sku", { unique: false });
      }

      if (!db.objectStoreNames.contains("pendingOrders")) {
        const orderStore = db.createObjectStore("pendingOrders", {
          keyPath: "id",
        });
        orderStore.createIndex("companyId", "companyId", { unique: false });
        orderStore.createIndex("status", "status", { unique: false });
        orderStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("printSpooler")) {
        const spoolerStore = db.createObjectStore("printSpooler", {
          keyPath: "id",
        });
        spoolerStore.createIndex("printed", "printed", { unique: false });
        spoolerStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => {
      console.warn("[offlineStore] IndexedDB open error:", e);
      resolve(null);
    };
  });
}

/**
 * Cache store products locally for offline search and cart operations
 */
export async function cacheProductsOffline(
  companyId: string,
  products: any[],
  storeId?: string
): Promise<void> {
  if (!companyId || !Array.isArray(products)) return;

  // 1. Write to structured POSStorageManager
  try {
    const { storage } = getOfflineEngine(companyId, storeId);
    const normalized: LocalProductRecord[] = products
      .filter((p) => p && p.id)
      .map((p) => ({
        id: p.id,
        productId: p.productId || null,
        companyId,
        storeId: storeId || `store_${companyId}`,
        name: p.name || "Product",
        sku: p.sku || p.model || null,
        barcode: p.barcode || p.sku || p.model || null,
        sellingPrice: Number(p.price ?? p.sellingPrice ?? 0),
        finalPrice: Number(p.finalPrice ?? p.price ?? p.sellingPrice ?? 0),
        taxRate: Number(p.taxRate ?? 16),
        categoryId: p.categoryId || null,
        categoryName: p.category || "General",
        isAvailable: p.isAvailable !== false,
        imageUrl: p.image || p.imageUrl || null,
        pricingMode: "PRODUCT",
        trackInventory: true,
        localStockQuantity: Number(p.stock ?? p.quantity ?? 0),
        cloudAuthoritativeStock: Number(
          p.cloudAuthoritativeStock ?? p.stock ?? p.quantity ?? 0
        ),
        allocatedOfflineStock: p.allocatedOfflineStock ?? null,
        pendingLocalDelta: 0,
        serverStockRevision: 1,
        variants: [],
        updatedAt: new Date().toISOString(),
      }));
    await storage.bulkSaveProducts(normalized);
  } catch (e) {
    console.warn("[offlineStore] POSStorageManager bulkSaveProducts warning:", e);
  }

  // 2. Keep legacy IndexedDB store populated for immediate backward compatibility
  const db = await openDatabase();
  if (!db) return;

  try {
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");

    for (const p of products) {
      if (p && p.id) {
        store.put({
          ...p,
          companyId,
          _cachedAt: new Date().toISOString(),
        });
      }
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("[offlineStore] Cache products error:", err);
  }
}

/**
 * Get all cached products for a company
 */
export async function getCachedProductsOffline(
  companyId: string,
  storeId?: string
): Promise<any[]> {
  const db = await openDatabase();
  if (db) {
    const legacyList = await new Promise<any[]>((resolve) => {
      try {
        const tx = db.transaction("products", "readonly");
        const store = tx.objectStore("products");
        const index = store.index("companyId");
        const request = index.getAll(companyId);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
    if (legacyList.length > 0) return legacyList;
  }

  try {
    const { storage } = getOfflineEngine(companyId, storeId);
    const localProducts = await storage.searchProducts("");
    return localProducts.map((p) => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      price: p.sellingPrice,
      finalPrice: p.finalPrice,
      stock: p.localStockQuantity,
      cloudAuthoritativeStock: p.cloudAuthoritativeStock,
      category: p.categoryName,
      image: p.imageUrl,
      isAvailable: p.isAvailable,
    }));
  } catch {
    return [];
  }
}

/**
 * Atomically commits an offline sale, its outbox operation, and its local stock projections
 */
export async function enqueueOfflineOrder(order: {
  id: string;
  localTrackingNumber: string;
  companyId: string;
  storeId?: string;
  deviceId?: string;
  payload: any;
  receiptData: any;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const deviceId = order.deviceId || getDeviceId();
  const storeId = order.storeId || `store_${order.companyId}`;

  // 1. Commit atomically to structured POSStorageManager + Outbox Journal + Stock Movements
  try {
    const { storage } = getOfflineEngine(order.companyId, storeId);
    const rawItems = Array.isArray(order.payload?.items)
      ? order.payload.items
      : [];

    const operationId = `OP_${order.id}`;
    const idempotencyKey =
      order.payload?.idempotencyKey ||
      `${deviceId}:${order.localTrackingNumber || order.id}`;

    const localOrderRecord: LocalOrderRecord = {
      localId: order.id,
      serverId: null,
      companyId: order.companyId,
      storeId,
      deviceId,
      localReceiptNumber: order.localTrackingNumber,
      trackingNumber: order.localTrackingNumber,
      posSessionId: order.payload?.posSessionId,
      operatorId: order.payload?.operatorId,
      cashierName: order.payload?.cashierName,
      customerName: order.payload?.name || "Walk-in Customer",
      customerPhone: order.payload?.phone || "0000000000",
      customerEmail: order.payload?.email || "walkin@pos.local",
      orderType: "PRODUCT",
      orderSource: "IN_PERSON",
      paymentOption: (order.payload?.paymentOption || "cash") as any,
      paymentStatus:
        order.payload?.paymentOption === "cash" ||
        order.payload?.paymentOption === "split"
          ? "COMPLETED"
          : "PENDING",
      status:
        order.payload?.paymentOption === "cash" ||
        order.payload?.paymentOption === "split"
          ? "PAID"
          : "PENDING",
      subtotal: Number(order.payload?.totalPrice || 0),
      discountPercent: 0,
      discountAmount: Number(order.payload?.totalDiscount || 0),
      taxAmount: Number(order.payload?.totalTax || 0),
      totalAmount: Number(
        order.payload?.totalFinalPrice ?? order.payload?.totalPrice ?? 0
      ),
      items: rawItems.map((it: any, idx: number) => ({
        itemId: `${order.id}_item_${idx}`,
        marketplaceListingId: it.marketplaceListingId || it.id,
        productId: it.productId,
        name: it.name || "Item",
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.price || 0),
        extraPrice: 0,
        finalPrice: Number(it.price || 0),
        subtotal: Number(it.totalPrice ?? (it.price || 0) * (it.quantity || 1)),
        taxAmount: 0,
      })),
      payments: [
        {
          paymentId: `pay_${order.id}`,
          method: (order.payload?.paymentOption || "cash") as any,
          amount: Number(
            order.payload?.totalFinalPrice ?? order.payload?.totalPrice ?? 0
          ),
          verificationStatus:
            order.payload?.paymentOption === "cash" ||
            order.payload?.paymentOption === "split"
              ? "CONFIRMED_LOCAL_CASH"
              : "UNVERIFIED_OFFLINE",
          processedAt: nowIso,
        },
      ],
      syncStatus: "PENDING",
      createdAt: nowIso,
    };

    const stockMovements: LocalInventoryMovementRecord[] = rawItems.map(
      (it: any, idx: number) => ({
        localId: `mov_${order.id}_${idx}`,
        operationId: `${operationId}_mov_${idx}`,
        companyId: order.companyId,
        storeId,
        deviceId,
        marketplaceListingId: it.marketplaceListingId || it.id,
        productId: it.productId || null,
        productName: it.name || "POS Item",
        delta: -Math.abs(Number(it.quantity || 1)),
        movementType: "POS_SALE",
        reason: `Offline POS Sale ${order.localTrackingNumber}`,
        syncStatus: "PENDING",
        createdAt: nowIso,
      })
    );

    await storage.commitOfflineSaleAtomically({
      order: localOrderRecord,
      journalEntry: {
        operationId,
        deviceId,
        companyId: order.companyId,
        storeId,
        operatorId: order.payload?.operatorId,
        entityType: "SALE",
        entityLocalId: order.id,
        operationType: "CREATE",
        payload: {
          ...order.payload,
          localReceiptNumber: order.localTrackingNumber,
          clientCreatedAt: nowIso,
        },
        dependencies: [],
        idempotencyKey,
        status: "PENDING",
        attemptCount: 0,
        createdAt: nowIso,
      },
      stockMovements,
    });
  } catch (err) {
    console.warn("[offlineStore] Structured atomic commit warning:", err);
  }

  // 2. Also persist in `SalesmanPro_POS_Offline.pendingOrders` and update cached product stock
  const db = await openDatabase();
  if (!db) return;

  const record: OfflinePendingOrder = {
    ...order,
    storeId,
    deviceId,
    createdAt: nowIso,
    status: "PENDING",
    retryCount: 0,
  };

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(["pendingOrders", "products"], "readwrite");
      const orderStore = tx.objectStore("pendingOrders");
      const prodStore = tx.objectStore("products");
      orderStore.put(record);

      // Update local stock projections in legacy products store
      const items = Array.isArray(order.payload?.items)
        ? order.payload.items
        : [];
      for (const item of items) {
        const listingId = item.marketplaceListingId || item.id;
        if (!listingId) continue;
        const getReq = prodStore.get(listingId);
        getReq.onsuccess = () => {
          const existingProd = getReq.result;
          if (existingProd) {
            const prevStock = Number(
              existingProd.stock ?? existingProd.quantity ?? 0
            );
            const nextStock = Math.max(
              0,
              prevStock - Number(item.quantity || 1)
            );
            prodStore.put({
              ...existingProd,
              stock: nextStock,
              quantity: nextStock,
              localEstimatedStock: nextStock,
              pendingLocalDelta:
                Number(existingProd.pendingLocalDelta || 0) -
                Number(item.quantity || 1),
            });
          }
        };
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Record an offline business expense into the local database & outbox journal
 */
export async function enqueueOfflineExpense(params: {
  companyId: string;
  storeId?: string;
  category: string;
  description: string;
  vendor?: string;
  amount: number;
  taxAmount?: number;
  paymentMethod?: string;
  notes?: string;
}): Promise<LocalExpenseRecord> {
  const { storage, journal } = getOfflineEngine(
    params.companyId,
    params.storeId
  );
  const deviceId = getDeviceId();
  const localId = `off_exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const expenseId = `EXP-${deviceId.slice(-4)}-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const record: LocalExpenseRecord = {
    localId,
    expenseId,
    companyId: params.companyId,
    storeId: params.storeId,
    deviceId,
    category: params.category || "Operations",
    description: params.description,
    vendor: params.vendor || "N/A",
    amount: Number(params.amount || 0),
    taxAmount: Number(params.taxAmount || 0),
    paymentMethod: params.paymentMethod || "CASH",
    notes: params.notes || null,
    syncStatus: "PENDING",
    createdAt: nowIso,
  };

  await storage.saveExpense(record);
  await journal.recordOperation({
    entityType: "EXPENSE",
    entityLocalId: localId,
    operationType: "CREATE",
    payload: record,
  });

  return record;
}

/**
 * Record an offline stock adjustment / movement into the local database & outbox journal
 */
export async function enqueueOfflineInventoryMovement(params: {
  companyId: string;
  storeId?: string;
  marketplaceListingId: string;
  productId?: string | null;
  productName: string;
  delta: number;
  movementType:
    | "RESTOCK"
    | "DAMAGE_WRITE_OFF"
    | "STOCK_ADJUSTMENT"
    | "ORDER_RETURN";
  reason?: string;
}): Promise<LocalInventoryMovementRecord> {
  const { storage, journal } = getOfflineEngine(
    params.companyId,
    params.storeId
  );
  const deviceId = getDeviceId();
  const localId = `off_mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();

  const opEntry = await journal.recordOperation({
    entityType: "INVENTORY_MOVEMENT",
    entityLocalId: localId,
    operationType: "ACTION",
    payload: {
      marketplaceListingId: params.marketplaceListingId,
      productId: params.productId || null,
      delta: params.delta,
      movementType: params.movementType,
      reason: params.reason || `Offline ${params.movementType}`,
    },
  });

  const movRecord: LocalInventoryMovementRecord = {
    localId,
    operationId: opEntry.operationId,
    companyId: params.companyId,
    storeId: params.storeId,
    deviceId,
    marketplaceListingId: params.marketplaceListingId,
    productId: params.productId || null,
    productName: params.productName,
    delta: params.delta,
    movementType: params.movementType,
    reason: params.reason || null,
    syncStatus: "PENDING",
    createdAt: nowIso,
  };

  await storage.saveInventoryMovement(movRecord);
  return movRecord;
}

/**
 * Retrieve all pending offline orders
 */
export async function getPendingOfflineOrders(
  companyId?: string
): Promise<OfflinePendingOrder[]> {
  const db = await openDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("pendingOrders", "readonly");
      const store = tx.objectStore("pendingOrders");
      const request = store.getAll();

      request.onsuccess = () => {
        const all: OfflinePendingOrder[] = request.result || [];
        if (companyId) {
          resolve(
            all.filter((o) => o.companyId === companyId && o.status !== "SYNCED")
          );
        } else {
          resolve(all.filter((o) => o.status !== "SYNCED"));
        }
      };
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Count pending offline orders
 */
export async function getPendingOrdersCount(
  companyId?: string
): Promise<number> {
  const list = await getPendingOfflineOrders(companyId);
  return list.length;
}

/**
 * Remove or mark an offline order as synced
 */
export async function removeOfflineOrder(orderId: string): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("pendingOrders", "readwrite");
      const store = tx.objectStore("pendingOrders");
      store.delete(orderId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Enqueue a print job to the local offline spooler
 */
export async function enqueueOfflinePrintJob(
  payload: NormalizedPrintPayload,
  htmlFallback?: string
): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  const job: OfflinePrintJob = {
    id: payload.jobId,
    payload,
    htmlFallback,
    createdAt: new Date().toISOString(),
    printed: false,
    status: "QUEUED",
    reprintCount: payload.document?.reprintCount || 0,
  };

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("printSpooler", "readwrite");
      const store = tx.objectStore("printSpooler");
      store.put(job);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieve all durable print jobs from the local spooler
 */
export async function getOfflinePrintJobs(): Promise<OfflinePrintJob[]> {
  const db = await openDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("printSpooler", "readonly");
      const store = tx.objectStore("printSpooler");
      const req = store.getAll();
      req.onsuccess = () => {
        const list: OfflinePrintJob[] = req.result || [];
        resolve(
          list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Retry or reprint a durable print job without duplicating the underlying sale
 */
export async function retryOfflinePrintJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const jobs = await getOfflinePrintJobs();
  const target = jobs.find((j) => j.id === jobId);
  if (!target) {
    return { success: false, error: "Print job not found in local queue" };
  }

  const nextReprintCount = (target.reprintCount || 0) + 1;
  const reprintPayload: NormalizedPrintPayload = {
    ...target.payload,
    isReprint: true,
    document: {
      ...target.payload.document,
      reprintCount: nextReprintCount,
    },
  };

  const printResult = await executeUnifiedPrint(
    reprintPayload,
    target.htmlFallback
  );

  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction("printSpooler", "readwrite");
        const store = tx.objectStore("printSpooler");
        store.put({
          ...target,
          printed: printResult.success,
          status: printResult.success ? "COMPLETED" : "REQUIRES_ATTENTION",
          reprintCount: nextReprintCount,
          error: printResult.error,
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  return {
    success: printResult.success,
    error: printResult.error,
  };
}

/**
 * Synchronize all pending offline operations (sales, customers, inventory movements, expenses)
 * using the Unified Synchronization Protocol (/api/sync/push + /api/sync/pull)
 */
export async function syncPendingOrdersToCloud(
  companyId: string,
  onOrderSynced?: (orderId: string, remoteData: any) => void,
  storeId?: string
): Promise<{
  synced: number;
  failed: number;
  errors: { orderId: string; error: string }[];
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      synced: 0,
      failed: 0,
      errors: [{ orderId: "NETWORK", error: "Device is currently offline" }],
    };
  }

  const deviceId = getDeviceId();
  const pending = await getPendingOfflineOrders(companyId);

  let synced = 0;
  let failed = 0;
  const errors: { orderId: string; error: string }[] = [];

  if (pending.length > 0) {
    try {
      // Push all pending orders as an idempotent batch to /api/sync/push
      const operations = pending.map((order) => ({
        operationId: `OP_${order.id}`,
        idempotencyKey:
          order.payload?.idempotencyKey ||
          `${deviceId}:${order.localTrackingNumber || order.id}`,
        entityType: "SALE",
        entityLocalId: order.id,
        operationType: "CREATE",
        companyId: order.companyId,
        storeId: order.storeId || storeId || `store_${companyId}`,
        deviceId: order.deviceId || deviceId,
        clientTimestamp: order.createdAt,
        payload: {
          ...order.payload,
          localReceiptNumber: order.localTrackingNumber,
          clientCreatedAt: order.createdAt,
        },
      }));

      const res = await fetch("/api/sync/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-POS-Device-Id": deviceId,
          "X-POS-Company-Id": companyId,
          ...(storeId ? { "X-POS-Store-Id": storeId } : {}),
        },
        body: JSON.stringify({
          companyId,
          storeId: storeId || `store_${companyId}`,
          deviceId,
          batchId: `batch_${Date.now()}`,
          operations,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success && Array.isArray(json.results)) {
        const { journal, storage } = getOfflineEngine(companyId, storeId);
        for (const r of json.results) {
          const matchingOrder = pending.find(
            (o) => `OP_${o.id}` === r.operationId || o.id === r.operationId
          );
          if (!matchingOrder) continue;

          if (r.status === "SUCCESS" || r.status === "APPLIED" || r.status === "APPLIED_WITH_WARNING") {
            await removeOfflineOrder(matchingOrder.id);
            await journal
              .markSynced(r.operationId, {
                serverEntityId: r.serverEntityId,
                serverRevision: json.headSequence,
              })
              .catch(() => null);
            const storedOrd = await storage.getOrder(matchingOrder.id);
            if (storedOrd) {
              storedOrd.syncStatus = "SYNCED";
              storedOrd.serverId = r.serverEntityId;
              storedOrd.trackingNumber =
                r.trackingNumber || storedOrd.trackingNumber;
              storedOrd.syncedAt = new Date().toISOString();
              await storage.saveOrder(storedOrd);
            }
            synced++;
            if (onOrderSynced) {
              onOrderSynced(matchingOrder.id, {
                id: r.serverEntityId,
                trackingNumber: r.trackingNumber,
                warnings: r.warnings,
              });
            }
          } else {
            failed++;
            errors.push({
              orderId: matchingOrder.id,
              error: r.error || "Failed to synchronize transaction",
            });
          }
        }
      } else {
        // Fallback to individual /api/shop/orders submission if batch endpoint returned error
        for (const order of pending) {
          try {
            const singleRes = await fetch("/api/shop/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...order.payload,
                idempotencyKey:
                  order.payload?.idempotencyKey ||
                  `${deviceId}:${order.localTrackingNumber || order.id}`,
                trackingNumber: order.localTrackingNumber,
                _offlineSync: true,
                _localTrackingNumber: order.localTrackingNumber,
                _offlineCreatedAt: order.createdAt,
              }),
            });
            const singleJson = await singleRes.json().catch(() => ({}));
            if (singleRes.ok && singleJson.success) {
              await removeOfflineOrder(order.id);
              synced++;
              if (onOrderSynced) onOrderSynced(order.id, singleJson.data);
            } else {
              failed++;
              errors.push({
                orderId: order.id,
                error: singleJson.error || `HTTP ${singleRes.status}`,
              });
            }
          } catch (singleErr: any) {
            failed++;
            errors.push({
              orderId: order.id,
              error: singleErr?.message || "Network error",
            });
          }
        }
      }
    } catch (err: any) {
      failed += pending.length;
      errors.push({
        orderId: "BATCH",
        error: err?.message || "Network request failed",
      });
    }
  }

  // Also sync any non-order journal entries (customers, expenses, inventory movements) & pull incremental changes
  try {
    const { syncClient } = getOfflineEngine(companyId, storeId);
    const journalSummary = await syncClient.syncPending();
    synced += journalSummary.succeeded;
    failed += journalSummary.failed;
    await syncClient.pullIncrementalChanges().catch(() => null);
  } catch {
    // Non-blocking background sync
  }

  return { synced, failed, errors };
}

/**
 * Returns a complete snapshot of local database health, pending queues, and print spooler status
 * for the POS Sync & Print Center Drawer.
 */
export async function getOfflineSyncOverview(
  companyId: string,
  storeId?: string
): Promise<OfflineSyncOverview> {
  const { storage } = getOfflineEngine(companyId, storeId);
  const deviceId = getDeviceId();

  const [
    pendingOrders,
    printJobs,
    journalEntries,
    movements,
    expenses,
    syncMeta,
  ] = await Promise.all([
    getPendingOfflineOrders(companyId),
    getOfflinePrintJobs(),
    storage.getAllJournalEntries(),
    storage.getAllInventoryMovements(),
    storage.getAllExpenses(),
    storage.getSyncMetadata(),
  ]);

  const pendingJournal = journalEntries.filter((j) => j.status === "PENDING");
  const failedJournal = journalEntries.filter((j) => j.status === "FAILED");
  const conflictJournal = journalEntries.filter((j) => j.status === "CONFLICT");

  return {
    deviceId,
    companyId,
    storeId: storeId || `store_${companyId}`,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSyncAt: syncMeta?.lastSyncAt || null,
    cursor: syncMeta?.cursor || 0,
    pendingTransactionsCount: Math.max(
      pendingOrders.length,
      pendingJournal.filter(
        (j) => j.entityType === "SALE" || j.entityType === "ORDER"
      ).length
    ),
    pendingInventoryMovementsCount: movements.filter(
      (m) => m.syncStatus === "PENDING"
    ).length,
    pendingExpensesCount: expenses.filter((e) => e.syncStatus === "PENDING")
      .length,
    failedOperationsCount: failedJournal.length,
    conflictOperationsCount: conflictJournal.length,
    pendingPrintJobsCount: printJobs.filter((p) => !p.printed).length,
    failedPrintJobsCount: printJobs.filter(
      (p) => p.status === "FAILED" || p.status === "REQUIRES_ATTENTION"
    ).length,
    localDbHealth: failedJournal.length > 5 ? "DEGRADED" : "HEALTHY",
    offlineStockPolicy: syncMeta?.offlineStockPolicy || "CONTROLLED",
    pendingOrders,
    printJobs: printJobs.slice(0, 25),
    journalOperations: journalEntries.slice(0, 50),
  };
}

/**
 * Exports a non-destructive diagnostic JSON bundle for support/administrator review.
 */
export async function exportSyncDiagnosticsBundle(
  companyId: string,
  storeId?: string
): Promise<string> {
  const overview = await getOfflineSyncOverview(companyId, storeId);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      protocolVersion: 1,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      overview,
    },
    null,
    2
  );
}
