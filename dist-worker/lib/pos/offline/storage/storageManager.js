"use strict";
/**
 * lib/pos/offline/storage/storageManager.ts
 *
 * Universal Persistent Storage Layer for SalesmanPro Shared POS Offline Engine.
 * Implements native IndexedDB in browser, PWA, Android WebView, and WebView2 desktop environments,
 * with native SQLite mirroring via AndroidBridge / chrome.webview when running inside native shells,
 * and an in-memory concurrent fallback for Node.js test runners and SSR execution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSStorageManager = void 0;
const DB_VERSION = 2;
class InMemoryStore {
    stores = new Map();
    constructor() {
        this.stores.set("products", new Map());
        this.stores.set("orders", new Map());
        this.stores.set("receipts", new Map());
        this.stores.set("customers", new Map());
        this.stores.set("journal", new Map());
        this.stores.set("sessions", new Map());
        this.stores.set("device", new Map());
        this.stores.set("expenses", new Map());
        this.stores.set("inventory_movements", new Map());
        this.stores.set("sync_meta", new Map());
    }
    async put(storeName, key, val) {
        if (!this.stores.has(storeName)) {
            this.stores.set(storeName, new Map());
        }
        this.stores.get(storeName).set(key, val);
    }
    async get(storeName, key) {
        const store = this.stores.get(storeName);
        return store?.get(key) || null;
    }
    async getAll(storeName) {
        const store = this.stores.get(storeName);
        return store ? Array.from(store.values()) : [];
    }
    async delete(storeName, key) {
        const store = this.stores.get(storeName);
        store?.delete(key);
    }
    async clear(storeName) {
        const store = this.stores.get(storeName);
        store?.clear();
    }
}
function mirrorToNativeShell(type, payload) {
    if (typeof window === "undefined")
        return;
    try {
        const w = window;
        if (w.AndroidBridge && typeof w.AndroidBridge.postMessage === "function") {
            w.AndroidBridge.postMessage(JSON.stringify({ type, payload }));
        }
        else if (w.chrome?.webview && typeof w.chrome.webview.postMessage === "function") {
            w.chrome.webview.postMessage({ type, payload });
        }
    }
    catch {
        // Non-blocking native mirror
    }
}
class POSStorageManager {
    companyId;
    storeId;
    dbName;
    memoryFallback = null;
    idbInstance = null;
    constructor(companyId = "default", storeId = "default") {
        this.companyId = companyId || "default";
        this.storeId = storeId || "default";
        this.dbName = `salesmanpro_pos_${this.companyId}_${this.storeId}`;
        if (typeof window === "undefined" || !window.indexedDB) {
            this.memoryFallback = new InMemoryStore();
        }
    }
    async openDB() {
        if (this.memoryFallback)
            return null;
        if (this.idbInstance)
            return this.idbInstance;
        return new Promise((resolve) => {
            const request = window.indexedDB.open(this.dbName, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("products")) {
                    const store = db.createObjectStore("products", { keyPath: "id" });
                    store.createIndex("name", "name", { unique: false });
                    store.createIndex("barcode", "barcode", { unique: false });
                    store.createIndex("sku", "sku", { unique: false });
                    store.createIndex("categoryId", "categoryId", { unique: false });
                }
                if (!db.objectStoreNames.contains("orders")) {
                    const store = db.createObjectStore("orders", { keyPath: "localId" });
                    store.createIndex("syncStatus", "syncStatus", { unique: false });
                    store.createIndex("createdAt", "createdAt", { unique: false });
                    store.createIndex("localReceiptNumber", "localReceiptNumber", { unique: false });
                }
                if (!db.objectStoreNames.contains("receipts")) {
                    const store = db.createObjectStore("receipts", { keyPath: "id" });
                    store.createIndex("orderLocalId", "orderLocalId", { unique: false });
                    store.createIndex("receiptNumber", "receiptNumber", { unique: false });
                }
                if (!db.objectStoreNames.contains("customers")) {
                    const store = db.createObjectStore("customers", { keyPath: "localId" });
                    store.createIndex("phone", "phone", { unique: false });
                    store.createIndex("email", "email", { unique: false });
                    store.createIndex("name", "name", { unique: false });
                }
                if (!db.objectStoreNames.contains("journal")) {
                    const store = db.createObjectStore("journal", { keyPath: "operationId" });
                    store.createIndex("status", "status", { unique: false });
                    store.createIndex("createdAt", "createdAt", { unique: false });
                }
                if (!db.objectStoreNames.contains("sessions")) {
                    db.createObjectStore("sessions", { keyPath: "localId" });
                }
                if (!db.objectStoreNames.contains("device")) {
                    db.createObjectStore("device", { keyPath: "deviceId" });
                }
                if (!db.objectStoreNames.contains("expenses")) {
                    const store = db.createObjectStore("expenses", { keyPath: "localId" });
                    store.createIndex("syncStatus", "syncStatus", { unique: false });
                    store.createIndex("createdAt", "createdAt", { unique: false });
                }
                if (!db.objectStoreNames.contains("inventory_movements")) {
                    const store = db.createObjectStore("inventory_movements", { keyPath: "localId" });
                    store.createIndex("marketplaceListingId", "marketplaceListingId", { unique: false });
                    store.createIndex("syncStatus", "syncStatus", { unique: false });
                }
                if (!db.objectStoreNames.contains("sync_meta")) {
                    db.createObjectStore("sync_meta", { keyPath: "key" });
                }
            };
            request.onsuccess = () => {
                this.idbInstance = request.result;
                resolve(this.idbInstance);
            };
            request.onerror = () => {
                console.warn(`[POS_IDB] Failed to open IndexedDB, falling back to memory`);
                this.memoryFallback = new InMemoryStore();
                resolve(null);
            };
        });
    }
    // --------------------------------------------------------------------------
    // ATOMIC TRANSCATION OUTBOX COMMIT FOR SALES
    // --------------------------------------------------------------------------
    /**
     * Commits a sale (`orders`), its outbox operation (`journal`), local stock deductions (`products` + `inventory_movements`),
     * and optional receipt (`receipts`) atomically in a single IndexedDB transaction, and mirrors to the native Android/WPF SQLite bridge.
     */
    async commitOfflineSaleAtomically(params) {
        const { order, journalEntry, receipt, stockMovements = [] } = params;
        if (this.memoryFallback) {
            await this.memoryFallback.put("orders", order.localId, order);
            await this.memoryFallback.put("journal", journalEntry.operationId, journalEntry);
            if (receipt) {
                await this.memoryFallback.put("receipts", receipt.id, receipt);
            }
            for (const mov of stockMovements) {
                await this.memoryFallback.put("inventory_movements", mov.localId, mov);
                const prod = await this.memoryFallback.get("products", mov.marketplaceListingId);
                if (prod) {
                    const nextStock = Math.max(0, (prod.localStockQuantity || 0) + mov.delta);
                    await this.memoryFallback.put("products", prod.id, {
                        ...prod,
                        localStockQuantity: nextStock,
                        pendingLocalDelta: (prod.pendingLocalDelta || 0) + mov.delta,
                        updatedAt: new Date().toISOString(),
                    });
                }
            }
            mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", {
                order,
                journalEntry,
                receipt,
                stockMovements,
            });
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("orders", order.localId, order);
            await this.memoryFallback.put("journal", journalEntry.operationId, journalEntry);
            return;
        }
        await new Promise((resolve, reject) => {
            const storeNames = ["orders", "journal", "products", "inventory_movements"];
            if (receipt)
                storeNames.push("receipts");
            const tx = db.transaction(storeNames, "readwrite");
            tx.objectStore("orders").put(order);
            tx.objectStore("journal").put(journalEntry);
            if (receipt) {
                tx.objectStore("receipts").put(receipt);
            }
            const movStore = tx.objectStore("inventory_movements");
            const prodStore = tx.objectStore("products");
            for (const mov of stockMovements) {
                movStore.put(mov);
                const getReq = prodStore.get(mov.marketplaceListingId);
                getReq.onsuccess = () => {
                    const prod = getReq.result;
                    if (prod) {
                        const nextStock = Math.max(0, (prod.localStockQuantity || 0) + mov.delta);
                        prodStore.put({
                            ...prod,
                            localStockQuantity: nextStock,
                            pendingLocalDelta: (prod.pendingLocalDelta || 0) + mov.delta,
                            updatedAt: new Date().toISOString(),
                        });
                    }
                };
            }
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", {
            order,
            journalEntry,
            receipt,
            stockMovements,
        });
    }
    // --------------------------------------------------------------------------
    // PRODUCTS / CATALOG
    // --------------------------------------------------------------------------
    async saveProduct(product) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("products", product.id, product);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("products", product.id, product);
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = db.transaction("products", "readwrite");
            const store = tx.objectStore("products");
            store.put(product);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async deleteProduct(productId) {
        if (this.memoryFallback) {
            await this.memoryFallback.delete("products", productId);
            return;
        }
        const db = await this.openDB();
        if (!db)
            return;
        return new Promise((resolve, reject) => {
            const tx = db.transaction("products", "readwrite");
            tx.objectStore("products").delete(productId);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async bulkSaveProducts(products) {
        if (products.length === 0)
            return;
        if (this.memoryFallback) {
            for (const p of products) {
                await this.memoryFallback.put("products", p.id, p);
            }
            return;
        }
        const db = await this.openDB();
        if (!db) {
            for (const p of products) {
                await this.memoryFallback.put("products", p.id, p);
            }
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = db.transaction("products", "readwrite");
            const store = tx.objectStore("products");
            for (const p of products) {
                store.put(p);
            }
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async getProduct(id) {
        if (this.memoryFallback) {
            return this.memoryFallback.get("products", id);
        }
        return this.getFromStore("products", id);
    }
    async searchProducts(query, categoryId) {
        const all = this.memoryFallback
            ? await this.memoryFallback.getAll("products")
            : await this.getAllFromStore("products");
        const cleanQuery = query.trim().toLowerCase();
        return all.filter((p) => {
            if (p.deletedAt)
                return false;
            const matchesCat = !categoryId || categoryId === "all" || p.categoryId === categoryId;
            if (!matchesCat)
                return false;
            if (!cleanQuery)
                return true;
            return (p.name.toLowerCase().includes(cleanQuery) ||
                (p.barcode && p.barcode.toLowerCase().includes(cleanQuery)) ||
                (p.sku && p.sku.toLowerCase().includes(cleanQuery)));
        });
    }
    // --------------------------------------------------------------------------
    // ORDERS
    // --------------------------------------------------------------------------
    async saveOrder(order) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("orders", order.localId, order);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("orders", order.localId, order);
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = db.transaction("orders", "readwrite");
            const store = tx.objectStore("orders");
            store.put(order);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async getOrder(localId) {
        if (this.memoryFallback) {
            return this.memoryFallback.get("orders", localId);
        }
        return this.getFromStore("orders", localId);
    }
    async getAllOrders() {
        if (this.memoryFallback) {
            return this.memoryFallback.getAll("orders");
        }
        return this.getAllFromStore("orders");
    }
    // --------------------------------------------------------------------------
    // EXPENSES & INVENTORY MOVEMENTS
    // --------------------------------------------------------------------------
    async saveExpense(expense) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("expenses", expense.localId, expense);
            return;
        }
        const db = await this.openDB();
        if (!db)
            return;
        return new Promise((resolve, reject) => {
            const tx = db.transaction("expenses", "readwrite");
            tx.objectStore("expenses").put(expense);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async getAllExpenses() {
        if (this.memoryFallback) {
            return this.memoryFallback.getAll("expenses");
        }
        return this.getAllFromStore("expenses");
    }
    async saveInventoryMovement(mov) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("inventory_movements", mov.localId, mov);
            return;
        }
        const db = await this.openDB();
        if (!db)
            return;
        return new Promise((resolve, reject) => {
            const tx = db.transaction("inventory_movements", "readwrite");
            tx.objectStore("inventory_movements").put(mov);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async getAllInventoryMovements() {
        if (this.memoryFallback) {
            return this.memoryFallback.getAll("inventory_movements");
        }
        return this.getAllFromStore("inventory_movements");
    }
    // --------------------------------------------------------------------------
    // SYNC METADATA & CURSOR STATE
    // --------------------------------------------------------------------------
    async getSyncMetadata() {
        if (this.memoryFallback) {
            return this.memoryFallback.get("sync_meta", "sync_state");
        }
        return this.getFromStore("sync_meta", "sync_state");
    }
    async saveSyncMetadata(meta) {
        const payload = { ...meta, key: "sync_state" };
        if (this.memoryFallback) {
            await this.memoryFallback.put("sync_meta", "sync_state", payload);
            return;
        }
        const db = await this.openDB();
        if (!db)
            return;
        return new Promise((resolve, reject) => {
            const tx = db.transaction("sync_meta", "readwrite");
            tx.objectStore("sync_meta").put(payload);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    // --------------------------------------------------------------------------
    // RECEIPTS
    // --------------------------------------------------------------------------
    async saveReceipt(receipt) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("receipts", receipt.id, receipt);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("receipts", receipt.id, receipt);
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = db.transaction("receipts", "readwrite");
            const store = tx.objectStore("receipts");
            store.put(receipt);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async getReceiptByOrder(orderLocalId) {
        const all = this.memoryFallback
            ? await this.memoryFallback.getAll("receipts")
            : await this.getAllFromStore("receipts");
        return all.find((r) => r.orderLocalId === orderLocalId) || null;
    }
    async getAllReceipts() {
        if (this.memoryFallback) {
            return this.memoryFallback.getAll("receipts");
        }
        return this.getAllFromStore("receipts");
    }
    // --------------------------------------------------------------------------
    // CUSTOMERS
    // --------------------------------------------------------------------------
    async saveCustomer(customer) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("customers", customer.localId, customer);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("customers", customer.localId, customer);
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = db.transaction("customers", "readwrite");
            const store = tx.objectStore("customers");
            store.put(customer);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async searchCustomers(query) {
        const all = this.memoryFallback
            ? await this.memoryFallback.getAll("customers")
            : await this.getAllFromStore("customers");
        const clean = query.trim().toLowerCase();
        if (!clean)
            return all.slice(0, 50);
        return all
            .filter((c) => c.localId === query ||
            c.serverId === query ||
            c.name.toLowerCase().includes(clean) ||
            c.phone.includes(clean) ||
            c.email.toLowerCase().includes(clean))
            .slice(0, 50);
    }
    // --------------------------------------------------------------------------
    // TRANSACTION OUTBOX JOURNAL
    // --------------------------------------------------------------------------
    async appendJournal(entry) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("journal", entry.operationId, entry);
            mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", { journalEntry: entry });
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("journal", entry.operationId, entry);
            return;
        }
        await new Promise((resolve, reject) => {
            const tx = db.transaction("journal", "readwrite");
            const store = tx.objectStore("journal");
            store.put(entry);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", { journalEntry: entry });
    }
    async getAllJournalEntries() {
        return this.memoryFallback
            ? this.memoryFallback.getAll("journal")
            : this.getAllFromStore("journal");
    }
    async getPendingJournalEntries() {
        const all = await this.getAllJournalEntries();
        return all
            .filter((e) => e.status === "PENDING" || e.status === "FAILED")
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async updateJournalStatus(operationId, status, meta) {
        const existing = this.memoryFallback
            ? await this.memoryFallback.get("journal", operationId)
            : await this.getFromStore("journal", operationId);
        if (!existing)
            return;
        const updated = {
            ...existing,
            status,
            ...meta,
        };
        if (this.memoryFallback) {
            await this.memoryFallback.put("journal", operationId, updated);
            mirrorToNativeShell("UPDATE_OFFLINE_OUTBOX", { journalEntry: updated });
            return;
        }
        const db = await this.openDB();
        if (!db)
            return;
        await new Promise((resolve, reject) => {
            const tx = db.transaction("journal", "readwrite");
            const store = tx.objectStore("journal");
            store.put(updated);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        mirrorToNativeShell("UPDATE_OFFLINE_OUTBOX", { journalEntry: updated });
    }
    async getAllFromStore(storeName) {
        const db = await this.openDB();
        if (!db)
            return [];
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }
    async getFromStore(storeName, key) {
        const db = await this.openDB();
        if (!db)
            return null;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }
}
exports.POSStorageManager = POSStorageManager;
