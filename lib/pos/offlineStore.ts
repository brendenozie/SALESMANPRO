/**
 * SalesmanPro POS Offline Store & Local Spooler Queue
 * Powered by IndexedDB for uninterrupted sales processing, local receipt printing,
 * and automatic cloud synchronization when network connectivity returns.
 */

import { NormalizedPrintPayload, executeUnifiedPrint } from "@/lib/printing/unifiedPrintClient";

const DB_NAME = "SalesmanPro_POS_Offline";
const DB_VERSION = 1;

export interface OfflinePendingOrder {
  id: string; // e.g. "off_ord_17182938493_xyz"
  localTrackingNumber: string;
  companyId: string;
  payload: any;
  receiptData: any;
  createdAt: string;
  status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  retryCount: number;
  lastError?: string;
}

export interface OfflinePrintJob {
  id: string; // jobId
  payload: NormalizedPrintPayload;
  htmlFallback?: string;
  createdAt: string;
  printed: boolean;
  error?: string;
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

      // 1. Products Store
      if (!db.objectStoreNames.contains("products")) {
        const productStore = db.createObjectStore("products", { keyPath: "id" });
        productStore.createIndex("companyId", "companyId", { unique: false });
        productStore.createIndex("name", "name", { unique: false });
        productStore.createIndex("sku", "sku", { unique: false });
      }

      // 2. Pending Orders Store
      if (!db.objectStoreNames.contains("pendingOrders")) {
        const orderStore = db.createObjectStore("pendingOrders", { keyPath: "id" });
        orderStore.createIndex("companyId", "companyId", { unique: false });
        orderStore.createIndex("status", "status", { unique: false });
        orderStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // 3. Local Print Spooler Store
      if (!db.objectStoreNames.contains("printSpooler")) {
        const spoolerStore = db.createObjectStore("printSpooler", { keyPath: "id" });
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
export async function cacheProductsOffline(companyId: string, products: any[]): Promise<void> {
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
export async function getCachedProductsOffline(companyId: string): Promise<any[]> {
  const db = await openDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
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
}

/**
 * Enqueue an order that was completed while offline
 */
export async function enqueueOfflineOrder(order: {
  id: string;
  localTrackingNumber: string;
  companyId: string;
  payload: any;
  receiptData: any;
}): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  const record: OfflinePendingOrder = {
    ...order,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    retryCount: 0,
  };

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("pendingOrders", "readwrite");
      const store = tx.objectStore("pendingOrders");
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieve all pending offline orders
 */
export async function getPendingOfflineOrders(companyId?: string): Promise<OfflinePendingOrder[]> {
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
          resolve(all.filter((o) => o.companyId === companyId && o.status !== "SYNCED"));
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
export async function getPendingOrdersCount(companyId?: string): Promise<number> {
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
 * Synchronize all pending offline orders back to cloud
 */
export async function syncPendingOrdersToCloud(
  companyId: string,
  onOrderSynced?: (orderId: string, remoteData: any) => void
): Promise<{
  synced: number;
  failed: number;
  errors: { orderId: string; error: string }[];
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, failed: 0, errors: [{ orderId: "NETWORK", error: "Device is currently offline" }] };
  }

  const pending = await getPendingOfflineOrders(companyId);
  if (pending.length === 0) {
    return { synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors: { orderId: string; error: string }[] = [];

  for (const order of pending) {
    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order.payload,
          _offlineSync: true,
          _localTrackingNumber: order.localTrackingNumber,
          _offlineCreatedAt: order.createdAt,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        await removeOfflineOrder(order.id);
        synced++;
        if (onOrderSynced) onOrderSynced(order.id, json.data);
      } else {
        failed++;
        errors.push({ orderId: order.id, error: json.error || `HTTP ${res.status}` });
      }
    } catch (err: any) {
      failed++;
      errors.push({ orderId: order.id, error: err?.message || "Network request failed" });
    }
  }

  return { synced, failed, errors };
}
