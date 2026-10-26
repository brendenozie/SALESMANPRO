"use strict";
/**
 * SalesmanPro POS Offline Store & Local Spooler Queue
 * Powered by IndexedDB for uninterrupted sales processing, local receipt printing,
 * and automatic cloud synchronization when network connectivity returns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPendingOrdersToCloud = exports.enqueueOfflinePrintJob = exports.removeOfflineOrder = exports.getPendingOrdersCount = exports.getPendingOfflineOrders = exports.enqueueOfflineOrder = exports.getCachedProductsOffline = exports.cacheProductsOffline = void 0;
const DB_NAME = "SalesmanPro_POS_Offline";
const DB_VERSION = 1;
function openDatabase() {
    return new Promise((resolve) => {
        if (typeof window === "undefined" || !("indexedDB" in window)) {
            resolve(null);
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
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
async function cacheProductsOffline(companyId, products) {
    const db = await openDatabase();
    if (!db)
        return;
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
    }
    catch (err) {
        console.warn("[offlineStore] Cache products error:", err);
    }
}
exports.cacheProductsOffline = cacheProductsOffline;
/**
 * Get all cached products for a company
 */
async function getCachedProductsOffline(companyId) {
    const db = await openDatabase();
    if (!db)
        return [];
    return new Promise((resolve) => {
        try {
            const tx = db.transaction("products", "readonly");
            const store = tx.objectStore("products");
            const index = store.index("companyId");
            const request = index.getAll(companyId);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        }
        catch {
            resolve([]);
        }
    });
}
exports.getCachedProductsOffline = getCachedProductsOffline;
/**
 * Enqueue an order that was completed while offline
 */
async function enqueueOfflineOrder(order) {
    const db = await openDatabase();
    if (!db)
        return;
    const record = {
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
        }
        catch {
            resolve();
        }
    });
}
exports.enqueueOfflineOrder = enqueueOfflineOrder;
/**
 * Retrieve all pending offline orders
 */
async function getPendingOfflineOrders(companyId) {
    const db = await openDatabase();
    if (!db)
        return [];
    return new Promise((resolve) => {
        try {
            const tx = db.transaction("pendingOrders", "readonly");
            const store = tx.objectStore("pendingOrders");
            const request = store.getAll();
            request.onsuccess = () => {
                const all = request.result || [];
                if (companyId) {
                    resolve(all.filter((o) => o.companyId === companyId && o.status !== "SYNCED"));
                }
                else {
                    resolve(all.filter((o) => o.status !== "SYNCED"));
                }
            };
            request.onerror = () => resolve([]);
        }
        catch {
            resolve([]);
        }
    });
}
exports.getPendingOfflineOrders = getPendingOfflineOrders;
/**
 * Count pending offline orders
 */
async function getPendingOrdersCount(companyId) {
    const list = await getPendingOfflineOrders(companyId);
    return list.length;
}
exports.getPendingOrdersCount = getPendingOrdersCount;
/**
 * Remove or mark an offline order as synced
 */
async function removeOfflineOrder(orderId) {
    const db = await openDatabase();
    if (!db)
        return;
    return new Promise((resolve) => {
        try {
            const tx = db.transaction("pendingOrders", "readwrite");
            const store = tx.objectStore("pendingOrders");
            store.delete(orderId);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        }
        catch {
            resolve();
        }
    });
}
exports.removeOfflineOrder = removeOfflineOrder;
/**
 * Enqueue a print job to the local offline spooler
 */
async function enqueueOfflinePrintJob(payload, htmlFallback) {
    const db = await openDatabase();
    if (!db)
        return;
    const job = {
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
        }
        catch {
            resolve();
        }
    });
}
exports.enqueueOfflinePrintJob = enqueueOfflinePrintJob;
/**
 * Synchronize all pending offline orders back to cloud
 */
async function syncPendingOrdersToCloud(companyId, onOrderSynced) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        return { synced: 0, failed: 0, errors: [{ orderId: "NETWORK", error: "Device is currently offline" }] };
    }
    const pending = await getPendingOfflineOrders(companyId);
    if (pending.length === 0) {
        return { synced: 0, failed: 0, errors: [] };
    }
    let synced = 0;
    let failed = 0;
    const errors = [];
    for (const order of pending) {
        try {
            const res = await fetch("/api/shop/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...order.payload,
                    idempotencyKey: order.localTrackingNumber || order.id,
                    trackingNumber: order.localTrackingNumber,
                    _offlineSync: true,
                    _localTrackingNumber: order.localTrackingNumber,
                    _offlineCreatedAt: order.createdAt,
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.success) {
                await removeOfflineOrder(order.id);
                synced++;
                if (onOrderSynced)
                    onOrderSynced(order.id, json.data);
            }
            else {
                failed++;
                errors.push({ orderId: order.id, error: json.error || `HTTP ${res.status}` });
            }
        }
        catch (err) {
            failed++;
            errors.push({ orderId: order.id, error: err?.message || "Network request failed" });
        }
    }
    return { synced, failed, errors };
}
exports.syncPendingOrdersToCloud = syncPendingOrdersToCloud;
